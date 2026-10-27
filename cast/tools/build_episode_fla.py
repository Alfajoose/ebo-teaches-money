"""Build an Adobe Animate .fla for an Ebo Teaches Money episode.

usage: python3 -I build_episode_fla.py CAPTURE.json BG_DIR CAST_SRC_DIR OUT.fla WORK_DIR [SVG_DIR]

BG_DIR is only used for captures made before backgrounds were captured as vectors; pass -
otherwise. SVG_DIR, if given, also receives every background as a standalone .svg file.

Layers on the main timeline (top → bottom):
  Captions     editable text in caption pills (one graphic symbol per caption chunk)
  Graphics     titles / lesson cards / numbers as editable vector symbols + text, keyed
  Props front  props drawn over the cast (things the characters hold)
  <cast>       one layer per character; each plays its own animated rig symbol
  Props        every other prop (vending machines, crates, cans, calendars …) as editable
               vector symbols in the hand-drawn style, one symbol per look, moved by keys
  Background   the set only, as editable vector symbols (one per set/framing, held
               while unchanged). Older captures fall back to JPEG frames from BG_DIR,
               rendered with --props='{"layer":"set"}' so props aren't baked in

Each character's animated symbol ("<Name>/<Name> – <Episode>") is a copy of the user's own
rig with keyframes on every layer: rotation/position only, eye & mouth frame swaps.
"""
import sys, os, json, math, re, copy, shutil, zipfile, time, hashlib
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import NS as XNS

NSURI = 'http://ns.adobe.com/xfl/2008/'
ET.register_namespace('', NSURI)
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')
N = lambda tag: f'{{{NSURI}}}{tag}'

CAST = {  # capture id -> (source folder, rig symbol, display name)
    'ebo': ('Ebo', 'Ebo', 'Ebo'),
    'mica': ('mica_drip', 'Obuor', 'Mica'),
    'obuor': ('obuor', 'Obuor', 'Obuor'),
    'ama': ('Ama_pretty', 'Ama port', 'Ama'),
    'christy': ('christy', 'Christy', 'Christy'),
}
LAYER_ORDER = ['ebo', 'christy', 'mica', 'ama', 'obuor']  # top → bottom
FONT_HEAVY = 'Arial-Black'
FONT_BOLD = 'Arial-BoldMT'

_id = [0x1000]
def new_id():
    _id[0] += 1
    return f'6b{int(time.time()) & 0xffffff:06x}-{_id[0]:08x}'

def fnum(v):
    s = f'{v:.4f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def matrix_el(parent, m):
    a, b, c, d, tx, ty = m
    me = ET.SubElement(ET.SubElement(parent, N('matrix')), N('Matrix'))
    for k, v, dflt in (('a', a, 1), ('b', b, 0), ('c', c, 0), ('d', d, 1), ('tx', tx, 0), ('ty', ty, 0)):
        if abs(v - dflt) > 1e-6:
            me.set(k, fnum(v))
    return me

def rkey(m):
    return tuple(round(v, 3) for v in m)

def safe_name(s):
    s = s.split('/')[-1].replace('&#032', '').strip()
    return re.sub(r'\s+', ' ', s) or 'item'

# ───────────────────────── symbol import ─────────────────────────

class Library:
    def __init__(self, work):
        self.work = Path(work)
        (self.work / 'LIBRARY').mkdir(parents=True, exist_ok=True)
        (self.work / 'bin').mkdir(parents=True, exist_ok=True)
        self.symbols = []  # (href, itemID, icon)
        self.folders = []
        self.media = []  # DOMBitmapItem elements

    def folder(self, name):
        if name not in self.folders:
            self.folders.append(name)

    def write_symbol(self, root, name, icon='1'):
        root.set('name', name)
        root.set('itemID', new_id())
        root.set('lastModified', str(int(time.time())))
        href = name + '.xml'
        p = self.work / 'LIBRARY' / href
        p.parent.mkdir(parents=True, exist_ok=True)
        ET.ElementTree(root).write(p, encoding='utf-8', xml_declaration=False)
        self.symbols.append((href, root.get('itemID'), icon))

