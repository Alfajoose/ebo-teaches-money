"""Export a character rig from an XFL folder to JSON for the Remotion RigCharacter component.

usage: python3 -I export_rig.py XFL_DIR SYMBOL OUT.json
Each layer (and each extra instance on a layer, as NAME__2): name, rig id, parent rig id, local matrix, pivot (symbol coords),
and the SVG markup of every frame of the layer's symbol (for eye/mouth/outfit swaps).
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

src, sym, out = sys.argv[1:4]
doc = Doc(src)
tl = doc.timeline(sym)
layers = []
for L in tl.findall(f'{NS}layers/{NS}DOMLayer'):
    fr = L.find(f'{NS}frames/{NS}DOMFrame')
    insts = fr.findall(f'{NS}elements/{NS}DOMSymbolInstance')
    # a layer can hold several instances (e.g. both eyes on one layer); later ones draw on top
    for k, inst in reversed(list(enumerate(insts))):
        name = inst.get('libraryItemName')
        n = doc.length(doc.timeline(name))
        tp = inst.find(f'{NS}transformationPoint/{NS}Point')
        if k:
            print(f'  note: layer {L.get("name")} holds extra instance {name} -> exported as {L.get("name")}__{k + 1}')
        layers.append(dict(
            name=L.get('name') if k == 0 else f"{L.get('name')}__{k + 1}",
            rig=L.get('layerRiggingIndex') if k == 0 else None,
            parent=fr.get('parentLayerIndex'),
            m=matrix_of(inst),
            tp=[float(tp.get('x', '0')), float(tp.get('y', '0'))] if tp is not None else [0, 0],
            first=int(inst.get('firstFrame', '0')) if inst.get('loop') == 'single frame' else 0,
            frames=[doc.symbol_svg(name, i) for i in range(n)],
        ))
layers.reverse()  # bottom -> top draw order
json.dump(dict(symbol=sym, layers=layers), open(out, 'w'))
print(out, len(layers), 'layers', sum(len(''.join(l['frames'])) for l in layers) // 1024, 'KB')
