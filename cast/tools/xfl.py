"""Minimal XFL (Adobe Animate) reader + SVG renderer for solid-fill vector symbols."""
import re
import math
import xml.etree.ElementTree as ET
from pathlib import Path

NS = '{http://ns.adobe.com/xfl/2008/}'
TOK = re.compile(r'[!|/\[\]]|S\d|#[0-9A-Fa-f]+(?:\.[0-9A-Fa-f]+)?|-?\d+(?:\.\d+)?')


def num(tok):
    if tok.startswith('#'):
        ip, _, fp = tok[1:].partition('.')
        v = int(ip, 16)
        bits = 4 * len(ip)
        if len(ip) >= 6 and v >= 1 << (bits - 1):  # two's complement (24- or 32-bit)
            v -= 1 << bits
        if fp:
            v += int(fp, 16) / (16 ** len(fp))
        return v / 20.0
    return float(tok) / 20.0


def parse_edges(s):
    """Return list of segments: (p0, ctrl or None, p1)."""
    toks = [t for t in TOK.findall(s) if not t.startswith('S')]
    segs = []
    pen = None
    i = 0
    while i < len(toks):
        t = toks[i]
        if t == '!':
            pen = (num(toks[i + 1]), num(toks[i + 2]))
            i += 3
        elif t in '|/':
            p = (num(toks[i + 1]), num(toks[i + 2]))
            if pen is not None and p != pen:
                segs.append((pen, None, p))
            pen = p
            i += 3
        elif t in '[]':
            c = (num(toks[i + 1]), num(toks[i + 2]))
            p = (num(toks[i + 3]), num(toks[i + 4]))
            if pen is not None:
                segs.append((pen, c, p))
            pen = p
            i += 5
        else:
            i += 1
    return segs


def key(p):
    return (round(p[0], 2), round(p[1], 2))


def seg_d(seg, move):
    p0, c, p1 = seg
    out = f'M{p0[0]:.2f} {p0[1]:.2f}' if move else ''
    if c is None:
        return out + f'L{p1[0]:.2f} {p1[1]:.2f}'
    return out + f'Q{c[0]:.2f} {c[1]:.2f} {p1[0]:.2f} {p1[1]:.2f}'


def loops_to_d(segs):
    """Chain oriented segments into closed paths."""
    by_start = {}
    for idx, s in enumerate(segs):
        by_start.setdefault(key(s[0]), []).append(idx)
    used = set()
    d = []
    for idx in range(len(segs)):
        if idx in used:
            continue
        used.add(idx)
        cur = segs[idx]
        start = key(cur[0])
        d.append(seg_d(cur, True))
        guard = 0
        while key(cur[2]) != start and guard < 100000:
            guard += 1
            nxt = [j for j in by_start.get(key(cur[2]), []) if j not in used]
            if not nxt:
                break
            j = nxt[0]
            used.add(j)
            cur = segs[j]
            d.append(seg_d(cur, False))
        d.append('Z')
    return ''.join(d)


def color_of(el):
    sc = el.find(f'.//{NS}SolidColor') if el is not None else None
    if sc is None:
        return '#000000', 1.0
    return sc.get('color', '#000000'), float(sc.get('alpha', '1'))


def matrix_of(el):
    m = el.find(f'{NS}matrix/{NS}Matrix') if el is not None else None
    a = m.attrib if m is not None else {}
    return [float(a.get('a', 1)), float(a.get('b', 0)), float(a.get('c', 0)), float(a.get('d', 1)), float(a.get('tx', 0)), float(a.get('ty', 0))]


def mstr(m):
    return 'matrix(' + ','.join(f'{v:.5f}' for v in m) + ')'