def import_rig(lib, src_dir, rig_symbol, folder):
    """Copy a rig symbol and its dependencies into LIBRARY/<folder>/, renaming references."""
    src = Path(src_dir)
    doc = ET.parse(src / 'DOMDocument.xml').getroot()
    by_name = {}
    for inc in doc.findall(f'{N("symbols")}/{N("Include")}'):
        el = ET.parse(src / 'LIBRARY' / inc.get('href')).getroot()
        by_name[el.get('name')] = el
    needed, stack = [], [rig_symbol]
    while stack:
        n = stack.pop()
        if n in needed or n not in by_name:
            continue
        needed.append(n)
        for inst in by_name[n].iter(N('DOMSymbolInstance')):
            stack.append(inst.get('libraryItemName'))
    rename, used = {}, set()
    for n in needed:
        base = safe_name(n)
        cand, k = base, 2
        while cand.lower() in used:
            cand, k = f'{base} {k}', k + 1
        used.add(cand.lower())
        rename[n] = f'{folder}/{cand}'
    lib.folder(folder)
    copies = {}
    for n in needed:
        el = copy.deepcopy(by_name[n])
        for inst in el.iter(N('DOMSymbolInstance')):
            inst.set('libraryItemName', rename[inst.get('libraryItemName')])
        for attr in ('lastUniqueIdentifier',):
            el.attrib.pop(attr, None)
        copies[n] = el
    for n in needed:
        lib.write_symbol(copies[n], rename[n], '1' if copies[n].get('symbolType', 'graphic') == 'graphic' else '0')
    return rename, copies[rig_symbol]

def build_anim_symbol(lib, rig_el, rig_name, anim_name, recs, total):
    """recs: list over frames of None or {locals, frames}. Bakes keyframes per layer."""
    el = copy.deepcopy(rig_el)
    tl = el.find(f'{N("timeline")}/{N("DOMTimeline")}')
    tl.set('name', anim_name.split('/')[-1])
    for layer in tl.findall(f'{N("layers")}/{N("DOMLayer")}'):
        lname = layer.get('name')
        frames_el = layer.find(N('frames'))
        tmpl = frames_el.find(N('DOMFrame'))
        n_inst = len(tmpl.findall(f'{N("elements")}/{N("DOMSymbolInstance")}'))
        keys = []  # (frame, state)
        last = None
        hold = None
        for f in range(total):
            r = recs[f]
            if r is None:
                st = hold
            else:
                st = []
                for k in range(n_inst):
                    nm = lname if k == 0 else f'{lname}__{k + 1}'
                    if nm in r['locals']:
                        st.append((rkey(r['locals'][nm]), r['frames'].get(nm, 0)))
                    else:
                        st.append(None)
                st = tuple(st)
                hold = st
            if st is None:
                continue
            if st != last:
                keys.append((f, st))
                last = st
        for fr in list(frames_el):
            frames_el.remove(fr)
        if not keys:
            frames_el.append(tmpl)
            continue
        if keys[0][0] != 0:
            keys[0] = (0, keys[0][1])
        for i, (f, st) in enumerate(keys):
            end = keys[i + 1][0] if i + 1 < len(keys) else total
            fr = copy.deepcopy(tmpl)
            fr.set('index', str(f))
            if end - f > 1:
                fr.set('duration', str(end - f))
            else:
                fr.attrib.pop('duration', None)
            fr.set('keyMode', '9728')
            for k, inst in enumerate(fr.findall(f'{N("elements")}/{N("DOMSymbolInstance")}')):
                if st[k] is None:
                    continue
                m, ff = st[k]
                old = inst.find(N('matrix'))
                if old is not None:
                    inst.remove(old)
                inst.insert(0, _matrix_node(m))
                inst.set('firstFrame', str(ff))
                inst.set('loop', 'single frame')
            frames_el.append(fr)
    lib.write_symbol(el, anim_name, '1')
    return el

def _matrix_node(m):
    wrap = ET.Element(N('matrix'))
    me = ET.SubElement(wrap, N('Matrix'))
    for k, v, dflt in zip(('a', 'b', 'c', 'd', 'tx', 'ty'), m, (1, 0, 0, 1, 0, 0)):
        if abs(v - dflt) > 1e-6:
            me.set(k, fnum(v))
    return wrap

# ───────────────────────── SVG → XFL (graphics) ─────────────────────────

def parse_transform(s):
    m = [1, 0, 0, 1, 0, 0]
    if not s:
        return m
    for fn, args in re.findall(r'(\w+)\(([^)]*)\)', s):
        v = [float(x) for x in re.split(r'[\s,]+', args.strip()) if x]
        if fn == 'translate':
            t = [1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0]
        elif fn == 'scale':
            t = [v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0]
        elif fn == 'rotate':
            r = math.radians(v[0])
            c, sn = math.cos(r), math.sin(r)
            cx, cy = (v[1], v[2]) if len(v) > 2 else (0, 0)
            t = mmul([1, 0, 0, 1, cx, cy], mmul([c, sn, -sn, c, 0, 0], [1, 0, 0, 1, -cx, -cy]))
        elif fn == 'matrix':
            t = v
        else:
            continue
        m = mmul(m, t)
    return m

