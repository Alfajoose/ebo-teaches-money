"""Ep12 storyboard sheet (the user's board layout). usage: python3 -I scripts/storyboard/ep12_sheet.py PANEL_DIR OUT_DIR"""
import sys, glob, re, textwrap
from PIL import Image, ImageDraw, ImageFont
panels_dir, out = sys.argv[1:3]
rows_md = [r for r in open('episodes/ep12/script.md').read().splitlines() if re.match(r'\| \d+ \|', r)]
shots = [[c.strip() for c in r.strip('|').split('|')][1:4] for r in rows_md]
ims = sorted(glob.glob(f'{panels_dir}/s*.png'))
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
INK, YEL, BLUE, GREY, RED = '#1D1A1A', '#FCE7A6', '#CFE3FA', '#55505A', '#E5484D'
COLS, PW, PH, PAD, TXT = 10, 270, 480, 16, 230
CW, CH = PW + 2 * PAD, 104 + PH + TXT
W = 30 + COLS * (CW + 18) + 12
H = 150 + (CH + 18) * ((len(shots) + COLS - 1) // COLS) + 20
sheet = Image.new('RGB', (W, H), '#FFFDF8'); d = ImageDraw.Draw(sheet)
title = 'Ep12 Storyboard: Why Saying Sorry Too Much Makes People Respect You Less'
d.rounded_rectangle([30, 28, 30 + d.textlength(title, font=F('Bold', 50)) + 60, 112], radius=42, fill=BLUE)
d.text((60, 42), title, font=F('Bold', 50), fill=INK)
info = 'Experiment: Ebo narrates, his stick-figure doodles act it out  |  5-beat format  |  ~42s, 40 shots'
d.text((W - 30 - d.textlength(info, font=F('Medium', 26)), 128 - 30), info, font=F('Medium', 26), fill=GREY)
for i, (beat, line, pic) in enumerate(shots):
    who = 'EBO' if line not in ('—', '') else 'NO LINE'
    x = 30 + (i % COLS) * (CW + 18); y = 150 + (i // COLS) * (CH + 18)
    d.rounded_rectangle([x, y, x + CW, y + CH], radius=20, fill='#fff', outline=INK, width=4)
    chip = f'{i + 1}. {beat}'
    d.rounded_rectangle([x + 12, y + 12, x + 32 + d.textlength(chip, font=F('Bold', 24)), y + 52], radius=14, fill=YEL)
    d.text((x + 22, y + 16), chip, font=F('Bold', 24), fill=INK)
    sheet.paste(Image.open(ims[i]).convert('RGB').resize((PW, PH)), (x + PAD, y + 100))
    d.rectangle([x + PAD, y + 100, x + PAD + PW, y + 100 + PH], outline=INK, width=2)
    yy = y + 100 + PH + 12
    d.text((x + PAD, yy), who.replace('*', '').upper().replace('—', 'NO LINE') + ':', font=F('Bold', 20), fill=RED); yy += 26
    for ln in textwrap.wrap(line.replace('*', ''), 30)[:5]:
        d.text((x + PAD, yy), ln, font=F('Medium', 21), fill=INK); yy += 26
    yy += 6
    for ln in textwrap.wrap(pic.replace('*', ''), 36)[:4]:
        d.text((x + PAD, yy), ln, font=F('Regular', 17), fill=GREY); yy += 21
sheet.save(f'{out}/storyboard.png'); print('panels', len(shots), 'images', len(ims), sheet.size)
