"""Build an Animate .fla holding a character's walk / run cycles, as editable symbols.

usage: python3 -I build_cycle_fla.py CAST_SRC WHO OUT.fla WORK_DIR CYCLE.json [CYCLE.json ...]

Each cycle becomes a graphic symbol "<Name>/<Name> <cycle>": a copy of the character's
own master rig (untouched art, faces and outfit) with a keyframe per cycle frame on the
body layers. The master rig symbol itself is copied over unchanged. The stage shows every
cycle looping side by side, at the cycles' own 24 fps.
"""
import sys, os, json, re, shutil, zipfile, hashlib
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_episode_fla import (ET, N, CAST, Library, import_rig, build_anim_symbol, new_id, _matrix_node)

REPO = Path(__file__).resolve().parents[2]
LABEL = {'walk': 'walk', 'fastwalk': 'fast walk', 'run': 'run'}

def main(cast_src, who, out_fla, work, *cycle_paths):
    src_folder, rig_sym, disp = CAST[who]
    rig = json.load(open(REPO / 'src' / 'cast' / 'data' / f'{who}.json'))
    work = Path(work)
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    lib = Library(work)
    rename, rig_el = import_rig(lib, Path(cast_src) / src_folder, rig_sym, disp)

    anims = []
    for cp in cycle_paths:
        cyc = json.load(open(cp))
        kind = Path(cp).stem.split('-', 1)[1]
        n = cyc['frames']
        recs = []
        for f in range(n):
            # cycles play in the rig's first view (Ebo: ¾); layers that view doesn't show stay empty
            v0 = {l['name']: (l.get('views') or [{'show': True}])[0] for l in rig['layers']}
            shown = [l for l in rig['layers'] if v0[l['name']]['show']]
            locals_ = {l['name']: (cyc['layers'][l['name']][f] if l['name'] in cyc['layers'] else v0[l['name']].get('m', l['m'])) for l in shown}
            recs.append({'locals': locals_, 'frames': {l['name']: v0[l['name']].get('first', l['first']) for l in shown},
                         'hidden': [l['name'] for l in rig['layers'] if not v0[l['name']]['show']]})
        name = f'{disp}/{disp} {LABEL.get(kind, kind)}'
        build_anim_symbol(lib, rig_el, rename[rig_sym], name, recs, n)
        anims.append((name, n))

    # ── stage: every cycle looping, side by side ──
    W, H, s = 1280, 720, 0.5
    total = 48
    tl = ET.Element(N('DOMTimeline'), {'name': 'Scene 1'})
    layers = ET.SubElement(tl, N('layers'))
    meas = json.load(open(REPO / 'src' / 'cast' / 'data' / 'measure.json'))[who]
    mid, y1 = meas['layers']['waist']['pivot'][0], meas['bounds'][3]
    for i, (name, n) in enumerate(anims):
        cx = W * (i + 1) / (len(anims) + 1)
        L = ET.SubElement(layers, N('DOMLayer'), {'name': name.split('/')[-1], 'color': '#4FFFFF', 'autoNamed': 'false'})
        fr = ET.SubElement(ET.SubElement(L, N('frames')), N('DOMFrame'), {'index': '0', 'duration': str(total), 'keyMode': '9728'})
        inst = ET.SubElement(ET.SubElement(fr, N('elements')), N('DOMSymbolInstance'),
                             {'libraryItemName': name, 'symbolType': 'graphic', 'loop': 'loop', 'firstFrame': '0'})
        inst.append(_matrix_node([s, 0, 0, s, cx - mid * s, 600 - y1 * s]))  # feet on y=600

    tmpl = ET.parse(Path(cast_src) / src_folder / 'DOMDocument.xml').getroot()
    doc = ET.Element(N('DOMDocument'))
    for k in ('xflVersion', 'creatorInfo', 'platform', 'versionInfo', 'majorVersion', 'buildNumber', 'filetypeGUID'):
        if tmpl.get(k):
            doc.set(k, tmpl.get(k))
    doc.set('width', str(W))
    doc.set('height', str(H))
    doc.set('frameRate', '24')
    doc.set('backgroundColor', '#F6F0E4')
    doc.set('currentTimeline', '1')
    doc.set('fileGUID', hashlib.md5(out_fla.encode()).hexdigest().upper())
    fol = ET.SubElement(doc, N('folders'))
    for name in lib.folders:
        ET.SubElement(fol, N('DOMFolderItem'), {'name': name, 'itemID': new_id()})
    syms = ET.SubElement(doc, N('symbols'))
    for href, iid, icon in lib.symbols:
        ET.SubElement(syms, N('Include'), {'href': href, 'itemIcon': icon, 'loadImmediate': 'false', 'itemID': iid})
    ET.SubElement(doc, N('timelines')).append(tl)
    ET.ElementTree(doc).write(work / 'DOMDocument.xml', encoding='utf-8', xml_declaration=False)

    src0 = Path(cast_src) / src_folder
    for f in ('PublishSettings.xml', 'MobileSettings.xml', 'mimetype'):
        if (src0 / f).exists():
            shutil.copy(src0 / f, work / f)
    (work / 'META-INF').mkdir(exist_ok=True)
    (work / 'META-INF' / 'metadata.xml').write_bytes(b'')
    (work / f'{Path(out_fla).stem}.xfl').write_text('PROXY-CS5')
    with zipfile.ZipFile(out_fla, 'w') as z:
        z.write(work / 'mimetype', 'mimetype', compress_type=zipfile.ZIP_STORED)
        for p in sorted(work.rglob('*')):
            rel = p.relative_to(work).as_posix()
            if rel == 'mimetype':
                continue
            if p.is_dir():
                z.writestr(rel + '/', b'')
            else:
                z.write(p, rel, compress_type=zipfile.ZIP_STORED if p.suffix.lower() == '.dat' else zipfile.ZIP_DEFLATED)
    print(f'{out_fla}: {", ".join(f"{a} ({n} frames)" for a, n in anims)}')

if __name__ == '__main__':
    main(*sys.argv[1:])
