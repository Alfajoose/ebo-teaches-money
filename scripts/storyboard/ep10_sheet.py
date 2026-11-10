"""Ep10 storyboard sheet (the user's board layout): panels from the Ep10-Board composition, lines and pictures
from episodes/ep10/script.md. No voice yet, so the times are estimates (Dan reads about 3 words a second).
usage: python3 -I scripts/storyboard/ep10_sheet.py PANEL_DIR OUT_DIR"""
import sys, glob, re, textwrap
from PIL import Image, ImageDraw
panels_dir, out = sys.argv[1:3]
rows_md = [r for r in open('episodes/ep10/script.md').read().splitlines() if re.match(r'\| \d+ \|', r)]
shots = [[c.strip() for c in r.strip('|').split('|')][1:3] for r in rows_md]
ims = sorted(glob.glob(f'{panels_dir}/s*.png'))
TAGS = {0: 'Cold open', 2: 'Hook', 3: 'The house', 4: 'Willing hands', 5: 'Next door', 6: 'The storm', 8: 'She stays calm', 10: 'With grace', 11: 'The answer', 12: 'Close'}
from PIL import ImageFont
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
INK, YEL, BLUE, GREY = '#1D1A1A', '#FCE7A6', '#CFE3FA', '#55505A'
COLS, PW, PH, PAD, TXT = 7, 320, 569, 22, 330
CW, CH = PW + 2 * PAD, 104 + PH + TXT
rows = (len(shots) + COLS - 1) // COLS
W = 30 + COLS * (CW + 18) + 12
H = 150 + rows * (CH + 18) + 20
sheet = Image.new('RGB', (W, H), '#FFFDF8')
d = ImageDraw.Draw(sheet)
title = 'Ep10 Storyboard: Marry a Woman Who…'
tw = d.textlength(title, font=F('Bold', 54))
d.rounded_rectangle([30, 28, 30 + tw + 60, 112], radius=42, fill=BLUE)
d.text((60, 40), title, font=F('Bold', 54), fill=INK)
info = 'Ebo, Ama, the neighbours (Mica, Christy)  |  ~55s  |  Ebo (Dan), voice'
d.text((W - 30 - d.textlength(info, font=F('Medium', 26)), 56), info, font=F('Medium', 26), fill=INK)
t = 0.0
fmt = lambda s: f'{int(s // 60)}:{int(s % 60):02d}'
for i, (line, pic) in enumerate(shots):
    cold = line.startswith('*(')
    dur = 2.0 if cold else len(line.split()) / 3.0 + 0.3
    x = 30 + (i % COLS) * (CW + 18)
    y = 150 + (i // COLS) * (CH + 18)
    d.rounded_rectangle([x, y, x + CW, y + CH], radius=20, fill='#fff', outline=INK, width=4)
    chip = f'{i + 1}. ~{fmt(t)}–{fmt(t + dur)}'
    cw = d.textlength(chip, font=F('Bold', 26))
    d.rounded_rectangle([x + 12, y + 12, x + 32 + cw, y + 54], radius=14, fill=YEL)
    d.text((x + 22, y + 16), chip, font=F('Bold', 26), fill=INK)
    if i in TAGS:
        d.text((x + 22, y + 62), f'({TAGS[i]})', font=F('SemiBold', 24), fill=INK)
    sheet.paste(Image.open(ims[i]).convert('RGB').resize((PW, PH)), (x + PAD, y + 100))
    d.rectangle([x + PAD, y + 100, x + PAD + PW, y + 100 + PH], outline=INK, width=2)
    yy = y + 100 + PH + 14
    for k, ln in enumerate(textwrap.wrap('EBO: ' + ('(no voice: rain, a creak, a crash)' if cold else line), 26)[:6]):
        if k == 0:
            d.text((x + PAD, yy), 'EBO:', font=F('Bold', 23), fill=INK)
            d.text((x + PAD + d.textlength('EBO: ', font=F('Bold', 23)), yy), ln[5:], font=F('Medium', 23), fill=INK)
        else:
            d.text((x + PAD, yy), ln, font=F('Medium', 23), fill=INK)
        yy += 29
    yy += 8
    for ln in textwrap.wrap(pic, 33)[:5]:
        d.text((x + PAD, yy), ln, font=F('Regular', 19), fill=GREY)
        yy += 24
    t += dur
sheet.save(f'{out}/storyboard.png')
print('panels', len(shots), 'images', len(ims), 'size', sheet.size, 'est', round(t, 1))
