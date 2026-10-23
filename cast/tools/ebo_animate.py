"""Animate the Ebo rig inside an XFL folder and write a new .fla + preview frames.

usage: python3 -I ebo_animate.py SRC_XFL_DIR OUT_FLA PREVIEW_DIR
"""
import sys, os, math, copy, shutil, zipfile
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xml.etree.ElementTree as ET
from xfl import NS, Doc, matrix_of, mul, apply, mstr
from rig import rig_layers, world, ebo_svg

ET.register_namespace('', 'http://ns.adobe.com/xfl/2008/')
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')

FPS = 24
N = 144  # 6 seconds at 24 fps, loops seamlessly

# ── Snappy pose-to-pose choreography ──
# Each layer gets keys (frame, params, tween_to_next). Moves are 2-frame snaps with an
# overshoot, a 2-frame settle, then a dead-still hold (no tween).
# params: rot (deg about the layer's own pivot), dx, dy (parent space).
# House rule: translation and rotation only — never scale.
ALLOWED = {'rot', 'dx', 'dy'}  # translation + rotation only
KEYS = {}
_state = {}

def _key(layer, f, p, tween):
    lst = KEYS.setdefault(layer, [])
    lst[:] = [k for k in lst if k[0] != f]
    lst.append((f, dict(p), tween))
    lst.sort(key=lambda k: k[0])

def pose(layer, f, **p):
    """Hard set (hold) at frame f."""
    assert set(p) <= ALLOWED, f'only {ALLOWED} may be animated, got {set(p)}'
    full = {'rot': 0, 'dx': 0, 'dy': 0, **p}
    _state[layer] = full
    _key(layer, f, full, False)

def snap(layer, f, dur=2, over=0.3, settle=2, **p):
    """From the current pose, snap to p in `dur` frames, overshoot, settle, hold."""
    assert set(p) <= ALLOWED, f'only {ALLOWED} may be animated, got {set(p)}'
    cur = _state.get(layer, {'rot': 0, 'dx': 0, 'dy': 0})
    tgt = {**cur, **p}
    _key(layer, f, cur, True)
    if over:
        ov = {k: tgt[k] + (tgt[k] - cur[k]) * over for k in tgt}
        _key(layer, f + dur, ov, True)
        _key(layer, f + dur + settle, tgt, False)
    else:
        _key(layer, f + dur, tgt, False)
    _state[layer] = tgt

BODY = ['torso', 'head', 'hand_top_2', 'hand_down_2', 'hand_top_1', 'hand_down_1_', 'pupil_1', 'pupil_2']
for L in BODY:
    pose(L, 0)

def wave_burst(start, count):
    # anticipation: dip down, arm cocks back
    snap('torso', start, dy=7, rot=-2, over=0)
    snap('head', start, rot=4, over=0)
    snap('hand_top_2', start, rot=14, over=0)
    # pop up
    snap('torso', start + 3, dy=-4, rot=1.5, over=0.4)
    snap('head', start + 3, rot=-7, over=0.4)
    snap('hand_top_2', start + 3, rot=-12, over=0.3)
    # wrist flicks on a 5-frame beat: 2-frame snap + 3-frame hold
    for i in range(count):
        snap('hand_down_2', start + 5 + i * 5, rot=(26 if i % 2 == 0 else -18), over=0.25, settle=1)
    end = start + 5 + count * 5
    snap('hand_down_2', end, rot=0, over=0.2)
    snap('hand_top_2', end, rot=0, over=0.2)
    snap('torso', end, dy=0, rot=0, over=0.3)
    return end

e1 = wave_burst(8, 6)            # "Hi! I'm Ebo!"
snap('head', e1 + 6, rot=7, over=0.35)          # cheeky tilt the other way
snap('pupil_1', e1 + 12, dx=-9, dy=-3, over=0)  # glance
snap('pupil_2', e1 + 12, dx=-9, dy=-3, over=0)
snap('pupil_1', e1 + 24, dx=0, dy=0, over=0)
snap('pupil_2', e1 + 24, dx=0, dy=0, over=0)
# happy squash-bounce
snap('torso', 74, dy=6, rot=3, over=0)
snap('torso', 77, dy=-3, rot=-2, over=0.3)
snap('torso', 82, dy=0, rot=0, over=0)
snap('hand_top_1', 74, rot=-8, over=0.3)
snap('hand_top_1', 84, rot=0, over=0.2)
e2 = wave_burst(92, 5)           # "Nice to meet you!"
snap('head', 128, rot=0, over=0.3)
for L in BODY:                   # make sure everything is home before the loop point
    if _state[L] != {'rot': 0, 'dx': 0, 'dy': 0}:
        snap(L, 132, rot=0, dx=0, dy=0, over=0)
