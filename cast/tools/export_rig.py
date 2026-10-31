"""Export a character rig from an XFL folder to JSON for the Remotion RigCharacter component.

usage: python3 -I export_rig.py XFL_DIR SYMBOL OUT.json
Each layer (and each extra instance on a layer, as NAME__2): name, rig id, parent rig id, local matrix, pivot (symbol coords),
and the SVG markup of every frame of the layer's symbol (for eye/mouth/outfit swaps).

Views: if the rig symbol has several keyframes (Ebo's: ¾, front, front hands-in, back), each
keyframe is a view. Every layer then also gets `views`: per view its matrix, swap frame and whether
it's shown there (a layer can be empty in a view, like Ebo's in-front arm or his back-view face).
The top-level m / first are the layer's first view in which it's shown.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

src, sym, out = sys.argv[1:4]
doc = Doc(src)
tl = doc.timeline(sym)
all_layers = tl.findall(f'{NS}layers/{NS}DOMLayer')
starts = sorted({int(fr.get('index')) for L in all_layers for fr in L.findall(f'{NS}frames/{NS}DOMFrame')})
layers = []
for L in all_layers:
    per_view = []  # per view: list of instances (may be empty) and the frame's parent
    for v in starts:
        fr = doc.frame_at(L, v)
        insts = fr.findall(f'{NS}elements/{NS}DOMSymbolInstance') if fr is not None else []
        per_view.append((insts, fr.get('parentLayerIndex') if fr is not None else None))
    n_inst = max(len(i) for i, _ in per_view)
    for k in reversed(range(n_inst)):
        present = [(vi, insts[k], par) for vi, (insts, par) in enumerate(per_view) if len(insts) > k]
        _, inst0, par0 = present[0]
        name = inst0.get('libraryItemName')
        for _, inst, _ in present:
            if inst.get('libraryItemName') != name:
                sys.exit(f'{L.get("name")}: different symbols in different views ({name} / {inst.get("libraryItemName")})')
        n = doc.length(doc.timeline(name))
        frames = [doc.symbol_svg(name, i) for i in range(n)]
        lname = L.get('name') if k == 0 else f"{L.get('name')}__{k + 1}"
        if k:
            print(f'  note: layer {L.get("name")} holds extra instance {name} -> exported as {lname}')
        first_of = lambda inst: min(n - 1, int(inst.get('firstFrame', '0'))) if inst.get('loop') == 'single frame' else 0
        tp = inst0.find(f'{NS}transformationPoint/{NS}Point')
        rec = dict(
            name=lname,
            rig=L.get('layerRiggingIndex') if k == 0 else None,
            parent=par0,
            m=matrix_of(inst0),
            tp=[float(tp.get('x', '0')), float(tp.get('y', '0'))] if tp is not None else [0, 0],
            first=first_of(inst0),
            frames=frames,
        )
        if len(starts) > 1:
            views = []
            for vi in range(len(starts)):
                hit = next((x for x in present if x[0] == vi), None)
                if hit is None:
                    views.append(dict(show=False))
                    continue
                f = first_of(hit[1])
                # a swap parked on an empty frame (the back view's face) stays hidden
                views.append(dict(show=bool(frames[f].strip()), m=matrix_of(hit[1]), first=f))
            rec['views'] = views
        layers.append(rec)
layers.reverse()  # bottom -> top draw order
data = dict(symbol=sym, layers=layers)
if len(starts) > 1:
    data['views'] = len(starts)
json.dump(data, open(out, 'w'))
print(out, len(layers), 'layers', f'{len(starts)} views,', sum(len(''.join(l['frames'])) for l in layers) // 1024, 'KB')