def mmul(m1, m2):
    a1, b1, c1, d1, x1, y1 = m1
    a2, b2, c2, d2, x2, y2 = m2
    return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1]

def tw(v):
    return str(int(round(v * 20)))

def edges_from_points(segs):
    """segs: list of ('M',x,y) / ('L',x,y) / ('Q',cx,cy,x,y). Returns XFL edges string."""
    out = []
    for s in segs:
        if s[0] == 'M':
            out.append(f'!{tw(s[1])} {tw(s[2])}')
        elif s[0] == 'L':
            out.append(f'|{tw(s[1])} {tw(s[2])}')
        else:
            out.append(f'[{tw(s[1])} {tw(s[2])} {tw(s[3])} {tw(s[4])}')
    return ''.join(out)

def rrect(x, y, w, h, r):
    r = max(0, min(r, w / 2, h / 2))
    x1, y1 = x + w, y + h
    if r == 0:
        return [('M', x, y), ('L', x1, y), ('L', x1, y1), ('L', x, y1), ('L', x, y)]
    return [('M', x + r, y), ('L', x1 - r, y), ('Q', x1, y, x1, y + r), ('L', x1, y1 - r), ('Q', x1, y1, x1 - r, y1),
            ('L', x + r, y1), ('Q', x, y1, x, y1 - r), ('L', x, y + r), ('Q', x, y, x + r, y)]

def circle(cx, cy, r):
    k = r / math.cos(math.pi / 8)
    pts = [('M', cx + r, cy)]
    for i in range(8):
        a0 = i * math.pi / 4
        a1 = (i + 1) * math.pi / 4
        am = (a0 + a1) / 2
        pts.append(('Q', cx + k * math.cos(am), cy + k * math.sin(am), cx + r * math.cos(a1), cy + r * math.sin(a1)))
    return pts

def path_d(d):
    """M/L/H/V/Q/C/Z (absolute and relative) → segment list. Cubics become two quads."""
    toks = re.findall(r'[MLHVQCZmlhvqcz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?', d)
    segs, i, cur, start, cmd = [], 0, (0.0, 0.0), (0.0, 0.0), None
    nargs = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'Q': 4, 'C': 6}
    while i < len(toks):
        tk = toks[i]
        if tk.isalpha():
            cmd = tk
            i += 1
            if tk in 'Zz':
                segs.append(('L', *start))
                cur = start
            continue
        n = nargs[cmd.upper()]
        v = [float(x) for x in toks[i:i + n]]
        i += n
        rel = cmd.islower()
        ox, oy = cur if rel else (0.0, 0.0)
        C = cmd.upper()
        if C == 'H':
            v = [v[0] + ox, cur[1]]
            C, rel = 'L', False
        elif C == 'V':
            v = [cur[0], v[0] + oy]
            C, rel = 'L', False
        pts = [(v[k] + ox, v[k + 1] + oy) for k in range(0, len(v), 2)]
        if C == 'M':
            cur = start = pts[0]
            segs.append(('M', *cur))
            cmd = 'l' if rel else 'L'
        elif C == 'L':
            cur = pts[0]
            segs.append(('L', *cur))
        elif C == 'Q':
            segs.append(('Q', *pts[0], *pts[1]))
            cur = pts[1]
        elif C == 'C':
            # split at t=0.5, then fit each half with one quad
            p0, p1, p2, p3 = cur, *pts
            mid = lambda u, w: ((u[0] + w[0]) / 2, (u[1] + w[1]) / 2)
            p01, p12, p23 = mid(p0, p1), mid(p1, p2), mid(p2, p3)
            pa, pb = mid(p01, p12), mid(p12, p23)
            pm = mid(pa, pb)
            for q0, q1, q2, q3 in ((p0, p01, pa, pm), (pm, pb, p23, p3)):
                segs.append(('Q', (3 * (q1[0] + q2[0]) - q0[0] - q3[0]) / 4, (3 * (q1[1] + q2[1]) - q0[1] - q3[1]) / 4, *q3))
            cur = p3
    return segs

def ellipse(cx, cy, rx, ry):
    return [(sg[0], *[cx + v * rx if k % 2 == 0 else cy + v * ry for k, v in enumerate(sg[1:])]) for sg in circle(0, 0, 1)]

# ── hand-drawn style for props: the same static waver as the video's hd-rough filter,
#    baked into the vector outlines (fixed seed, so it never changes between frames) ──

ROUGH_AMP = 2.25    # max sideways shift of a line (= half the filter's wobble of 4.5)
ROUGH_FREQ = 0.018  # waves per unit along a line (the filter's baseFrequency)
ROUGH_STEP = 22     # long straight lines are split this often so the waver shows

