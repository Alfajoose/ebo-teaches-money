"""Storyboard sheet for the Konka short "Can't control your lust?" (1:09), drawn with Konka's own
poses (frames of Symbol 2 in konka.fla). Writes an HTML sheet (screenshotted to PNG) + shotlist.md/json.
usage: python3 -I scripts/storyboard/konka01_board.py KONKA_XFL_DIR episodes/konka01  (KONKA_XFL_DIR = konka.fla extracted with cast/tools/fla_extract.py)"""
import sys, json, html
sys.path.insert(0, '/home/user/ebo-teaches-money/cast/tools')
from xfl import *

src, out = sys.argv[1], sys.argv[2]
doc = Doc(src)
INK = '#1E1A24'

# ── props, hand-drawn-ish inline SVG in 1920x1080 panel space ──
def phone(x, y, rot=0, screen='feed', s=1.0):
    inner = {
        'feed': ''.join(f'<rect x="-52" y="{-90 + i * 62}" width="104" height="50" rx="8" fill="{c}"/>' for i, c in enumerate(['#A8E6CF', '#F7C873', '#7FB8E0'])),
        'profile': '<circle cx="0" cy="-70" r="26" fill="#C9B6E8"/><rect x="-46" y="-36" width="92" height="10" rx="5" fill="#B5A88C"/>'
                   + ''.join(f'<rect x="{-52 + (i % 3) * 36}" y="{-16 + (i // 3) * 36}" width="32" height="32" fill="#D8CCEF"/>' for i in range(9))
                   + '<rect x="-46" y="98" width="92" height="22" rx="11" fill="#E5484D"/><text x="0" y="114" font-size="14" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-weight="900">FOLLOWING</text>',
        'unfollow': '<circle cx="0" cy="-70" r="26" fill="#C9B6E8"/><rect x="-46" y="-36" width="92" height="10" rx="5" fill="#B5A88C"/>'
                    + ''.join(f'<rect x="{-52 + (i % 3) * 36}" y="{-16 + (i // 3) * 36}" width="32" height="32" fill="#E9E4F2"/>' for i in range(9))
                    + '<rect x="-46" y="98" width="92" height="22" rx="11" fill="#3B82F6"/><text x="0" y="114" font-size="14" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-weight="900">FOLLOW</text>',
        'dark': '',
    }[screen]
    bg = '#3A3F4E' if screen == 'dark' else '#F6F0E4'
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})"><rect x="-70" y="-130" width="140" height="260" rx="22" fill="{INK}"/><rect x="-60" y="-112" width="120" height="236" rx="10" fill="{bg}"/>{inner}</g>'

def big_hand_phone(screen, thumb_on=None):
    hand = '#F09B6A'
    t = '<path d="M 1330 760 Q 1290 640 1180 560 Q 1140 535 1120 570 Q 1110 600 1150 630 Q 1220 690 1230 790 Z" fill="%s" stroke="%s" stroke-width="9"/>' % (hand, INK)
    if thumb_on:
        t = f'<g transform="translate({thumb_on[0]} {thumb_on[1]})">' + t + '</g>'
    return (f'<path d="M 1080 1080 Q 1300 960 1340 760 L 1360 560 L 1180 580 L 1180 1080 Z" fill="{hand}" stroke="{INK}" stroke-width="10"/>'
            f'<g transform="rotate(-8 960 540)">{phone(960, 540, 0, screen, 3.4)}'
            + ''.join(f'<rect x="690" y="{yy}" width="70" height="84" rx="36" fill="{hand}" stroke="{INK}" stroke-width="9"/>' for yy in (380, 490, 600))
            + '</g>' + t)

def pizza(x, y):
    return (f'<g transform="translate({x} {y})"><rect x="-150" y="-20" width="300" height="20" fill="#C9A16B" stroke="{INK}" stroke-width="7"/>'
            f'<circle cx="0" cy="-40" r="120" fill="#F3C53F" stroke="{INK}" stroke-width="7" transform="scale(1 0.32)"/>'
            + ''.join(f'<circle cx="{dx}" cy="{dy}" r="14" fill="#D9534F"/>' for dx, dy in ((-60, -18), (10, -24), (60, -14), (-20, -8))) + '</g>')

