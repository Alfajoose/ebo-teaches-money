"""Give a one-view (¾) rig front and back views, laid out like Ebo's master: frame 1 = ¾ (as drawn),
frame 2 = front, frame 3 = front (Ebo's "hands-in" slot), frame 4 = back.

usage: python3 -I add_views.py XFL_DIR SYMBOL RIG_JSON MEASURE_JSON MEASURE_KEY

Built from the rig's own parts (no new drawing):
  front — the eyes, pupils and mouth slide to the middle of the face, the ears sit evenly either side;
  back  — the face (eyes, pupils, mouth) is hidden, the ears sit evenly either side.
The symbol is trimmed to its first keyframe first (a master's later keys are test animation).
Edits the XFL folder in place; re-export the rig (export_rig.py) and re-measure afterwards.
"""
import sys, os, re, json, copy
import xml.etree.ElementTree as ET

NSURI = 'http://ns.adobe.com/xfl/2008/'
ET.register_namespace('', NSURI)
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')
N = lambda t: f'{{{NSURI}}}{t}'

xfl, sym, rig_json, measure_json, mkey = sys.argv[1:6]
rig = json.load(open(rig_json))
meas = json.load(open(measure_json))[mkey]['layers']
by_name = {l['name']: l for l in rig['layers']}
by_rig = {l['rig']: l for l in rig['layers'] if l.get('rig') is not None}

def lin(m):
    return (m[0], m[1], m[2], m[3])

def mul2(p, q):  # 2x2, as (a, b, c, d) with x' = a x + c y
    a1, b1, c1, d1 = p
    a2, b2, c2, d2 = q
    return (a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2)

def world_lin(l):
    out = lin(l['m'])
    p = l.get('parent')
    while p is not None and p in by_rig:
        par = by_rig[p]
        out = mul2(lin(par['m']), out)
        p = par.get('parent')
    return out

def parent_lin(l):
    p = l.get('parent')
    return world_lin(by_rig[p]) if p is not None and p in by_rig else (1, 0, 0, 1)

def to_local(l, dx, dy=0.0):
    a, b, c, d = parent_lin(l)
    det = a * d - b * c or 1
    return ((d * dx - c * dy) / det, (-b * dx + a * dy) / det)

cx = lambda n: meas[n]['center'][0]
names = [l['name'] for l in rig['layers']]
base = lambda n: n.split('__')[0]
eyes = [n for n in names if base(n).startswith('eye')]
pupils = [n for n in names if base(n).startswith('pupil')]
mouths = [n for n in names if base(n).startswith('mouth')]
ears = sorted([n for n in names if base(n).startswith('ear')], key=cx)
face = eyes + pupils + mouths

# the middle of the face: halfway between the ears (the head drawing itself can carry a hat or hair)
c = (cx(ears[0]) + cx(ears[-1])) / 2 if len(ears) >= 2 else meas['head']['center'][0]
shift = {}
if eyes:
    ex = sum(cx(n) for n in eyes) / len(eyes)
    for n in eyes:
        shift[n] = c - ex
    for n in pupils:
        par = by_rig.get(by_name[n].get('parent'))
        if not (par and base(par['name']).startswith('eye')):
            shift[n] = c - ex
for n in mouths:
    shift[n] = c - cx(n)
if len(ears) >= 2:
    half = max(c - cx(ears[0]), cx(ears[-1]) - c)
    shift[ears[0]] = (c - half) - cx(ears[0])
    shift[ears[-1]] = (c + half) - cx(ears[-1])

# ── edit the symbol ──
path = None
for root, _, files in os.walk(os.path.join(xfl, 'LIBRARY')):
    for f in files:
        if f.endswith('.xml'):
            p = os.path.join(root, f)
            head = open(p, encoding='utf8').read(600)
            if re.search(r'<DOMSymbolItem[^>]*\bname="%s"' % re.escape(sym), head):
                path = p
if path is None:
    sys.exit(f'symbol {sym} not found')
tree = ET.parse(path)
tl = tree.getroot().find(f"{N('timeline')}/{N('DOMTimeline')}")
layers = tl.findall(f"{N('layers')}/{N('DOMLayer')}")

def set_tx(inst, dx, dy):
    mm = inst.find(f"{N('matrix')}/{N('Matrix')}")
    if mm is None:
        mm = ET.SubElement(ET.SubElement(inst, N('matrix')), N('Matrix'))
    mm.set('tx', f"{float(mm.get('tx', '0')) + dx:.4f}")
    mm.set('ty', f"{float(mm.get('ty', '0')) + dy:.4f}")

# the export names a layer's extra instances NAME__2, …: match by (layer name, instance index)
for L in layers:
    fe = L.find(N('frames'))
    frs = fe.findall(N('DOMFrame'))
    f0 = next((fr for fr in frs if fr.get('index') == '0'), frs[0])
    for fr in frs:
        if fr is not f0:
            fe.remove(fr)
    for k in ('duration', 'tweenType', 'motionTweenSnap', 'easeMethodName', 'acceleration'):
        f0.attrib.pop(k, None)
    lname = re.sub(r'[^A-Za-z0-9_]', '_', L.get('name') or '')
    for vi, kind in ((1, 'front'), (2, 'front'), (3, 'back')):
        fr = copy.deepcopy(f0)
        fr.set('index', str(vi))
        insts = fr.findall(f"{N('elements')}/{N('DOMSymbolInstance')}")
        for k, inst in enumerate(insts):
            nm = lname if k == 0 else f'{lname}__{k + 1}'
            if nm not in by_name:
                nm = next((n for n in names if n.lower() == nm.lower()), nm)
            if kind == 'back' and nm in face:
                fr.find(N('elements')).remove(inst)
                continue
            if nm in shift and nm in by_name:
                dx, dy = to_local(by_name[nm], shift[nm])
                set_tx(inst, dx, dy)
        fe.append(fr)
tree.write(path, encoding='utf-8', xml_declaration=False)
print(f'{sym}: views ¾ / front / front / back added (face centre x={c:.0f}; moved: {", ".join(sorted(shift))})')
