"""Write an HTML contact sheet of every multi-frame (swap) symbol used by a character rig."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xfl import *

def sheet(src, sym, out_html):
    doc = Doc(src)
    tl = doc.timeline(sym)
    rows, seen = [], set()
    for L in tl.findall(f'{NS}layers/{NS}DOMLayer'):
        inst = L.find(f'{NS}frames/{NS}DOMFrame/{NS}elements/{NS}DOMSymbolInstance')
        if inst is None:
            continue
        nm = inst.get('libraryItemName')
        if nm in seen or nm not in doc.symbols:
            continue
        seen.add(nm)
        n = doc.length(doc.timeline(nm))
        if n > 1:
            rows.append((L.get('name'), nm, n))
    cells, y = '', 40
    for lname, nm, n in rows:
        cells += f'<text x="10" y="{y}" font-size="22" font-family="sans-serif" font-weight="bold">{lname} ({nm.split("/")[-1].replace("&#032", "")})</text>'
        for i in range(n):
            cells += f'<g transform="translate({20 + i * 170} {y + 20})"><text x="0" y="14" font-size="16" fill="red">{i}</text><svg x="0" y="20" width="150" height="150" class="fit"><g>{doc.symbol_svg(nm, i)}</g></svg></g>'
        y += 210
    w = max(1200, 20 + max([r[2] for r in rows] + [1]) * 170)
    open(out_html, 'w').write(f'''<html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{y}">{cells}</svg>
<script>for(const s of document.querySelectorAll('svg.fit')){{const g=s.firstElementChild;const b=g.getBBox();const m=Math.max(b.width,b.height,1)*1.1;s.setAttribute('viewBox',`${{b.x+b.width/2-m/2}} ${{b.y+b.height/2-m/2}} ${{m}} ${{m}}`)}}</script></body></html>''')
    return rows

if __name__ == '__main__':
    print(sheet(*sys.argv[1:4]))