MOTION = KEYS

# ── Swaps (graphic symbol firstFrame) — changes land on the snap frames ──
# eye 1: 0 open, 9 happy (lower lid), 12 closed lid; pupil 1: 1 dot, 4 dome, 7 empty
EYES = [(0, 0), (11, 12), (12, 0), (52, 12), (54, 0), (77, 9), (90, 0), (118, 12), (120, 0)]
PUPILS = [(0, 1), (11, 7), (12, 1), (52, 7), (54, 1), (77, 4), (90, 1), (118, 7), (120, 1)]
# mouth: 0 neutral, 1 open, 2 teeth, 3 open happy, 5 O, 6 smile, 10 open, 12 O, 13 frown, 14 smirk
MOUTH = [(0, 6), (8, 5), (11, 3), (15, 10), (18, 1), (21, 3), (24, 2), (27, 5), (30, 3), (34, 6),
         (44, 14), (74, 2), (77, 3), (84, 6),
         (92, 12), (95, 1), (98, 10), (101, 2), (104, 5), (107, 3), (110, 1), (114, 3), (120, 6)]
SWAPS = {'eye_1': EYES, 'eye_2': EYES, 'pupil_1': PUPILS, 'pupil_2': PUPILS, 'mouth': MOUTH}

def swap_at(lst, t):
    v = lst[0][1]
    for f, x in lst:
        if f <= t:
            v = x
    return v

def lerp_params(a, b, u):
    keys = set(a) | set(b)
    dflt = lambda k: 0
    return {k: a.get(k, dflt(k)) + (b.get(k, dflt(k)) - a.get(k, dflt(k))) * u for k in keys}

def params_at(name, t):
    ks = KEYS.get(name)
    if not ks:
        return {}
    prev = [k for k in ks if k[0] <= t][-1]
    nxt = [k for k in ks if k[0] > t]
    if not prev[2] or not nxt:
        return prev[1]
    u = (t - prev[0]) / (nxt[0][0] - prev[0])
    return lerp_params(prev[1], nxt[0][1], u)

def tween_flag(name, t):
    ks = KEYS.get(name)
    if not ks:
        return False
    prev = [k for k in ks if k[0] <= t][-1]
    return prev[2] and any(k[0] > t for k in ks)

def key_frames(name):
    ks = {0} | {k[0] for k in KEYS.get(name, [])} | {f for f, _ in SWAPS.get(name, [])}
    return sorted(k for k in ks if k < N)

def tween_params(name, t):
    return params_at(name, t)

def params_matrix(m0, tp, p):
    rot = math.radians(p.get('rot', 0))
    px, py = apply(m0, tp)
    c, si = math.cos(rot), math.sin(rot)
    rs = [c, si, -si, c, 0, 0]  # rotation only (no scale)
    m = mul([1, 0, 0, 1, px + p.get('dx', 0), py + p.get('dy', 0)], mul(rs, mul([1, 0, 0, 1, -px, -py], m0)))
    return m

def fmt(v):
    return f'{v:.6f}'.rstrip('0').rstrip('.') if abs(v) > 1e-9 else '0'

def write_matrix(inst, m):
    mel = inst.find(f'{NS}matrix/{NS}Matrix')
    for k, v in zip(('a', 'b', 'c', 'd', 'tx', 'ty'), m):
        dflt = 1 if k in ('a', 'd') else 0
        if abs(v - dflt) < 1e-9:
            mel.attrib.pop(k, None)
        else:
            mel.set(k, fmt(v))