def _hash01(ix, iy, seed):
    h = (ix * 374761393 + iy * 668265263 + seed * 2147483647) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFF) / 0xFFFF

def _noise(x, y, seed):
    ix, iy = math.floor(x), math.floor(y)
    fx, fy = x - ix, y - iy
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b = _hash01(ix, iy, seed), _hash01(ix + 1, iy, seed)
    c, d = _hash01(ix, iy + 1, seed), _hash01(ix + 1, iy + 1, seed)
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy

def _wob(x, y):
    u, v = x * ROUGH_FREQ, y * ROUGH_FREQ
    return (x + (_noise(u, v, 11) - 0.5) * 2 * ROUGH_AMP, y + (_noise(u, v, 29) - 0.5) * 2 * ROUGH_AMP)

def roughen(segs):
    out, cur = [], (0.0, 0.0)
    for s in segs:
        if s[0] == 'M':
            cur = (s[1], s[2])
            out.append(('M', *_wob(*cur)))
        elif s[0] == 'L':
            (x0, y0), (x1, y1) = cur, (s[1], s[2])
            n = max(1, math.ceil(math.hypot(x1 - x0, y1 - y0) / ROUGH_STEP))
            for k in range(n):
                a, b = k / n, (k + 1) / n
                cx, cy = _wob(x0 + (x1 - x0) * (a + b) / 2, y0 + (y1 - y0) * (a + b) / 2)
                ex, ey = _wob(x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)
                out.append(('Q', cx, cy, ex, ey) if n > 1 else ('L', ex, ey))
            cur = (x1, y1)
        else:
            out.append(('Q', *_wob(s[1], s[2]), *_wob(s[3], s[4])))
            cur = (s[3], s[4])
    return out

def signed_area(segs):
    pts = [(s[-2], s[-1]) for s in segs]
    return sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1] for i in range(len(pts) - 1))

def color(v):
    if not v or v == 'none':
        return None
    v = v.strip()
    if v.startswith('#') and len(v) == 4:
        v = '#' + ''.join(ch * 2 for ch in v[1:])
    named = {'white': '#FFFFFF', 'black': '#000000'}
    return named.get(v, v).upper()

def shape_el(segs, m, fill, stroke, weight, closed=True, alpha=1.0):
    sh = ET.Element(N('DOMShape'), {'isDrawingObject': 'true'})
    sh.append(_matrix_node(m))
    attrs = {}
    if fill and closed:
        fills = ET.SubElement(sh, N('fills'))
        fs = ET.SubElement(fills, N('FillStyle'), {'index': '1'})
        if isinstance(fill, tuple):  # ('radial', matrix, [(ratio, color, alpha), ...])
            rg = ET.SubElement(fs, N('RadialGradient'))
            rg.append(_matrix_node(fill[1]))
            for ratio, col, a in fill[2]:
                ET.SubElement(rg, N('GradientEntry'), {'color': col, 'alpha': fnum(a * alpha), 'ratio': fnum(ratio)})
        else:
            sc = ET.SubElement(fs, N('SolidColor'), {'color': fill})
            if alpha < 1:
                sc.set('alpha', fnum(alpha))
        attrs['fillStyle1' if signed_area(segs) > 0 else 'fillStyle0'] = '1'
    if stroke and weight > 0:
        strokes = ET.SubElement(sh, N('strokes'))
        ss = ET.SubElement(strokes, N('StrokeStyle'), {'index': '1'})
        so = ET.SubElement(ss, N('SolidStroke'), {'scaleMode': 'normal', 'weight': fnum(weight), 'joints': 'round', 'caps': 'round'})
        sc = ET.SubElement(ET.SubElement(so, N('fill')), N('SolidColor'), {'color': stroke})
        if alpha < 1:
            sc.set('alpha', fnum(alpha))
        attrs['strokeStyle'] = '1'
    if not attrs:
        return None
    edges = ET.SubElement(sh, N('edges'))
    attrs['edges'] = edges_from_points(segs)
    ET.SubElement(edges, N('Edge'), attrs)
    return sh