def dumbbell(x, y):
    return (f'<g transform="translate({x} {y})"><rect x="-90" y="-8" width="180" height="16" fill="#555" stroke="{INK}" stroke-width="5"/>'
            f'<rect x="-120" y="-40" width="34" height="80" rx="8" fill="#3A3A44" stroke="{INK}" stroke-width="6"/><rect x="86" y="-40" width="34" height="80" rx="8" fill="#3A3A44" stroke="{INK}" stroke-width="6"/></g>')

def laptop_side(x, y):
    return (f'<g transform="translate({x} {y})"><rect x="-130" y="-16" width="260" height="16" rx="5" fill="#C9CDD6" stroke="{INK}" stroke-width="7"/>'
            f'<g transform="translate(118 -12) rotate(16)"><rect x="-6" y="-176" width="14" height="176" rx="5" fill="#2E3440" stroke="{INK}" stroke-width="7"/><rect x="-12" y="-166" width="6" height="150" fill="#9FD3F2"/></g></g>')

def birdhouse(x, y):
    return (f'<g transform="translate({x} {y})"><rect x="-80" y="-130" width="160" height="130" fill="#C99A62" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M -100 -130 L 0 -210 L 100 -130 Z" fill="#B5563C" stroke="{INK}" stroke-width="7"/><circle cx="0" cy="-70" r="24" fill="{INK}"/></g>')

def mirror(x, y):
    return (f'<g transform="translate({x} {y})"><rect x="-150" y="-560" width="300" height="560" rx="150" fill="#DCEEF8" stroke="#8B6A48" stroke-width="18"/>'
            f'<path d="M -80 -440 L -20 -500" stroke="#fff" stroke-width="14" stroke-linecap="round"/></g>')

def thought(x, y, txt):
    return (f'<g transform="translate({x} {y})"><circle cx="-150" cy="150" r="16" fill="#fff" stroke="{INK}" stroke-width="6"/><circle cx="-110" cy="100" r="26" fill="#fff" stroke="{INK}" stroke-width="6"/>'
            f'<ellipse cx="40" cy="-10" rx="220" ry="130" fill="#fff" stroke="{INK}" stroke-width="7"/><text x="40" y="12" font-size="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="{INK}">{txt}</text></g>')

def chalk_line(x, y):
    return f'<path d="M {x - 260} {y} L {x + 260} {y}" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="40 26"/>'

def checklist(x, y):
    rows = ''.join(f'<path d="M -70 {-80 + i * 60} l 20 20 l 36 -40" stroke="#45B69C" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="0" y="{-90 + i * 60}" width="90" height="12" rx="6" fill="#B5A88C"/>' for i in range(3))
    return f'<g transform="translate({x} {y})"><rect x="-110" y="-150" width="240" height="250" fill="#FFF6DA" stroke="{INK}" stroke-width="7"/>{rows}</g>'

def walker(x, y, flip=1):
    """Christy walking past, from the cast (just walking: fully dressed, no posing)."""
    return (f'<g transform="translate({x} {y}) scale({1.7 * flip} 1.7)"><circle cx="0" cy="-330" r="70" fill="#A86F4C" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M -60 -380 Q 0 -440 70 -380 Q 90 -300 60 -270 L -70 -270 Q -90 -320 -60 -380 Z" fill="#2B1B14"/>'
            f'<rect x="-60" y="-260" width="120" height="150" rx="40" fill="#E5484D" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M -30 -110 L -60 0 M 30 -110 L 60 -10" stroke="{INK}" stroke-width="26" stroke-linecap="round"/></g>')

def phones_around(cx, y):
    return ''.join(phone(cx + dx, y - 40, r, 'feed', 0.7) for dx, r in ((-420, -20), (-300, 12), (300, -10), (430, 18), (-180, 30)))

