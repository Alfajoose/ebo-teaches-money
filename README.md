# Ebo Teaches Money

Vertical animated shorts where **Ebo** teaches ways to make money. The supporting cast (Mica, Obuor, Ama, Christy) act out his examples.

Built with [Remotion](https://remotion.dev). The characters come from the original Adobe Animate (`.fla`) rigs, the voice is generated with ElevenLabs, and each episode can be exported back to an editable `.fla`.

## Episodes

| # | Topic | Video | Animate file |
|---|-------|-------|--------------|
| 01 | How vending machines make money (56 s) | [`ebo-teaches-money-ep01.mp4`](episodes/ep01/ebo-teaches-money-ep01.mp4) | [`Ebo_Teaches_Money_Ep01.fla`](episodes/ep01/Ebo_Teaches_Money_Ep01.fla) |
| 01 short | Same episode, tight 36.5 s cut with a cold open | [`ebo-teaches-money-ep01-short.mp4`](episodes/ep01/ebo-teaches-money-ep01-short.mp4) | n/a |

To add the voice to the Animate file, follow `episodes/ep01/README.txt` (it takes three steps).

## Repository layout

```
episodes/ep01/        finished MP4, Animate .fla, voice MP3, notes
cast/                 cast bible (CAST.md), original .fla masters, reference sheets, Animate tools
src/series/           the show: vertical shot kit (kit.tsx), sets, Episode 1 (ep01.tsx)
src/cast/             rig renderer for the Animate characters (RigCharacter.tsx) + exported rig data
public/ebo-ep01/      Episode 1 voiceover (voice.mp3 is loudness-normalised; voice-raw.mp3 is the original)
scripts/export-fla/   captures every frame for the .fla export
renders/              earlier versions (the Benny pilot, the horizontal cast version)
```

The Benny pilot (`VendingMachineMoney`) and the horizontal cast version (`VendingMachineMoneyCast`) are still in `src/` as their own compositions.

## House style

- Snappy, pose-to-pose motion: 2–3 frame snaps with overshoot, then dead-still holds.
- **Translation and rotation only. Nothing animates scale.** Framing changes only on hard cuts.
- Talk-to-camera with hard cuts between wide, medium and close shots, and a black caption pill at the top.
- Only characters and props animate. No decorative effects (webs, tumbleweeds, money rain, smoke, shakes, animated backgrounds).

## Render

```bash
npm install
npx remotion studio                                   # preview
npx remotion render EboTeachesMoney-Ep01 out/ep01.mp4 # 1080x1920, 30 fps
node scripts/cut-audio.mjs                            # short cut: rebuild voice-short.mp3 from EP01_SHORT_EDL
npx remotion render EboTeachesMoney-Ep01-Short out/ep01-short.mp4
```

On Linux without a desktop Chrome, set `REMOTION_BROWSER_EXECUTABLE` to a chrome-headless-shell binary.

## Rebuild the Animate .fla

```bash
node scripts/export-fla/run-capture.mjs out/fla-export/capture.json
npx remotion render EboTeachesMoney-Ep01 out/fla-export/bg --sequence --image-format=jpeg --props='{"layer":"bg"}'
# extract each cast .fla in cast/masters/ to <CAST_SRC>/<name>/ with cast/tools/fla_extract.py, then:
python3 -I cast/tools/build_episode_fla.py out/fla-export/capture.json out/fla-export/bg <CAST_SRC> out/Ep01.fla out/fla-work
```

## Updating a character

1. Edit the character in Animate (`cast/masters/*.fla`).
2. Re-export the rig with `cast/tools/export_rig.py` into `src/cast/data/`.
3. Run `scripts/measure-rigs.mjs`.