def text_el(node, m, alpha=1.0):
    txt = ''.join(node.itertext())
    size = float(node.get('font-size', '40'))
    weight = int(node.get('font-weight', '400'))
    heavy = weight >= 900
    face = FONT_HEAVY if heavy else FONT_BOLD
    spacing = float(node.get('letter-spacing', '0') or 0)
    est = len(txt) * (size * (0.70 if heavy else 0.60) + spacing) + size * 0.4
    anchor = node.get('text-anchor', 'start')
    x, y = float(node.get('x', '0')), float(node.get('y', '0'))
    left = x - est / 2 if anchor == 'middle' else (x - est if anchor == 'end' else x)
    top = y - size * 0.98
    mm = mmul(mmul(m, parse_transform(node.get('transform'))), [1, 0, 0, 1, left, top])
    st = ET.Element(N('DOMStaticText'), {'width': fnum(est), 'height': fnum(size * 1.25), 'isSelectable': 'false', 'fontRenderingMode': 'standard'})
    st.append(_matrix_node(mm))
    runs = ET.SubElement(st, N('textRuns'))
    run = ET.SubElement(runs, N('DOMTextRun'))
    ET.SubElement(run, N('characters')).text = txt
    ta = ET.SubElement(ET.SubElement(run, N('textAttrs')), N('DOMTextAttrs'), {
        'alignment': {'middle': 'center', 'end': 'right'}.get(anchor, 'left'),
        'aliasText': 'false',
        'size': fnum(size),
        'bitmapSize': str(int(size * 20)),
        'face': face,
        'fillColor': color(node.get('fill')) or '#000000',
    })
    if spacing:
        ta.set('letterSpacing', fnum(spacing))
    if alpha < 1:
        ta.set('alpha', fnum(alpha))
    stroke = color(node.get('stroke'))
    sw = float(node.get('stroke-width', '0') or 0)
    if stroke and sw > 0:
        filters = ET.SubElement(st, N('filters'))
        ET.SubElement(filters, N('GlowFilter'), {'blurX': fnum(sw * 0.9), 'blurY': fnum(sw * 0.9), 'color': stroke, 'strength': '20', 'quality': '3'})
    return st

INHERITED = ('fill', 'stroke', 'stroke-width', 'font-size', 'font-weight', 'text-anchor', 'letter-spacing')

def svg_to_elements(svg, rough=False):
    """SVG markup → XFL shapes/text. Fill, stroke and font attributes inherit from groups as
    in SVG, and opacity multiplies down. rough=True bakes in the hand-drawn waver (props)."""
    root = ET.fromstring(svg.replace('&nbsp;', ' '))
    out = []
    grads = {}
    for g in root.iter():
        if g.tag.split('}')[-1] == 'radialGradient' and g.get('id'):
            stops = [(float(st.get('offset', '0').rstrip('%')) / (100 if '%' in st.get('offset', '') else 1),
                      color(st.get('stop-color', '#000000')), float(st.get('stop-opacity', '1'))) for st in g if st.tag.split('}')[-1] == 'stop']
            pct = lambda k, d: float(g.get(k, d).rstrip('%')) / 100
            grads[g.get('id')] = (pct('cx', '50%'), pct('cy', '50%'), pct('r', '50%'), stops)

    def fill_of(st, bbox):
        v = st.get('fill', '#000000')
        ref = re.match(r'url\(#([^)]+)\)', v or '')
        if not ref:
            return color(v)
        if ref.group(1) not in grads or bbox is None:
            return None
        # objectBoundingBox radial gradient → Animate gradient (its unit square is 1638.4 px wide)
        gx, gy, gr, stops = grads[ref.group(1)]
        x, y, w, h = bbox
        return ('radial', [gr * w / 819.2, 0, 0, gr * h / 819.2, x + gx * w, y + gy * h], stops)

    def add(segs, mm, st, closed=True, bbox=None):
        if rough:
            segs = roughen(segs)
        fill = fill_of(st, bbox) if closed else None
        el = shape_el(segs, mm, fill, color(st.get('stroke')), float(st.get('stroke-width', 1) or 0), closed, st['opacity'])
        if el is not None:
            out.append(el)

    def walk(node, m, st):
        tag = node.tag.split('}')[-1]
        st = dict(st)
        for k in INHERITED:
            if node.get(k) is not None:
                st[k] = node.get(k)
        st['opacity'] = st['opacity'] * float(node.get('opacity', 1))
        if st['opacity'] <= 0.004 or tag in ('defs', 'filter', 'style', 'clipPath', 'mask'):
            return
        mm = mmul(m, parse_transform(node.get('transform'))) if tag != 'text' else m
        f = lambda k, d=0: float(node.get(k, d) or 0)
        if tag in ('g', 'svg'):
            for ch in node:
                walk(ch, mm, st)
        elif tag == 'rect':
            add(rrect(f('x'), f('y'), f('width'), f('height'), f('rx') or f('ry')), mm, st, bbox=(f('x'), f('y'), f('width'), f('height')))
        elif tag == 'circle':
            add(circle(f('cx'), f('cy'), f('r')), mm, st)
        elif tag == 'ellipse':
            add(ellipse(f('cx'), f('cy'), f('rx'), f('ry')), mm, st)
        elif tag in ('polygon', 'polyline'):
            v = [float(x) for x in re.split(r'[\s,]+', node.get('points', '').strip()) if x]
            segs = [('M' if k == 0 else 'L', v[k], v[k + 1]) for k in range(0, len(v) - 1, 2)]
            if segs and tag == 'polygon':
                segs.append(('L', v[0], v[1]))
            add(segs, mm, st, closed=tag == 'polygon')
        elif tag == 'line':
            add([('M', f('x1'), f('y1')), ('L', f('x2'), f('y2'))], mm, st, closed=False)
        elif tag == 'path':
            add(path_d(node.get('d', '')), mm, st, closed=color(st.get('fill', '#000000')) is not None)
        elif tag == 'text':
            t = copy.copy(node)
            for k in INHERITED:
                if k in st and t.get(k) is None:
                    t.set(k, st[k])
            out.append(text_el(t, m, st['opacity']))

    walk(root, [1, 0, 0, 1, 0, 0], {'opacity': 1.0})
    return out