def title_card(num, title):
    return (f'<text x="140" y="430" font-size="56" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#E5484D" letter-spacing="6">STEP {num}</text>'
            f'<text x="140" y="560" font-size="120" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="{INK}">{title.split(" / ")[0]}</text>'
            + (f'<text x="140" y="690" font-size="120" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="{INK}">{title.split(" / ")[1]}</text>' if ' / ' in title else '')
            + '<rect x="146" y="730" width="220" height="18" rx="9" fill="#E5484D"/>')

def jump3(*labels):
    return ''.join(f'<line x1="{640 * i}" y1="0" x2="{640 * i}" y2="1080" stroke="{INK}" stroke-width="10"/>' for i in (1, 2))

# ── the shots: (section, time, size, camera, pose frame(s) & placement, props, action, line) ──
NIGHT = '#3A3355'
SHOTS = [
 ('THE HOOK', '0:00–0:02', 'MS', 'push-in', [(37, 960, 1040, 1)], '', 'Konka alone on the plain backdrop, finger up, squinting at us. Slow push-in.', "So... you can't control your lust?"),
 ('THE HOOK', '0:02–0:05', 'WS', 'static', [(20, 640, 980, 1)], walker(1380, 1040), 'Someone (Christy, just walking by) crosses the frame. Konka\'s head snaps to follow; his to-do list slips out of his hand.', 'One attractive person walks past, and suddenly your brain forgets every important thing you were supposed to do today.'),
 ('THE HOOK', '0:05–0:08', 'CU', 'snap-zoom', [(36, 960, 1250, 1.6)], '', 'Snap-zoom on his face: dazed, dopey grin. Nobody home.', 'Congratulations. Your hormones have officially taken over management.'),
 ('STEP 1 — FIND YOUR PURPOSE', '0:08–0:10', 'MS', 'push-in', [(85, 1450, 1040, 1)], title_card(1, 'FIND YOUR / PURPOSE'), 'Chapter card: title slams in on the left, Konka thinking on the right.', 'First, get yourself a purpose.'),
 ('STEP 1 — FIND YOUR PURPOSE', '0:10–0:11', 'ECU', 'static', [(64, 960, 1500, 2.1)], '', 'Hard cut to a deadpan stare into the lens. Hold.', 'Seriously.'),
 ('STEP 1 — FIND YOUR PURPOSE', '0:11–0:14', 'MS', 'static', [(2, 960, 1040, 1)], '', 'Finger up, eyes up: the idea lands. Determined.', 'Find something you actually want to achieve.'),
 ('STEP 1 — FIND YOUR PURPOSE', '0:14–0:19', 'WS → MS', 'push-in', [(32, 960, 1040, 1)], '', 'Konka slumped on the floor doing nothing; push in as his eyes slide sideways and a sly smirk creeps in.', 'Because when your entire day consists of doing absolutely nothing, your brain has plenty of time to entertain some very questionable ideas.'),
 ('STEP 2 — WORK ON YOURSELF', '0:19–0:21', 'MS', 'push-in', [(84, 1450, 1040, 1)], title_card(2, 'WORK ON / YOURSELF'), 'Chapter card. Konka arms crossed, pleased with himself.', 'Second, work on yourself.'),
 ('STEP 2 — WORK ON YOURSELF', '0:21–0:22', 'WS', 'static', [(11, 960, 1040, 1)], '<!--front-->' + dumbbell(960, 900), 'Jump cut 1: squatting, heaving a dumbbell up.', 'Hit the gym.'),
 ('STEP 2 — WORK ON YOURSELF', '0:22–0:23', 'WS', 'static', [(31, 760, 1040, 1)], laptop_side(1110, 880), 'Jump cut 2: on the floor at the laptop (side-on, screen toward him), typing.', 'Learn a skill.'),
 ('STEP 2 — WORK ON YOURSELF', '0:23–0:24', 'WS', 'static', [(10, 760, 1040, 1)], birdhouse(1150, 1000), 'Jump cut 3: kneeling, finishing a wonky birdhouse.', 'Build something.'),
 ('STEP 2 — WORK ON YOURSELF', '0:24–0:26', 'CU', 'push-in', [(23, 960, 1250, 1.6)], '', 'Close-up: total focus, brow down.', 'Give your brain something productive to obsess over.'),
 ('STEP 2 — WORK ON YOURSELF', '0:26–0:28', 'WS', 'static', [(9, 960, 1040, 1)], '<text x="1500" y="300" font-size="90" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#1E1A24">1... 2... 3.</text>', 'Three push-ups (held poses on the counts), then he flops.', 'And no, doing three push-ups'),
 ('STEP 2 — WORK ON YOURSELF', '0:28–0:30', 'MS', 'static', [(86, 760, 1040, 1)], mirror(1250, 1000), 'Back view at the mirror, checking his round tummy, very satisfied.', "and checking your abs in the mirror doesn't count as a transformation."),
 ('STEP 3 — CONTROL YOUR MIND', '0:30–0:32', 'MS', 'push-in', [(78, 1450, 1040, 1)], title_card(3, 'CONTROL / YOUR MIND'), 'Chapter card. Konka, finger up, arms crossed.', 'Third, stop entertaining every thought that enters your head.'),
 ('STEP 3 — CONTROL YOUR MIND', '0:32–0:35', 'MS', 'static', [(54, 760, 1040, 1)], thought(1330, 330, '?!'), 'A thought bubble pops up beside his head; he holds up a flat hand to it: no.', "Just because your brain suggests something doesn't mean you have to follow through."),
 ('STEP 3 — CONTROL YOUR MIND', '0:35–0:38', 'WS', 'static', [(27, 960, 1040, 1)], pizza(1300, 990), 'Night (backdrop goes dark): Konka on the floor with an entire pizza, delighted.', 'Your brain also tells you to eat an entire pizza at midnight.', NIGHT),
 ('STEP 3 — CONTROL YOUR MIND', '0:38–0:41', 'ECU', 'snap-zoom', [(8, 960, 1500, 2.1)], '', 'Mid-bite freeze, guilty side-eye to the lens.', "Doesn't mean it's a genius.", NIGHT),
 ('STEP 4 — AVOID YOUR TRIGGERS', '0:41–0:43', 'MS', 'push-in', [(39, 1450, 1040, 1)], title_card(4, 'AVOID YOUR / TRIGGERS'), 'Chapter card. Konka explaining.', 'Fourth, stop feeding the temptation.'),
 ('STEP 4 — AVOID YOUR TRIGGERS', '0:43–0:45', 'INSERT', 'static', [], big_hand_phone('profile'), 'Insert (its own drawing): big hand, phone tilted, a profile page (no photo shown, just tiles). Thumb hovers.', 'You know that account you keep checking?'),
 ('STEP 4 — AVOID YOUR TRIGGERS', '0:45–0:47', 'CU', 'static', [(79, 960, 1250, 1.6)], '', 'Caught. Nervous grin, hands together, eyes darting.', 'Yeah. That one.'),
 ('STEP 4 — AVOID YOUR TRIGGERS', '0:47–0:48', 'INSERT', 'static', [], big_hand_phone('unfollow', (-120, -170)), 'Insert: the thumb taps; FOLLOWING flips to FOLLOW.', 'Unfollow it.'),
 ('STEP 4 — AVOID YOUR TRIGGERS', '0:48–0:52', 'WS', 'pull-out', [(33, 960, 1040, 1)], phones_around(960, 1000), 'Pull out: Konka on the floor, hands up, surrounded by five phones all showing feeds.', "You can't complain about being distracted while deliberately surrounding yourself with distractions."),
 ('STEP 5 — BUILD DISCIPLINE', '0:52–0:54', 'MS', 'push-in', [(38, 1450, 1040, 1)], title_card(5, 'BUILD / DISCIPLINE'), 'Chapter card. Konka, smug finger.', 'Finally, practice self-discipline.'),
 ('STEP 5 — BUILD DISCIPLINE', '0:54–0:55', 'WS', 'static', [(1, 960, 1040, 1)], '', 'Jump cut 1: one tiny step forward. Proud.', 'Start small.'),
 ('STEP 5 — BUILD DISCIPLINE', '0:55–0:56', 'WS', 'static', [(77, 960, 1000, 1)], chalk_line(960, 1030), 'Jump cut 2: he chalks a line on the floor and stands behind it, arms crossed.', 'Set boundaries.'),
 ('STEP 5 — BUILD DISCIPLINE', '0:56–0:57', 'WS', 'static', [(3, 760, 1040, 1)], checklist(1300, 560), 'Jump cut 3: he points at a routine checklist, three ticks.', 'Stick to a routine.'),
 ('STEP 5 — BUILD DISCIPLINE', '0:57–1:00', 'MS', 'static', [(57, 960, 1040, 1)], '', 'Sincere beat: relaxed open shrug, warm smile.', 'And remember, feeling attraction is completely normal.'),
 ('STEP 5 — BUILD DISCIPLINE', '1:00–1:02', 'MS', 'static', [(62, 960, 1040, 1)], '', 'Gag: Konka goes stiff as a robot, blank eyes. Held.', "The goal isn't to become a robot."),
 ('STEP 5 — BUILD DISCIPLINE', '1:02–1:05', 'WS', 'static', [(60, 640, 1040, 1)], walker(1560, 1040, -1) + laptop_side(980, 880), 'Callback to shot 2: the same person walks past behind him. This time he stays on his work. Small smile.', "It's to stop letting every passing impulse make your decisions."),
 ('THE ENDING', '1:05–1:07', 'MS → CU', 'push-in', [(72, 960, 1040, 1)], '', 'Slow push-in on Konka, calm, serious, to the lens.', "Because if you can't control your attention..."),
 ('THE ENDING', '1:07–1:09', 'WS', 'static', [(66, 640, 1040, 1)], phone(1250, 960, -70, 'feed', 0.9), 'His phone lights up on the floor. His head turns to it on its own. Cut to black.', 'Something else will.'),
]

