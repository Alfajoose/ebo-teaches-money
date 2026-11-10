"""Ep11 storyboard sheet (the user's board layout): panels from the Ep11-Board composition; who / line / picture /
shot from episodes/ep11/script.md. No voice yet, so the times are estimates (brisk: ~3.4 words a second).
usage: python3 -I scripts/storyboard/ep11_sheet.py PANEL_DIR OUT_DIR"""
import sys, glob, re, textwrap
from PIL import Image, ImageDraw, ImageFont
panels_dir, out = sys.argv[1:3]
rows_md = [r for r in open('episodes/ep11/script.md').read().splitlines() if re.match(r'\| \d+ \|', r)]
shots = [[c.strip() for c in r.strip('|').split('|')][1:5] for r in rows_md]
ims = sorted(glob.glob(f'{panels_dir}/s*.png'))
TAGS = {0: 'Cold open', 3: 'The problem', 6: 'Why', 9: 'The result', 10: 'The turn', 12: 'The fix', 15: 'Payoff', 16: 'Close'}
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
INK, YEL, BLUE, GREY, RED = '#1D1A1A', '#FCE7A6', '#CFE3FA', '#55505A', '#E5484D'
COLS, PW, PH, PAD, TXT = 9, 300, 533, 20, 300
CW, CH = PW + 2 * PAD, 104 + PH + TXT
rows = (len(shots) + COLS - 1) // COLS
W = 30 + COLS * (CW + 18) + 12
H = 150 + rows * (CH + 18) + 20
sheet = Image.new('RGB', (W, H), '#FFFDF8')
d = ImageDraw.Draw(sheet)
title = 'Ep11 Storyboard: The Dangerous Side of Being Too Available'
tw = d.textlength(title, font=F('Bold', 54))
d.rounded_rectangle([30, 28, 30 + tw + 60, 112], radius=42, fill=BLUE)
d.text((60, 40), title, font=F('Bold', 54), fill=INK)
info = 'Ebo (first person), Ama, Mica, Christy, Obuor  |  ~40–45s  |  rule 22: Ebo narrates, the cast speaks'
d.text((W - 30 - d.textlength(info, font=F('Medium', 26)), 56), info, font=F('Medium', 26), fill=INK)
fmt = lambda s: f'{int(s // 60)}:{int(s % 60):02d}'
t = 0.0
for i, (who, line, pic, shot) in enumerate(shots):
    clean = re.sub(r'\*|\[beat\]', '', line).strip()
    words = len(clean.split()) if clean and not clean.startswith('(') else 0
    dur = max(1.2, words / 3.4 + (0.6 if '[beat]' in line else 0.25))
    x = 30 + (i % COLS) * (CW + 18)
    y = 150 + (i // COLS) * (CH + 18)
    d.rounded_rectangle([x, y, x + CW, y + CH], radius=20, fill='#fff', outline=INK, width=4)
    chip = f'{i + 1}. ~{fmt(t)}–{fmt(t + dur)}'
    cw = d.textlength(chip, font=F('Bold', 24))
    d.rounded_rectangle([x + 12, y + 12, x + 32 + cw, y + 52], radius=14, fill=YEL)
    d.text((x + 22, y + 16), chip, font=F('Bold', 24), fill=INK)
    d.text((x + 22, y + 62), f'({TAGS[i]})' if i in TAGS else shot, font=F('SemiBold', 21), fill=INK if i in TAGS else GREY)
    sheet.paste(Image.open(ims[i]).convert('RGB').resize((PW, PH)), (x + PAD, y + 100))
    d.rectangle([x + PAD, y + 100, x + PAD + PW, y + 100 + PH], outline=INK, width=2)
    yy = y + 100 + PH + 12
    label = who.replace('*', '').upper().replace('—', 'SFX')
    d.text((x + PAD, yy), label + ':', font=F('Bold', 21), fill=RED if label.startswith('EBO') else '#2F6FB5')
    yy += 26
    for ln in textwrap.wrap(clean or '(no line)', 28)[:5]:
        d.text((x + PAD, yy), ln, font=F('Medium', 21), fill=INK); yy += 26
    yy += 6
    for ln in textwrap.wrap(pic, 34)[:4]:
        d.text((x + PAD, yy), ln, font=F('Regular', 17), fill=GREY); yy += 21
    t += dur
sheet.save(f'{out}/storyboard.png')
print('panels', len(shots), 'images', len(ims), 'size', sheet.size, 'est', round(t, 1))