def shape_svg(sh):
    fills = {f.get('index'): color_of(f) for f in sh.findall(f'{NS}fills/{NS}FillStyle')}
    strokes = {}
    for s in sh.findall(f'{NS}strokes/{NS}StrokeStyle'):
        ss = s[0]
        col, al = color_of(ss.find(f'{NS}fill'))
        strokes[s.get('index')] = (col, al, float(ss.get('weight', '1')), ss.get('caps', 'round'), ss.get('joints', 'round'))
    fill_segs = {}
    stroke_segs = {}
    for e in sh.findall(f'{NS}edges/{NS}Edge'):
        if not e.get('edges'):
            continue
        segs = parse_edges(e.get('edges'))
        f0, f1, st = e.get('fillStyle0'), e.get('fillStyle1'), e.get('strokeStyle')
        if f1:
            fill_segs.setdefault(f1, []).extend(segs)
        if f0:
            fill_segs.setdefault(f0, []).extend([(p1, c, p0) for (p0, c, p1) in segs])
        if st:
            stroke_segs.setdefault(st, []).extend(segs)
    out = []
    for k, segs in fill_segs.items():
        fs = sh.find(f'{NS}fills/{NS}FillStyle[@index="{k}"]')
        rg = fs.find(f'{NS}RadialGradient') if fs is not None else None
        if rg is not None:
            # Animate's gradient square is 1638.4 px wide, centred on the gradient matrix
            gid = f'rg{id(rg)}'
            stops = ''.join(f'<stop offset="{e.get("ratio", "0")}" stop-color="{e.get("color", "#000000")}" stop-opacity="{e.get("alpha", "1")}"/>'
                            for e in rg.findall(f'{NS}GradientEntry'))
            out.append(f'<defs><radialGradient id="{gid}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="819.2" '
                       f'gradientTransform="{mstr(matrix_of(rg))}">{stops}</radialGradient></defs>'
                       f'<path d="{loops_to_d(segs)}" fill="url(#{gid})" fill-rule="evenodd"/>')
        elif k in fills:
            col, al = fills[k]
            out.append(f'<path d="{loops_to_d(segs)}" fill="{col}" fill-opacity="{al}" fill-rule="evenodd"/>')
    for k, segs in stroke_segs.items():
        if k in strokes:
            col, al, w, caps, joints = strokes[k]
            d = ''.join(seg_d(s, True) for s in segs)
            cap = {'none': 'butt', 'square': 'square'}.get(caps, 'round')
            out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-opacity="{al}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="round"/>')
    body = ''.join(out)
    m = matrix_of(sh)
    return f'<g transform="{mstr(m)}">{body}</g>' if m != [1, 0, 0, 1, 0, 0] else body


class Doc:
    def __init__(self, root):
        self.root = Path(root)
        self.doc = ET.parse(self.root / 'DOMDocument.xml').getroot()
        self.symbols = {}
        for inc in self.doc.findall(f'{NS}symbols/{NS}Include'):
            el = ET.parse(self.root / 'LIBRARY' / inc.get('href')).getroot()
            self.symbols[el.get('name')] = el
        self._cache = {}

    def timeline(self, name):
        return self.symbols[name].find(f'{NS}timeline/{NS}DOMTimeline')

    @staticmethod
    def frame_at(layer, f):
        for fr in layer.findall(f'{NS}frames/{NS}DOMFrame'):
            i = int(fr.get('index'))
            if i <= f < i + int(fr.get('duration', '1')):
                return fr
        return None

    @staticmethod
    def length(tl):
        n = 0
        for fr in tl.iter(f'{NS}DOMFrame'):
            n = max(n, int(fr.get('index')) + int(fr.get('duration', '1')))
        return max(1, n)

    def symbol_svg(self, name, f=0):
        k = (name, f)
        if k not in self._cache:
            self._cache[k] = self.timeline_svg(self.timeline(name), f)
        return self._cache[k]

    def frame_instance_matrix(self, layer, f):
        """Matrix of the first symbol instance on `layer` at frame f (classic tweens interpolated)."""
        fr = self.frame_at(layer, f)
        if fr is None:
            return None
        inst = fr.find(f'{NS}elements/{NS}DOMSymbolInstance')
        if inst is None:
            return None
        m = matrix_of(inst)
        if fr.get('tweenType') == 'motion':
            nxt = self.frame_at(layer, int(fr.get('index')) + int(fr.get('duration', '1')))
            nin = nxt.find(f'{NS}elements/{NS}DOMSymbolInstance') if nxt is not None else None
            if nin is not None:
                u = (f - int(fr.get('index'))) / int(fr.get('duration', '1'))
                u = ease(u, float(fr.get('acceleration', '0')))
                tp = inst.find(f'{NS}transformationPoint/{NS}Point')
                tp = (float(tp.get('x', '0')), float(tp.get('y', '0'))) if tp is not None else (0, 0)
                m = interp_matrix(m, matrix_of(nin), tp, u)
        return m

    def timeline_svg(self, tl, f):
        layers = tl.findall(f'{NS}layers/{NS}DOMLayer')
        by_rig = {L.get('layerRiggingIndex'): L for L in layers if L.get('layerRiggingIndex') is not None}

        def parent_world(layer, depth=0):
            fr = self.frame_at(layer, f)
            pi = fr.get('parentLayerIndex') if fr is not None else None
            if pi is None or pi not in by_rig or depth > 32:
                return [1, 0, 0, 1, 0, 0]
            P = by_rig[pi]
            pm = self.frame_instance_matrix(P, f) or [1, 0, 0, 1, 0, 0]
            return mul(parent_world(P, depth + 1), pm)

        parts = []
        for layer in reversed(layers):
            if layer.get('layerType') in ('guide', 'folder', 'mask') or layer.get('visible') == 'false':
                continue
            fr = self.frame_at(layer, f)
            if fr is None:
                continue
            body = self.elements_svg(fr, f - int(fr.get('index')), self.frame_instance_matrix(layer, f))
            pw = parent_world(layer)
            parts.append(f'<g transform="{mstr(pw)}">{body}</g>' if pw != [1, 0, 0, 1, 0, 0] else body)
        return ''.join(parts)

    def instance_frame(self, inst, offset):
        name = inst.get('libraryItemName')
        n = self.length(self.timeline(name))
        first = int(inst.get('firstFrame', '0'))
        loop = inst.get('loop', 'loop')
        if loop == 'single frame':
            return min(first, n - 1)
        if loop == 'play once':
            return min(first + offset, n - 1)
        return (first + offset) % n

    def elements_svg(self, fr, offset, first_inst_matrix=None):
        out = []
        first = True
        els = fr.find(f'{NS}elements')
        for el in (els if els is not None else []):
            tag = el.tag.replace(NS, '')
            if tag == 'DOMShape':
                out.append(shape_svg(el))
            elif tag == 'DOMSymbolInstance':
                if el.get('libraryItemName') not in self.symbols:
                    continue
                inner = self.symbol_svg(el.get('libraryItemName'), self.instance_frame(el, offset))
                m = first_inst_matrix if (first and first_inst_matrix) else matrix_of(el)
                first = False
                op = el.find(f'{NS}color/{NS}Color')
                alpha = float(op.get('alphaMultiplier', '1')) if op is not None else 1
                out.append(f'<g transform="{mstr(m)}" opacity="{alpha}">{inner}</g>')
            elif tag == 'DOMBitmapInstance':
                href = self.root / 'LIBRARY' / el.get('libraryItemName')
                m = matrix_of(el)
                out.append(f'<image href="file://{href}" x="0" y="0" transform="{mstr(m)}"/>')
            elif tag in ('DOMStaticText', 'DOMDynamicText'):
                m = matrix_of(el)
                for run in el.iter(f'{NS}DOMTextRun'):
                    ch = run.find(f'{NS}characters').text or ''
                    ta = run.find(f'.//{NS}DOMTextAttrs')
                    size = float(ta.get('size', '12'))
                    w = float(el.get('width', '100'))
                    al = ta.get('alignment', 'left')
                    x = {'center': w / 2, 'right': w}.get(al, 0)
                    anchor = {'center': 'middle', 'right': 'end'}.get(al, 'start')
                    glow = el.find(f'.//{NS}GlowFilter')
                    stroke = f' stroke="{glow.get("color")}" stroke-width="{float(glow.get("blurX")) * 1.1}" paint-order="stroke"' if glow is not None else ''
                    weight = 900 if 'Black' in ta.get('face', '') else 700
                    ch = ch.replace('&', '&amp;').replace('<', '&lt;')
                    out.append(f'<text transform="{mstr(m)}" x="{x}" y="{size * 0.98}" font-size="{size}" font-family="Arial, sans-serif" font-weight="{weight}" fill="{ta.get("fillColor", "#000")}" fill-opacity="{ta.get("alpha", "1")}" letter-spacing="{ta.get("letterSpacing", "0")}" text-anchor="{anchor}"{stroke}>{ch}</text>')
            elif tag == 'DOMGroup':
                for m in el.findall(f'{NS}members/*'):
                    if m.tag == NS + 'DOMShape':
                        out.append(shape_svg(m))
        return ''.join(out)


