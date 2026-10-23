import sys
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0])
from xfl import *

def rig_layers(doc, name='Ebo', f=0):
    """Return list of (layer_name, instance, local_matrix, parent_rig_index, rig_index) bottom->top."""
    tl = doc.timeline(name)
    out = []
    for layer in tl.findall(f'{NS}layers/{NS}DOMLayer'):
        fr = doc.frame_at(layer, f)
        inst = fr.find(f'{NS}elements/{NS}DOMSymbolInstance')
        out.append(dict(name=layer.get('name'), inst=inst, m=matrix_of(inst), parent=fr.get('parentLayerIndex'), rig=layer.get('layerRiggingIndex'), offset=f-int(fr.get('index'))))
    return out

def world(layers, mode='A', overrides=None):
    overrides = overrides or {}
    by_rig = {L['rig']: L for L in layers if L['rig'] is not None}
    def W(L):
        m = overrides.get(L['name'], L['m'])
        if mode == 'A' and L['parent'] is not None:
            return mul(W(by_rig[L['parent']]), m)
        return m
    return {L['name']: W(L) for L in layers}

def ebo_svg(doc, layers, worlds, frames=None, outer=None):
    frames = frames or {}
    parts = []
    for L in reversed(layers):
        inst = L['inst']
        fidx = frames.get(L['name'], doc.instance_frame(inst, L['offset']))
        parts.append(f'<g transform="{mstr(worlds[L["name"]])}">{doc.symbol_svg(inst.get("libraryItemName"), fidx)}</g>')
    return ''.join(parts)

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    doc = Doc(src)
    layers = rig_layers(doc)
    for mode in 'AB':
        w = world(layers, mode)
        body = ebo_svg(doc, layers, w)
        open(f'{out}/rig_{mode}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 -200 1000 1000"><rect x="0" y="-200" width="1000" height="1000" fill="#fff"/>{body}</svg>')
    # sheets of swap symbols
    for sym in ['eye 1','mouth','pupil 1','hand top 1','hand top 2','leg top 1','leg top 2']:
        n = doc.length(doc.timeline(sym))
        cells = ''.join(f'<g transform="translate({(i%8)*160+30} {(i//8)*200+40})"><text x="0" y="-10" font-size="16">{i}</text>{doc.symbol_svg(sym,i)}</g>' for i in range(n))
        rows = (n+7)//8
        fn = sym.replace(' ','_')
        open(f'{out}/sheet_{fn}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="{rows*200+60}"><rect width="100%" height="100%" fill="#fff"/>{cells}</svg>')