def build(src, out_fla, prev_dir):
    src = Path(src)
    work = Path(prev_dir) / 'xfl_out'
    if work.exists():
        shutil.rmtree(work)
    shutil.copytree(src, work)

    doc = Doc(src)
    layers = rig_layers(doc)

    # ── rewrite the Ebo symbol timeline ──
    ebo_path = work / 'LIBRARY' / 'Ebo.xml'
    tree = ET.parse(ebo_path)
    root = tree.getroot()
    for layer in root.iter(f'{NS}DOMLayer'):
        name = layer.get('name')
        frames_el = layer.find(f'{NS}frames')
        tmpl = frames_el.find(f'{NS}DOMFrame')
        inst0 = tmpl.find(f'{NS}elements/{NS}DOMSymbolInstance')
        m0 = matrix_of(inst0)
        tpe = inst0.find(f'{NS}transformationPoint/{NS}Point')
        tp = (float(tpe.get('x')), float(tpe.get('y')))
        ks = key_frames(name)
        for fr in list(frames_el):
            frames_el.remove(fr)
        for i, k in enumerate(ks):
            end = ks[i + 1] if i + 1 < len(ks) else N
            fr = copy.deepcopy(tmpl)
            fr.set('index', str(k))
            if end - k > 1:
                fr.set('duration', str(end - k))
            else:
                fr.attrib.pop('duration', None)
            inst = fr.find(f'{NS}elements/{NS}DOMSymbolInstance')
            if name in MOTION:
                write_matrix(inst, params_matrix(m0, tp, params_at(name, k)))
                if tween_flag(name, k):
                    fr.set('tweenType', 'motion')
                    fr.set('motionTweenSnap', 'true')
                    fr.set('keyMode', '22017')
            if name in SWAPS:
                inst.set('firstFrame', str(swap_at(SWAPS[name], k)))
                inst.set('loop', 'single frame')
            frames_el.append(fr)
    tree.write(ebo_path, xml_declaration=False, encoding='utf-8')

    # ── main timeline: hold the Ebo instance for N frames, looping ──
    dpath = work / 'DOMDocument.xml'
    dtree = ET.parse(dpath)
    droot = dtree.getroot()
    tl = droot.find(f'{NS}timelines/{NS}DOMTimeline')
    for fr in tl.iter(f'{NS}DOMFrame'):
        fr.set('duration', str(N))
    dtree.write(dpath, xml_declaration=False, encoding='utf-8')

    # ── repackage .fla (mimetype first, stored) ──
    with zipfile.ZipFile(out_fla, 'w') as z:
        z.write(work / 'mimetype', 'mimetype', compress_type=zipfile.ZIP_STORED)
        for p in sorted(work.rglob('*')):
            rel = p.relative_to(work).as_posix()
            if rel == 'mimetype':
                continue
            if p.is_dir():
                z.writestr(rel + '/', b'')
            else:
                ct = zipfile.ZIP_STORED if p.suffix.lower() in ('.dat', '.jpg', '.jpeg', '.png', '.cache') else zipfile.ZIP_DEFLATED
                z.write(p, rel, compress_type=ct)

    # ── preview frames rendered from the WRITTEN file (what Animate will play) ──
    out_doc = Doc(work)
    stage_inst = out_doc.doc.find(f'.//{NS}DOMSymbolInstance')
    S = matrix_of(stage_inst)
    fdir = Path(prev_dir) / 'frames'
    if fdir.exists():
        shutil.rmtree(fdir)
    fdir.mkdir(parents=True)
    for t in range(N):
        L = rig_layers(out_doc, 'Ebo', t)
        # emulate classic-tween interpolation between written keyframes
        over = {}
        for l in L:
            if l['name'] in MOTION:
                base = [x for x in layers if x['name'] == l['name']][0]
                tpe = base['inst'].find(f'{NS}transformationPoint/{NS}Point')
                over[l['name']] = params_matrix(base['m'], (float(tpe.get('x')), float(tpe.get('y'))), tween_params(l['name'], t))
        w = world(L, 'A', over)
        body = ebo_svg(out_doc, L, w)
        (fdir / f'f{t:04d}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#ffffff"/><g transform="{mstr(S)}">{body}</g></svg>')
    print('ok', N, 'frames')

if __name__ == '__main__':
    build(*sys.argv[1:4])