# ── render ──
POSE_SVG = {}
def pose_svg(f):
    if f not in POSE_SVG:
        POSE_SVG[f] = doc.symbol_svg('Symbol 2', f)
    return POSE_SVG[f]

def panel(i, s):
    sec, t, size, cam, poses, props, action, line = s[:8]
    bg = s[8] if len(s) > 8 else None
    grad = f'<radialGradient id="g{i}" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="{"#5A5180" if bg else "#F4F0FC"}"/><stop offset="0.35" stop-color="{"#463E68" if bg else "#E6DEF7"}"/><stop offset="1" stop-color="{bg or "#D2C4EE"}"/></radialGradient>'
    ks = ''.join(f'<g class="k" data-x="{x}" data-floor="{fl}" data-mul="{m}">{pose_svg(f)}</g>' for f, x, fl, m in poses)
    front = props if size == 'INSERT' or props.startswith('<!--front-->') else ''
    back = '' if front else props
    return f'''<div class="shot"><svg viewBox="0 0 1920 1080"><defs>{grad}</defs><rect width="1920" height="1080" fill="url(#g{i})"/>{back}{ks}{front}
<rect x="30" y="30" width="150" height="120" rx="18" fill="#C8102E"/><text x="105" y="118" font-size="84" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#fff">{i + 1}</text></svg>
<div class="meta"><div class="tc"><b>{t}</b> | {html.escape(size)} · {cam}</div><div class="act"><b>Action:</b> {html.escape(action)}</div><div class="line">&ldquo;{html.escape(line)}&rdquo;</div></div></div>'''

