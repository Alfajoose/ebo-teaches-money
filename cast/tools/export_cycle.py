"""Copy a walk / run cycle onto a master character, motion only.

usage: python3 -I export_cycle.py CYCLE_XFL CYCLE_SYMBOL MASTER_XFL MASTER_SYMBOL OUT.json

The cycle files hold older versions of the characters (older faces, Mica's earlier
"Konka" head). Only the body motion is taken: for each body layer and frame, the cycle's rotation and
pivot position. The part keeps the master's own shape (its scale / skew), so a part that
was redrawn or resized since the cycle was made (Ebo's leg, Mica's head) isn't changed.
Face layers (eyes, pupils, mouth, ears), symbols, outfit swaps and art all stay the
master's; they ride along because they're parented to the head.
A part whose drawing differs from the master's (Mica's head vs the old Konka head) can't
take the cycle's absolute placement, so it gets the cycle's movement relative to the
cycle's first frame, added to the master's own placement.
Parents are matched by layer name. Nothing is scaled (house rule).
"""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

BODY = ['waist', 'torso', 'head', 'hand_top_1', 'hand_down_1_', 'hand_top_2', 'hand_down_2',
        'leg_top_1', 'leg_down_1_', 'leg_top_2', 'leg_down_2']

def layer_frames(doc, sym):
    """name -> list over frames of (matrix, pivot, parent layer name, symbol) for the layer's first instance."""
    tl = doc.timeline(sym)
    n = doc.length(tl)
    out = {}
    all_layers = tl.findall(f'{NS}layers/{NS}DOMLayer')
    rig_name = {L.get('layerRiggingIndex'): L.get('name') for L in all_layers if L.get('layerRiggingIndex') is not None}
    for L in all_layers:
        seq = []
        for fr in L.findall(f'{NS}frames/{NS}DOMFrame'):
            inst = fr.find(f'{NS}elements/{NS}DOMSymbolInstance')
            if inst is None:
                continue
            if fr.get('tweenType'):
                sys.exit(f'{L.get("name")}: tweened frames are not supported (cycle keys are expected to be held)')
            tp = inst.find(f'{NS}transformationPoint/{NS}Point')
            rec = (matrix_of(inst), [float(tp.get('x', '0')), float(tp.get('y', '0'))] if tp is not None else [0.0, 0.0], rig_name.get(fr.get('parentLayerIndex')), inst.get('libraryItemName'))
            seq += [rec] * int(fr.get('duration', '1'))
        out[L.get('name')] = (seq + [seq[-1]] * n)[:n] if seq else []
    return out, n

def rot(m):
    return math.atan2(m[1], m[0])

def with_rotation(shape, angle):
    """The master part's linear shape (scale/skew, rotation removed), turned to `angle`."""
    a0 = -rot(shape)
    c, s = math.cos(a0), math.sin(a0)
    k = (c * shape[0] - s * shape[1], s * shape[0] + c * shape[1], c * shape[2] - s * shape[3], s * shape[2] + c * shape[3])
    c, s = math.cos(angle), math.sin(angle)
    return (c * k[0] - s * k[1], s * k[0] + c * k[1], c * k[2] - s * k[3], s * k[2] + c * k[3])

def main(cyc_dir, cyc_sym, mst_dir, mst_sym, out):
    cyc, n = layer_frames(Doc(cyc_dir), cyc_sym)
    mst, _ = layer_frames(Doc(mst_dir), mst_sym)
    # a closing frame that repeats frame 0 is only there to close the loop in Animate
    if n > 1 and all(max(abs(u - v) for u, v in zip(cyc[k][-1][0], cyc[k][0][0])) < 0.01 for k in BODY):
        n -= 1
    layers = {}
    for name in BODY:
        m0, tp_m, par_m, sym_m = mst[name][0]
        pivot = lambda m, tp: (m[0] * tp[0] + m[2] * tp[1] + m[4], m[1] * tp[0] + m[3] * tp[1] + m[5])
        c0, tp_c0 = cyc[name][0][0], cyc[name][0][1]
        same_part = cyc[name][0][3] == sym_m
        if not same_part:
            print(f'  {name}: drawing differs from the master ({cyc[name][0][3]} vs {sym_m}), copying relative motion')
        seq = []
        for f in range(n):
            mc, tp_c, par_c, _ = cyc[name][f]
            if par_c != par_m:
                sys.exit(f'{name}: parent differs between cycle ({par_c}) and master ({par_m})')
            if same_part:
                # the cycle's rotation on the master's part, pivot placed where the cycle's pivot is
                ang, (px, py) = rot(mc), pivot(mc, tp_c)
            else:
                # the master's placement, moved and turned as much as the cycle moves from its first frame
                (bx, by), (cx, cy), (qx, qy) = pivot(m0, tp_m), pivot(c0, tp_c0), pivot(mc, tp_c)
                ang, px, py = rot(m0) + rot(mc) - rot(c0), bx + qx - cx, by + qy - cy
            a, b, c, d = with_rotation(m0, ang)
            tx = px - (a * tp_m[0] + c * tp_m[1])
            ty = py - (b * tp_m[0] + d * tp_m[1])
            seq.append([round(v, 5) for v in (a, b, c, d, tx, ty)])
        layers[name] = seq
    json.dump(dict(source=os.path.basename(cyc_dir.rstrip('/')), symbol=cyc_sym, fps=24, frames=n, layers=layers), open(out, 'w'))
    print(f'{out}: {n} frames at 24 fps, {len(layers)} body layers')

if __name__ == '__main__':
    main(*sys.argv[1:6])
