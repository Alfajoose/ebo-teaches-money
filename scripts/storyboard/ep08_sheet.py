"""Ep7 storyboard sheet: one panel per shot (rendered from the plan, src/series/ep08.tsx) with the
shot number, timecode, size, line and action underneath. Also writes shotlist.md.
usage: python3 -I scripts/storyboard/ep08_sheet.py PANEL_DIR OUT_DIR"""
import sys, glob, json, re, textwrap
from PIL import Image, ImageDraw, ImageFont
panels_dir, out = sys.argv[1:3]
src = open('src/series/ep08.tsx').read()
plan = src[src.index('export const EP08_PLAN'):src.index('export const EP08_SECTIONS')]
shots = re.findall(r"\{at: ([^,]+|\{t: [\d.]+\}), line: ('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"), stage: '([^']+)'.*?action: ('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\}", plan, re.S)
words = json.load(open('src/series/data/ep08-words.json'))
def start(at):
    m = re.match(r'\{t: ([\d.]+)\}', at)
    return 0 if at == '0' else TIMED.pop(0) if m else max(0, words[int(at)]['s'] - 0.08)
ims = sorted(glob.glob(f'{panels_dir}/s*.png'))
TIMED = [words[9]['e'] + 0.1]  # the silent beat after "I don't get it."
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
PW, PH = 324, 576
COLS, TXT = 4, 250
COLS = 6
rows = (len(shots) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * (PW + 40) + 40, 170 + rows * (PH + TXT + 40)), '#F6F0E4')
d = ImageDraw.Draw(sheet)
d.text((40, 40), 'EBO TEACHES MONEY · EP 08 · Why Nice Guys Get Taken Advantage Of', font=F('Bold', 40), fill='#1D1A1A')
d.text((40, 100), 'Rule 19 format · 1:03, 30 shots · tracker: an open door, a lit phone, ? till the payoff (a crown) · Ebo big along the bottom · tiny stories with Christy and Ama · loops', font=F('Regular', 24), fill='#55505A')
md = ['# Ep 08 — Why Nice Guys Get Taken Advantage Of: shot list', '', '| # | time | size | line | action |', '|---|---|---|---|---|']
for i, (at, line, size, action) in enumerate(shots):
    line, action = eval(line), eval(action)
    x = 40 + (i % COLS) * (PW + 40)
    y = 170 + (i // COLS) * (PH + TXT + 40)
    sheet.paste(Image.open(ims[i]).resize((PW, PH)), (x, y))
    d.rectangle([x, y, x + PW, y + PH], outline='#1D1A1A', width=3)
    t = start(at)
    d.text((x, y + PH + 10), f'{i + 1}  ·  {int(t // 60)}:{t % 60:05.2f}  ·  {size}', font=F('Bold', 20), fill='#E5484D')
    yy = y + PH + 40
    for ln in textwrap.wrap(line, 30)[:3]:
        d.text((x, yy), ln, font=F('SemiBold', 19), fill='#1D1A1A'); yy += 24
    yy += 6
    for ln in textwrap.wrap(action, 34)[:6]:
        d.text((x, yy), ln, font=F('Regular', 16), fill='#55505A'); yy += 20
    md.append(f'| {i + 1} | {t:.2f}s | {size} | {line.replace("|", "/")} | {action.replace("|", "/")} |')
sheet.save(f'{out}/storyboard.png')
open(f'{out}/shotlist.md', 'w').write('\n'.join(md) + '\n')
print('panels', len(shots), 'images', len(ims))
