"""Export a pose-library character (one symbol, one drawn pose per frame) to JSON for Remotion.

usage: python3 -I export_poselib.py XFL_DIR SYMBOL OUT.json

Konka is built this way: every frame of his symbol is a finished pose (body, arms and legs are
drawn swaps, placed per pose), with his eyes, pupils and mouth on their own layers so they can be
swapped on top of any pose (lip sync, blinks). For each pose we store, bottom to top, every
element on every layer: the swap symbol it shows and which frame, and its matrix in the
symbol's space (parent layers already applied). Each swap symbol's frames are stored once.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

src, sym, out = sys.argv[1:4]
doc = Doc(src)
tl = doc.timeline(sym)
layers = tl.findall(f'{NS}layers/{NS}DOMLayer')
by_rig = {L.get('layerRiggingIndex'): L for L in layers if L.get('layerRiggingIndex') is not None}
n = doc.length(tl)
symbols = {}  # swap symbol name -> list of frame svgs


def parent_world(layer, f, depth=0):
    fr = doc.frame_at(layer, f)
    pi = fr.get('parentLayerIndex') if fr is not None else None
    if pi is None or pi not in by_rig or depth > 32:
        return [1, 0, 0, 1, 0, 0]
    P = by_rig[pi]
    pm = doc.frame_instance_matrix(P, f) or [1, 0, 0, 1, 0, 0]
    return mul(parent_world(P, f, depth + 1), pm)


poses = []
for f in range(n):
    items = []
    for layer in reversed(layers):
        if layer.get('layerType') in ('guide', 'folder', 'mask') or layer.get('visible') == 'false':
            continue
        fr = doc.frame_at(layer, f)
        if fr is None:
            continue
        pw = parent_world(layer, f)
        els = fr.find(f'{NS}elements')
        first = True
        for el in (els if els is not None else []):
            tag = el.tag.replace(NS, '')
            if tag == 'DOMSymbolInstance':
                name = el.get('libraryItemName')
                if name not in doc.symbols:
                    continue
                if name not in symbols:
                    symbols[name] = [doc.symbol_svg(name, i) for i in range(doc.length(doc.timeline(name)))]
                m = (doc.frame_instance_matrix(layer, f) if first else None) or matrix_of(el)
                first = False
                items.append(dict(layer=layer.get('name'), sym=name, frame=doc.instance_frame(el, f - int(fr.get('index'))), m=[round(v, 4) for v in mul(pw, m)]))
            elif tag == 'DOMShape':
                items.append(dict(layer=layer.get('name'), svg=shape_svg(el), m=[round(v, 4) for v in pw]))
    poses.append(items)

json.dump(dict(symbol=sym, poses=poses, symbols=symbols), open(out, 'w'))
print(out, n, 'poses,', len(symbols), 'swap symbols,', os.path.getsize(out) // 1024, 'KB')
