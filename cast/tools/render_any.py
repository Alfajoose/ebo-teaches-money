"""Render main timeline frame + every rigged character symbol of an XFL folder to SVG."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

def bbox_svg(svg_body, w, h):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}"><rect width="{w}" height="{h}" fill="#fff"/>{svg_body}</svg>'

src, out, tag = sys.argv[1], sys.argv[2], sys.argv[3]
doc = Doc(src)
W, H = int(doc.doc.get('width', 550)), int(doc.doc.get('height', 400))
tl = doc.doc.find(f'{NS}timelines/{NS}DOMTimeline')
open(f'{out}/{tag}__STAGE.svg', 'w').write(bbox_svg(doc.timeline_svg(tl, 0), W, H))
for name, el in doc.symbols.items():
    t = el.find(f'{NS}timeline/{NS}DOMTimeline')
    if any(fr.get('parentLayerIndex') for fr in t.iter(f'{NS}DOMFrame')):
        body = doc.symbol_svg(name, 0)
        safe = name.replace('/', '_').replace(' ', '_').replace('&#032', '')
        # symbols live in their own coords; draw big canvas and let the viewer crop
        open(f'{out}/{tag}__{safe}.svg', 'w').write(bbox_svg(f'<g transform="translate(600 900)">{body}</g>', 1800, 1800))
print('ok', tag)