sections = []
for i, s in enumerate(SHOTS):
    if not sections or sections[-1][0] != s[0]:
        sections.append((s[0], []))
    sections[-1][1].append((i, s))

COLS = [[0, 1], [2], [3, 4], [5, 6]]  # section indices per column
def sec_html(k):
    name, shots = sections[k]
    t0, t1 = shots[0][1][1].split('–')[0], shots[-1][1][1].split('–')[1]
    return f'<section><h2>{html.escape(name.replace("—", "·"))} <span>({t0} – {t1})</span></h2>' + ''.join(panel(i, s) for i, s in shots) + '</section>'

page = f'''<!doctype html><html><head><meta charset="utf-8"><title>Konka Storyboard</title><style>
body{{margin:0;background:#F4EEE6;font-family:Arial,Helvetica,sans-serif;color:{INK};width:2400px}}
header{{background:#2A1E3B;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:22px 36px}}
header h1{{margin:0;font:900 52px 'Arial Black',Arial;letter-spacing:1px}} header h1 em{{color:#F3C53F;font-style:normal}} header h1 small{{font-size:34px;font-weight:700}}
.tot{{background:#FFF1C9;color:{INK};border-radius:12px;padding:10px 22px;font:700 28px Arial}}
.cols{{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:20px}}
section{{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}}
h2{{margin:0;background:#C8102E;color:#fff;font:900 26px 'Arial Black',Arial;padding:10px 14px;border-radius:8px}} h2 span{{font:700 22px Arial}}
.shot{{background:#fff;border:3px solid {INK};border-radius:12px;overflow:hidden;display:grid;grid-template-columns:270px 1fr}}
.shot svg{{width:270px;height:152px;display:block;border-right:3px solid {INK}}}
.meta{{padding:8px 12px;font-size:17px;line-height:1.3}} .tc{{font-size:18px;margin-bottom:4px}} .act{{color:#3F3650}} .line{{margin-top:4px;font-weight:700}}
footer{{padding:0 36px 24px;font-size:20px;color:#5B5168}}
</style></head><body>
<header><h1>CAN'T CONTROL YOUR <em>LUST?</em> <small>— STORYBOARD (Konka)</small></h1><div class="tot">Total Duration: ~1:09 &nbsp;|&nbsp; Total Shots: {len(SHOTS)}</div></header>
<div class="cols">{''.join('<div>' + ''.join(sec_html(k) for k in col) + '</div>' for col in COLS)}</div>
<footer>Konka drawn with his own poses (konka.fla pose library). Plain lilac backdrop, acting first, props only where the joke needs them; phone inserts are their own big-hand drawings. The person walking past is Christy, just walking by.</footer>
<svg width="0" height="0" style="position:absolute"><g id="ref">{pose_svg(0)}</g></svg>
<script>
// every Konka pose at one shared scale (pose 0 = 820 px tall in the 1080 frame), feet on the floor line
const r = document.getElementById('ref').getBBox();
const k0 = 820 / r.height;
for (const g of document.querySelectorAll('.k')) {{
  const b = g.getBBox();
  const k = k0 * +g.dataset.mul;
  g.setAttribute('transform', `translate(${{+g.dataset.x - (b.x + b.width / 2) * k}} ${{+g.dataset.floor - (b.y + b.height) * k}}) scale(${{k}})`);
}}
</script></body></html>'''
open(out + '/storyboard.html', 'w').write(page)
json.dump([dict(n=i + 1, section=s[0], time=s[1], size=s[2], camera=s[3], poses=[p[0] for p in s[4]], action=s[6], line=s[7]) for i, s in enumerate(SHOTS)], open(out + '/shotlist.json', 'w'), indent=1)
md = ["# Konka short: Can't control your lust? (~1:09) — shot list", '', f'{len(SHOTS)} shots. Pose numbers are frames of `Symbol 2` in konka.fla (his pose library).', '',
      '| # | Section | Time | Size | Camera | Pose | Action | Line |', '|---|---|---|---|---|---|---|---|']
md += [f"| {i + 1} | {s[0]} | {s[1]} | {s[2]} | {s[3]} | {', '.join(str(p[0]) for p in s[4]) or '–'} | {s[6]} | {s[7]} |" for i, s in enumerate(SHOTS)]
open(out + '/shotlist.md', 'w').write('\n'.join(md) + '\n')
print(len(SHOTS), 'shots')
