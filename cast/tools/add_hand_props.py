"""Put hand props inside Ebo's rig (cast/masters/Ebo.fla).

usage: python3 -I add_hand_props.py MASTER.fla HAND_PROPS.json OUT.fla WORK_DIR
HAND_PROPS.json comes from `node scripts/hand-props/run.mjs out/hand-props/hand-props.json`
(the prop drawings of src/cast/handProps.tsx plus each forearm's hand tip per view).

Adds to the master:
  - a graphic symbol `Ebo_HandProps`: frame 0 is empty (empty hand), then one prop per frame,
    in the order of HAND_PROPS, each frame labelled with the prop's name (hand-drawn waver baked in);
  - one layer per forearm, parented to it, holding one instance of that symbol at the hand tip:
    prop_R (the right arm behind the head), prop_R_front (the right arm in front), prop_L.
    The prop layers sit at the top of the rig, so a held prop draws in front of him.
    Each forearm becomes a parent layer (it gets a layerRiggingIndex) so the prop rides it.
    The instance is placed upright in the rest pose; pick the prop with the instance's frame
    (Looping: Single frame, First: N) and it follows the arm.
Re-running replaces what an earlier run added.
"""
import sys, os, json, math, copy, time, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_episode_fla as B
from fla_extract import extract

N = B.N
master, props_json, out_fla, work = sys.argv[1:5]
work = Path(work)
if work.exists():
    import shutil
    shutil.rmtree(work)
extract(master, str(work))
data = json.load(open(props_json))
S = data['scale']
SYM = 'Ebo_HandProps'

# ── the props symbol ──
root = ET.Element(N('DOMSymbolItem'), {'name': SYM, 'itemID': B.new_id(), 'symbolType': 'graphic', 'lastModified': str(int(time.time()))})
tl = ET.SubElement(ET.SubElement(root, N('timeline')), N('DOMTimeline'), {'name': SYM})
layer = ET.SubElement(ET.SubElement(tl, N('layers')), N('DOMLayer'), {'name': 'props', 'color': '#4FFF4F'})
frames = ET.SubElement(layer, N('frames'))
fr = ET.SubElement(frames, N('DOMFrame'), {'index': '0', 'keyMode': '9728', 'name': 'empty', 'labelType': 'name'})
ET.SubElement(fr, N('elements'))
for i, p in enumerate(data['props']):
    fr = ET.SubElement(frames, N('DOMFrame'), {'index': str(i + 1), 'keyMode': '9728', 'name': p['name'], 'labelType': 'name'})
    els = ET.SubElement(fr, N('elements'))
    # drawn in rig units: the props are sized in world px, the rig is drawn 1/S bigger than it shows
    for e in B.svg_to_elements(f'<g transform="scale({1 / S})">{p["svg"]}</g>', rough=True):
        els.append(e)
ET.ElementTree(root).write(work / 'LIBRARY' / f'{SYM}.xml', encoding='utf-8', xml_declaration=False)

# ── register it in the document ──
doc_p = work / 'DOMDocument.xml'
doc_txt = doc_p.read_text(encoding='utf-8')
inc = f'<Include href="{SYM}.xml" itemIcon="1" loadImmediate="false" itemID="{root.get("itemID")}" lastModified="{root.get("lastModified")}"/>'
import re
doc_txt = re.sub(rf'\s*<Include href="{SYM}\.xml"[^>]*/>', '', doc_txt)
doc_txt = doc_txt.replace('<Include href="Ebo.xml"', inc + '\n      <Include href="Ebo.xml"', 1)
doc_p.write_text(doc_txt, encoding='utf-8')

# ── the rig: forearms become parents, a prop layer above each ──
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')
rig_p = work / 'LIBRARY' / 'Ebo.xml'
rig = ET.parse(rig_p).getroot()
layers_el = rig.find(f'{N("timeline")}/{N("DOMTimeline")}/{N("layers")}')
for L in list(layers_el):
    if L.get('name') in data['layers']:
        layers_el.remove(L)
used = [int(L.get('layerRiggingIndex')) for L in layers_el if L.get('layerRiggingIndex')]
nxt = max(used) + 1
by_name = {L.get('name'): L for L in layers_el}
starts = sorted({int(f.get('index')) for L in layers_el for f in L.findall(f'{N("frames")}/{N("DOMFrame")}')})
anchors = data['anchors']

for prop_layer, fore in data['layers'].items():
    F = by_name[fore]
    if not F.get('layerRiggingIndex'):
        F.set('layerRiggingIndex', str(nxt))
        nxt += 1
    ri = F.get('layerRiggingIndex')
    P = ET.Element(N('DOMLayer'), {'name': prop_layer, 'color': '#FF4FFF', 'autoNamed': 'false'})
    pf = ET.SubElement(P, N('frames'))
    for ffr in F.findall(f'{N("frames")}/{N("DOMFrame")}'):
        idx = int(ffr.get('index'))
        attrs = {'index': str(idx), 'keyMode': '9728', 'parentLayerIndex': ri,
                 'rigPropagationMatrix': '{"a":65536,"b":0,"c":0,"d":65536,"tx":0,"ty":0}'}
        if ffr.get('duration'):
            attrs['duration'] = ffr.get('duration')
        nf = ET.SubElement(pf, N('DOMFrame'), attrs)
        els = ET.SubElement(nf, N('elements'))
        view = starts.index(idx) if idx in starts else 0
        a = anchors[view].get(fore) if view < len(anchors) else None
        if ffr.find(f'{N("elements")}/{N("DOMSymbolInstance")}') is None or not a:
            continue
        # upright in the rest pose: undo the forearm's own turn
        r = math.radians(-a['angle'])
        m = [math.cos(r), math.sin(r), -math.sin(r), math.cos(r), a['hand'][0], a['hand'][1]]
        inst = ET.SubElement(els, N('DOMSymbolInstance'), {'libraryItemName': SYM, 'symbolType': 'graphic', 'loop': 'single frame', 'firstFrame': '0'})
        mx = ET.SubElement(inst, N('matrix'))
        ET.SubElement(mx, N('Matrix'), {k: B.fnum(v) for k, v in zip(('a', 'b', 'c', 'd', 'tx', 'ty'), m)})
        tp = ET.SubElement(inst, N('transformationPoint'))
        ET.SubElement(tp, N('Point'), {'x': '0', 'y': '0'})
    # drawn on top of the whole body (a held prop is in front, even in the arm behind the head);
    # the parenting, not the layer order, keeps it on the forearm
    layers_el.insert(0, P)

ET.ElementTree(rig).write(rig_p, encoding='utf-8', xml_declaration=False)

# ── zip ──
with zipfile.ZipFile(out_fla, 'w') as z:
    z.write(work / 'mimetype', 'mimetype', compress_type=zipfile.ZIP_STORED)
    for p in sorted(work.rglob('*')):
        if p.is_file() and p.name != 'mimetype':
            z.write(p, str(p.relative_to(work)), compress_type=zipfile.ZIP_STORED if p.suffix.lower() in ('.dat', '.jpg', '.jpeg') else zipfile.ZIP_DEFLATED)
print(f'wrote {out_fla}: {SYM} ({len(data["props"])} props + empty), layers {", ".join(data["layers"])}')
