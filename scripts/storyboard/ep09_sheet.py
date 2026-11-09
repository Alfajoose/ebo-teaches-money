"""Ep9 storyboard sheet, laid out like the user's reference board: a title pill, then rounded cells, each with
its number and time range in a yellow chip, the section in brackets, the panel, and "EBO: line" underneath.
Panels are rendered from the plan (src/series/ep09.tsx). Also writes shotlist.md.
usage: python3 -I scripts/storyboard/ep09_sheet.py PANEL_DIR OUT_DIR"""
import sys, glob, json, re, textwrap
from PIL import Image, ImageDraw, ImageFont
panels_dir, out = sys.argv[1:3]
src = open('src/series/ep09.tsx').read()
plan = src[src.index('export const EP09_PLAN'):src.index('export const EP09_SECTIONS')]
shots = re.findall(r"\{at: (\d+), line: ('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"), stage: '([^']+)'.*?action: ('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\}", plan, re.S)
words = json.load(open('src/series/data/ep09-words.json'))
END = words[-1]['e'] + 0.6
starts = [0.0] + [max(0, words[int(a)]['s'] - 0.08) for a, *_ in shots[1:]]
ends = starts[1:] + [END]
ims = sorted(glob.glob(f'{panels_dir}/s*.png'))
TAGS = {0: 'Hook', 3: 'Lock 1: No safety net', 6: 'Lock 2: Poverty tax', 10: 'Lock 3 reveal', 13: 'Where to start', 15: 'Close'}

F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
INK, YEL, BLUE, RED, GREY = '#1D1A1A', '#FCE7A6', '#CFE3FA', '#E5484D', '#55505A'
COLS, PW, PH, PAD, TXT = 8, 300, 533, 22, 210
CW, CH = PW + 2 * PAD, 104 + PH + TXT
rows = (len(shots) + COLS - 1) // COLS
W = 30 + COLS * (CW + 18) + 12
H = 150 + rows * (CH + 18) + 20
sheet = Image.new('RGB', (W, H), '#FFFDF8')
d = ImageDraw.Draw(sheet)

title = 'Ep9 Storyboard: Why Some People Never Escape Poverty'
tw = d.textlength(title, font=F('Bold', 54))
d.rounded_rectangle([30, 28, 30 + tw + 60, 112], radius=42, fill=BLUE)
d.text((60, 40), title, font=F('Bold', 54), fill=INK)
info = 'Style: Ebo rig, Peanut animation   |   Runtime: 0:56   |   Ebo (Dan), voice'
d.text((W - 30 - d.textlength(info, font=F('Medium', 26)), 56), info, font=F('Medium', 26), fill=INK)

md = ['# Ep 09 — Why Some People Never Escape Poverty: shot list (v2)', '', '| # | time | section | line | action |', '|---|---|---|---|---|']
fmt = lambda t: f'{int(t // 60)}:{int(t % 60):02d}'
for i, (at, line, stage, action) in enumerate(shots):
    line, action = eval(line), eval(action)
    x = 30 + (i % COLS) * (CW + 18)
    y = 150 + (i // COLS) * (CH + 18)
    d.rounded_rectangle([x, y, x + CW, y + CH], radius=20, fill='#fff', outline=INK, width=4)
    chip = f'{i + 1}. {fmt(starts[i])}–{fmt(ends[i])}'
    cw = d.textlength(chip, font=F('Bold', 26))
    d.rounded_rectangle([x + 12, y + 12, x + 32 + cw, y + 54], radius=14, fill=YEL)
    d.text((x + 22, y + 16), chip, font=F('Bold', 26), fill=INK)
    if i in TAGS:
        d.text((x + 22, y + 62), f'({TAGS[i]})', font=F('SemiBold', 24), fill=INK)
    sheet.paste(Image.open(ims[i]).convert('RGB').resize((PW, PH)), (x + PAD, y + 100))
    d.rectangle([x + PAD, y + 100, x + PAD + PW, y + 100 + PH], outline=INK, width=2)
    yy = y + 100 + PH + 14
    lines = textwrap.wrap('EBO: ' + line, 27)
    for k, ln in enumerate(lines[:6]):
        if k == 0:
            d.text((x + PAD, yy), 'EBO:', font=F('Bold', 23), fill=INK)
            d.text((x + PAD + d.textlength('EBO: ', font=F('Bold', 23)), yy), ln[5:], font=F('Medium', 23), fill=INK)
        else:
            d.text((x + PAD, yy), ln, font=F('Medium', 23), fill=INK)
        yy += 29
    md.append(f'| {i + 1} | {fmt(starts[i])}–{fmt(ends[i])} | {TAGS.get(i, "")} | {line.replace("|", "/")} | {action.replace("|", "/")} |')
sheet.save(f'{out}/storyboard.png')
open(f'{out}/shotlist.md', 'w').write('\n'.join(md) + '\n')
print('panels', len(shots), 'images', len(ims), 'size', sheet.size)