def mul(m1, m2):
    a1, b1, c1, d1, x1, y1 = m1
    a2, b2, c2, d2, x2, y2 = m2
    return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1]


def apply(m, p):
    return (m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5])


def ease(u, acc):
    """Animate classic-tween ease: acc -100 (ease in) .. 100 (ease out)."""
    a = acc / 100.0
    return u + a * u * (1 - u) if a else u


def decompose(m):
    a, b, c, d, tx, ty = m
    sx = math.hypot(a, b)
    sy = math.hypot(c, d)
    rx = math.atan2(b, a)
    ry = math.atan2(-c, d)
    return sx, sy, rx, ry


def interp_matrix(m1, m2, tp, u):
    """Interpolate like a classic tween: pivot position, scale, rotation/skew."""
    p1, p2 = apply(m1, tp), apply(m2, tp)
    s1, s2 = decompose(m1), decompose(m2)
    def ang(x, y):
        dd = (y - x + math.pi) % (2 * math.pi) - math.pi
        return x + dd * u
    sx = s1[0] + (s2[0] - s1[0]) * u
    sy = s1[1] + (s2[1] - s1[1]) * u
    rx = ang(s1[2], s2[2])
    ry = ang(s1[3], s2[3])
    a, b, c, d = sx * math.cos(rx), sx * math.sin(rx), -sy * math.sin(ry), sy * math.cos(ry)
    px, py = p1[0] + (p2[0] - p1[0]) * u, p1[1] + (p2[1] - p1[1]) * u
    tx = px - (a * tp[0] + c * tp[1])
    ty = py - (b * tp[0] + d * tp[1])
    return [a, b, c, d, tx, ty]