def graphic_symbol(lib, name, elements):
    root = ET.Element(N('DOMSymbolItem'), {'symbolType': 'graphic'})
    tl = ET.SubElement(ET.SubElement(root, N('timeline')), N('DOMTimeline'), {'name': name.split('/')[-1]})
    layer = ET.SubElement(ET.SubElement(tl, N('layers')), N('DOMLayer'), {'name': 'Layer_1', 'color': '#4FFF4F'})
    fr = ET.SubElement(ET.SubElement(layer, N('frames')), N('DOMFrame'), {'index': '0', 'keyMode': '9728'})
    els = ET.SubElement(fr, N('elements'))
    for e in elements:
        els.append(e)
    lib.write_symbol(root, name, '1')

# ───────────────────────── main ─────────────────────────

def main(capture_path, bg_dir, cast_src, out_fla, work, svg_dir=None):
    cap = json.load(open(capture_path))
    total, W, H, fps = cap['duration'], cap['width'], cap['height'], cap['fps']
    frames = cap['frames']
    work = Path(work)
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    lib = Library(work)

    # ── characters ──
    char_layers = {}
    for who in LAYER_ORDER:
        src_folder, rig_sym, disp = CAST[who]
        recs = [next((c for c in fr['chars'] if c['who'] == who), None) for fr in frames]
        if not any(recs):
            continue
        rename, rig_el = import_rig(lib, Path(cast_src) / src_folder, rig_sym, disp)
        anim_name = f"{disp}/{disp} – {cap.get('episode', 'Ep01')}"
        build_anim_symbol(lib, rig_el, rename[rig_sym], anim_name, recs, total)
        char_layers[who] = (disp, anim_name, recs)

    # ── graphics ──
    lib.folder('Graphics')
    gsyms = {}
    for fr in frames:
        for g in fr['graphics']:
            if g['key'] not in gsyms:
                name = f'Graphics/g{len(gsyms) + 1:02d} ' + re.sub(r'[^A-Za-z0-9 $+≈.-]', '', ' '.join(re.findall(r'>([^<]+)<', g['svg']))[:24]).strip()
                graphic_symbol(lib, name, svg_to_elements(g['svg']))
                gsyms[g['key']] = name

    # ── props (vector symbols, hand-drawn) ──
    lib.folder('Props')
    psyms, pcount = {}, {}
    for fr in frames:
        for pr in fr.get('props', []):
            if pr['key'] not in psyms:
                pcount[pr['name']] = pcount.get(pr['name'], 0) + 1
                psyms[pr['key']] = f"Props/{pr['name']} {pcount[pr['name']]:02d}"
                graphic_symbol(lib, psyms[pr['key']], svg_to_elements(pr['svg'], rough=True))

    # ── captions ──
    lib.folder('Captions')
    csyms = {}
    for fr in frames:
        c = fr['caption']
        if c and c not in csyms:
            size = 54
            est = len(c) * size * 0.58 + 20
            pill = rrect(540 - est / 2 - 26, 150, est + 52, 82, 18)
            pill_el = shape_el(pill, [1, 0, 0, 1, 0, 0], '#0C0C0E', None, 0, alpha=0.92)
            tnode = ET.Element('text', {'x': '540', 'y': '209', 'text-anchor': 'middle', 'font-size': str(size), 'font-weight': '800', 'fill': '#FFFFFF'})
            tnode.text = c
            csyms[c] = f'Captions/c{len(csyms) + 1:02d} ' + re.sub(r'[^A-Za-z0-9 ]', '', c)[:20].strip()
            graphic_symbol(lib, csyms[c], [pill_el, text_el(tnode, [1, 0, 0, 1, 0, 0])])

    # ── background: vector symbols of each frame's set (or JPEG frames for old captures) ──
    lib.folder('Background')
    media_els = []
    bsyms, bstates = {}, []
    if all(fr.get('background') for fr in frames):
        if svg_dir:
            Path(svg_dir).mkdir(parents=True, exist_ok=True)
        for fr in frames:
            bgr = fr['background']
            if bgr['key'] not in bsyms:
                n = len(bsyms) + 1
                bsyms[bgr['key']] = f'Background/bg{n:02d} shot {fr["shot"] + 1:02d}'
                graphic_symbol(lib, bsyms[bgr['key']], svg_to_elements(bgr['svg']))
                if svg_dir:
                    (Path(svg_dir) / f'bg{n:02d}_shot{fr["shot"] + 1:02d}.svg').write_text(bgr['svg'])
            bstates.append(bgr['key'])
        bg_count = len(bsyms)
    else:
        from PIL import Image, ImageChops
        bg_files = sorted(Path(bg_dir).glob('*.jpeg'))
        bg_keys, ref = [], None
        for f, p in enumerate(bg_files):
            small = Image.open(p).convert('L').resize((270, 480))
            changed = ref is None or ImageChops.difference(small, ref).point(lambda v: 255 if v > 28 else 0).histogram()[255] > 120
            if changed:
                bg_keys.append((f, p))
                ref = small
        for i, (f, p) in enumerate(bg_keys):
            name = f'Background/bg{i + 1:04d}.jpg'
            dst = work / 'LIBRARY' / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            im = Image.open(p).convert('RGB')
            im.save(dst, 'JPEG', quality=74, optimize=True, progressive=False)
            data = dst.read_bytes()
            w, h = im.size
            dat = f'M {i + 1} {int(time.time())}.dat'
            (work / 'bin' / dat).write_bytes(data + (0).to_bytes(4, 'little') + (w * 20).to_bytes(4, 'little') + (0).to_bytes(4, 'little') + (h * 20).to_bytes(4, 'little'))
            media_els.append(ET.Element(N('DOMBitmapItem'), {
                'name': name, 'itemID': new_id(), 'sourceLastImported': str(int(time.time())), 'externalFileSize': str(len(data)),
                'allowSmoothing': 'true', 'quality': '80', 'href': name, 'bitmapDataHRef': dat,
                'frameRight': str(w * 20), 'frameBottom': str(h * 20), 'isJPEG': 'true'}))
        bg_count = len(bg_keys)

    # ── main timeline ──
    tl = ET.Element(N('DOMTimeline'), {'name': 'Scene 1'})
    layers = ET.SubElement(tl, N('layers'))

    def add_layer(name, keys, color='#4F80FF'):
        """keys: list of (frame, [element, ...]) — frames held until the next key."""
        L = ET.SubElement(layers, N('DOMLayer'), {'name': name, 'color': color, 'autoNamed': 'false'})
        fe = ET.SubElement(L, N('frames'))
        if not keys or keys[0][0] != 0:
            keys = [(0, [])] + keys
        for i, (f, els) in enumerate(keys):
            end = keys[i + 1][0] if i + 1 < len(keys) else total
            fr = ET.SubElement(fe, N('DOMFrame'), {'index': str(f), 'keyMode': '9728'})
            if end - f > 1:
                fr.set('duration', str(end - f))
            ee = ET.SubElement(fr, N('elements'))
            for e in els:
                ee.append(e)
        return L

    def inst(name, m, first=None, loop='single frame', alpha=1.0):
        e = ET.Element(N('DOMSymbolInstance'), {'libraryItemName': name, 'symbolType': 'graphic', 'loop': loop})
        if first is not None:
            e.set('firstFrame', str(first))
        e.append(_matrix_node(m))
        if alpha < 1:
            ET.SubElement(ET.SubElement(e, N('color')), N('Color'), {'alphaMultiplier': fnum(alpha)})
        return e

    def keyed(states, make):
        keys, last = [], object()
        for f, st in enumerate(states):
            if st != last:
                keys.append((f, make(f, st)))
                last = st
        return keys

    # captions
    add_layer('Captions', keyed([fr['caption'] for fr in frames], lambda f, c: [inst(csyms[c], [1, 0, 0, 1, 0, 0])] if c else []), '#FFFF4F')
    # graphics
    gstates = [tuple((g['key'], rkey(g['matrix'])) for g in fr['graphics']) for fr in frames]
    add_layer('Graphics', keyed(gstates, lambda f, st: [inst(gsyms[k], list(m)) for k, m in st]), '#FF4FFF')
    # props held / drawn in front of the cast
    def prop_states(front):
        return [tuple((p['key'], rkey(p['matrix'])) for p in fr.get('props', []) if p['front'] == front) for fr in frames]
    if any(prop_states(True)):
        add_layer('Props front', keyed(prop_states(True), lambda f, st: [inst(psyms[k], list(m)) for k, m in st]), '#FF9933')
    # characters
    for who in LAYER_ORDER:
        if who not in char_layers:
            continue
        disp, anim, recs = char_layers[who]
        states = [rkey(r['outer']) if r else None for r in recs]
        keys, last = [], object()
        for f, st in enumerate(states):
            # a new key when the placement changes or the character enters/leaves
            if st != last:
                keys.append((f, [inst(anim, list(st), first=f, loop='loop')] if st else []))
                last = st
        add_layer(disp, keys, '#4FFFFF')
    # props behind the cast
    if any(prop_states(False)):
        add_layer('Props', keyed(prop_states(False), lambda f, st: [inst(psyms[k], list(m)) for k, m in st]), '#FF9933')
    # background (set only)
    if bsyms:
        add_layer('Background', keyed(bstates, lambda f, k: [inst(bsyms[k], [1, 0, 0, 1, 0, 0])]), '#9933CC')
    else:
        bkeys = [(f, [ET.Element(N('DOMBitmapInstance'), {'libraryItemName': f'Background/bg{i + 1:04d}.jpg'})]) for i, (f, _) in enumerate(bg_keys)]
        add_layer('Background', bkeys, '#9933CC')

    # ── DOMDocument ──
    tmpl_doc = ET.parse(Path(cast_src) / 'Ebo' / 'DOMDocument.xml').getroot()
    doc = ET.Element(N('DOMDocument'))
    for k in ('xflVersion', 'creatorInfo', 'platform', 'versionInfo', 'majorVersion', 'buildNumber'):
        if tmpl_doc.get(k):
            doc.set(k, tmpl_doc.get(k))
    doc.set('width', str(W))
    doc.set('height', str(H))
    doc.set('frameRate', str(fps))
    doc.set('backgroundColor', '#000000')
    doc.set('currentTimeline', '1')
    doc.set('filetypeGUID', tmpl_doc.get('filetypeGUID', ''))
    doc.set('fileGUID', hashlib.md5(out_fla.encode()).hexdigest().upper())
    fol = ET.SubElement(doc, N('folders'))
    for name in lib.folders:
        ET.SubElement(fol, N('DOMFolderItem'), {'name': name, 'itemID': new_id()})
    med = ET.SubElement(doc, N('media'))
    for m in media_els:
        med.append(m)
    syms = ET.SubElement(doc, N('symbols'))
    for href, iid, icon in lib.symbols:
        ET.SubElement(syms, N('Include'), {'href': href, 'itemIcon': icon, 'loadImmediate': 'false', 'itemID': iid})
    tls = ET.SubElement(doc, N('timelines'))
    tls.append(tl)
    ET.ElementTree(doc).write(work / 'DOMDocument.xml', encoding='utf-8', xml_declaration=False)

    src0 = Path(cast_src) / 'Ebo'
    for f in ('PublishSettings.xml', 'MobileSettings.xml', 'mimetype'):
        if (src0 / f).exists():
            shutil.copy(src0 / f, work / f)
    (work / 'META-INF').mkdir(exist_ok=True)
    (work / 'META-INF' / 'metadata.xml').write_bytes(b'')
    stem = Path(out_fla).stem
    (work / f'{stem}.xfl').write_text('PROXY-CS5')

    with zipfile.ZipFile(out_fla, 'w') as z:
        z.write(work / 'mimetype', 'mimetype', compress_type=zipfile.ZIP_STORED)
        for p in sorted(work.rglob('*')):
            rel = p.relative_to(work).as_posix()
            if rel == 'mimetype':
                continue
            if p.is_dir():
                z.writestr(rel + '/', b'')
            else:
                z.write(p, rel, compress_type=zipfile.ZIP_STORED if p.suffix.lower() in ('.dat', '.jpg', '.jpeg') else zipfile.ZIP_DEFLATED)

    print(f'characters: {", ".join(v[0] for v in char_layers.values())}')
    print(f'graphics: {len(gsyms)}  props: {len(psyms)}  captions: {len(csyms)}  backgrounds: {bg_count}{" (vector)" if bsyms else " (JPEG)"}')
    print(f'wrote {out_fla} ({os.path.getsize(out_fla) / 1e6:.1f} MB)')

if __name__ == '__main__':
    main(*sys.argv[1:7])
