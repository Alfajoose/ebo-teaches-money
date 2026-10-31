# Ebo Teaches Money

Animated videos where **Ebo** teaches ways to make money: vertical Shorts, plus 16:9 long-form episodes. The supporting cast (Mica, Obuor, Ama, Christy) act out his examples.

Built with [Remotion](https://remotion.dev). The characters come from the original Adobe Animate (`.fla`) rigs, the voice is generated with ElevenLabs, and each episode can be exported back to an editable `.fla`.

## Episodes

| # | Topic | Video | Animate file |
|---|-------|-------|--------------|
| 01 | How vending machines make money (52 s) | [`ebo-teaches-money-ep01.mp4`](episodes/ep01/ebo-teaches-money-ep01.mp4) | [`Ebo_Teaches_Money_Ep01.fla`](episodes/ep01/Ebo_Teaches_Money_Ep01.fla) |
| 02 | Flipping: buy low, clean it up, list it well (48 s) | [`ebo-teaches-money-ep02.mp4`](episodes/ep02/ebo-teaches-money-ep02.mp4) | [`Ebo_Teaches_Money_Ep02.fla`](episodes/ep02/Ebo_Teaches_Money_Ep02.fla) |
| 03 | How to Stay Poor: six habits that keep you broke, and how to flip each one (2:49, 16:9 long-form) | [`ebo-teaches-money-ep03.mp4`](episodes/ep03/ebo-teaches-money-ep03.mp4) | [`Ebo_Teaches_Money_Ep03.fla`](episodes/ep03/Ebo_Teaches_Money_Ep03.fla) |
| 04 | The Ultimate Guide to Staying Broke: Ebo alone, six bad habits, one twist ending (4:34, 16:9 long-form) | [`ebo-teaches-money-ep04.mp4`](episodes/ep04/ebo-teaches-money-ep04.mp4) | [`Ebo_Teaches_Money_Ep04.fla`](episodes/ep04/Ebo_Teaches_Money_Ep04.fla) |
| 01 short | Same episode, tight 34.3 s cut with a cold open | [`ebo-teaches-money-ep01-short.mp4`](episodes/ep01/ebo-teaches-money-ep01-short.mp4) | n/a |

To add the voice to an Animate file, follow the episode's `README.txt` (it takes three steps).

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

## Making an episode

1. **Script.** Approved before any voice is generated.
2. **Voice.** ElevenLabs (Ebo's Dan voice), then word timings.
3. **Shot list and storyboard.** Approved before any animation. Copy `episodes/_template/shotlist.md`, plan every shot (size, angle, camera move, who's in frame, action, set, props, transition), and review a rough storyboard frame per shot.
4. **Animate** to the approved board.
5. **Render** the video and **export** the Animate `.fla`.

## House style

- Snappy, pose-to-pose motion: 2–3 frame snaps with overshoot, then dead-still holds.
- **Characters and props use translation and rotation only, and never scale.** The camera can pan, track, whip-pan and zoom (`camera()` in `src/series/kit.tsx`). Each scene gets a planned mix of wides, close-ups, extreme close-ups and reaction shots.
- Talk-to-camera with hard cuts between wide, medium and close shots. Shorts are 1080×1920 with the caption pill at the top. Long-form episodes are 1920×1080 with the caption at the bottom, use the `HWIDE`/`HMEDIUM`/`HCLOSE` framings, and open each section on a chapter card.
- Only characters and props animate. No decorative effects (webs, tumbleweeds, money rain, smoke, shakes, animated backgrounds).
- Backgrounds and props are kept separate (see below).
- Ebo doesn't call out lesson numbers ("Lesson one: …"). He goes straight to the point, and the on-screen card shows only the title. `scripts/make-edit.mjs` cuts the callouts out of the voiceover, and each episode plays through the kept segments.

## Backgrounds vs props

- **Sets** (`src/series/sets.tsx`) are the background: walls, furniture, plants, signs. They never contain props.
- **Props** (`src/components/`) are anything that's handled, moved or counted. Each prop component wraps its drawing in `<Prop name="…">` (`src/prop.tsx`). That one wrapper gives the prop:
  - the hand-drawn look in the video;
  - its removal from `layer: 'set'` renders;
  - its capture as a vector symbol for the Animate export.
- The drawing's outer `<g transform>` is the prop's placement, so a prop that only moves or turns stays one symbol.
- To move or scale a group of props inside a shot, wrap them in `<Place m={…}>` (`src/series/exportCtx.tsx`) instead of a bare `<g transform>`, so the export knows where they are. Props held by a character are placed automatically.
- A new prop needs a `XDrawing` component plus `export const X = (props) => <Prop name="X"><XDrawing {...props} /></Prop>`.

## Render

```bash
npm install
npx remotion studio                                   # preview
npx remotion render EboTeachesMoney-Ep01 out/ep01.mp4 # 1080x1920, 30 fps
node scripts/make-edit.mjs                            # cut the spoken lesson numbers + the short: voice-edit.mp3, voice-short.mp3
npx remotion render EboTeachesMoney-Ep01-Short out/ep01-short.mp4
```

On Linux without a desktop Chrome, set `REMOTION_BROWSER_EXECUTABLE` to a chrome-headless-shell binary.

## Rebuild the Animate .fla

```bash
node scripts/export-fla/run-capture.mjs out/fla-export/capture.json ep01   # or ep02
# extract each cast .fla in cast/masters/ to <CAST_SRC>/<name>/ with cast/tools/fla_extract.py, then:
python3 -I cast/tools/build_episode_fla.py out/fla-export/capture.json - <CAST_SRC> out/Ep01.fla out/fla-work episodes/ep01/backgrounds
```

The .fla's main timeline, top to bottom:

| Layer | Contents |
|-------|----------|
| Captions | Caption text |
| Graphics | Titles and lesson cards |
| Props front | Props the characters hold |
| One layer per character | That character's animated rig |
| Props | All other props |
| Background | The set, as vector symbols. In long-form episodes each set is drawn once and the camera moves are keyframes on it. Each set is also saved as an `.svg` file in the episode's `backgrounds/` folder |

## Walk and run cycles

The cast's own walk and run cycles are in `cast/cycles/` (see `cast/CAST.md`). Play one with `<RigCharacter who="christy" cycle="walk" … />` and move the character with `x`. Preview them all with the `CycleTest` composition (`cast/sheets/cycles-preview.mp4`).

## Updating a character

1. Edit the character in Animate (`cast/masters/*.fla`).
2. Re-export the rig with `cast/tools/export_rig.py` into `src/cast/data/`.
3. Run `scripts/measure-rigs.mjs`.
