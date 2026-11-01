EBO TEACHES MONEY — Ep 04: The Ultimate Guide to Staying Broke (Adobe Animate file)

Stage: 1920 x 1080 (16:9 long-form), 30 fps, 8232 frames (4:34)

Ebo alone, organic not busy: when he talks to us, and for his close-up reactions, he's on a
plain soft lilac backdrop and the acting and the camera's punch-ins carry it. Real places (the
couch, the kitchen, his desk, bed, the front door) are only for the quick acted-out bits, with
as few props as the jokes need; the phone is the running gag. In the living room the TV is on
the camera side; the reverse angle over the couch back shows the TV. Animated straight from
the approved storyboard (storyboard/, shotlist.md): 114 shots, each starting on the first
word of its line.

SCENES
  The file is split into 8 Animate scenes, one per section (Window > Scene to switch; each starts
  at frame 1): 1 Introduction · 2 Watch TV All Day · 3 No Hobbies · 4 No Passion · 5 Comfort Zone ·
  6 Wait For Magic · 7 Blame Everyone · 8 The Ending. Played in order they make the whole episode.
  Ebo's animated symbol is shared by all scenes; each scene's instance starts on the right frame.

CAMERA
  There is no camera animation in this file: every scene shows the full stage at zoom 1, with
  characters, props and sets at their real positions. Add your own camera (Camera tool / camera
  layer). The rendered video's camera moves are only a guide (see the storyboard and shot list).

LAYERS in every scene (top to bottom)
  Captions    - editable text in caption pills at the bottom of the frame (Library > Captions)
  Graphics    - the title card, chapter cards, the "2017" stamp and the end card
                (Library > Graphics)
  Props front - things Ebo holds (phone, remote, chips, letters, CV; each with his thumb or
                fingers drawn over it), the big-hand phone and laptop inserts, and the couch
                back in the reverse angle
  Ebo         - his animated rig symbol (Library > Ebo > "Ebo – Ep04"). Built on the new Ebo master:
                his views (3/4, front, back) and in-front arm are keyed per frame, so the
                arm layers he isn't using in a view are empty keyframes. Walking uses his
                fast walk (Obuor's, retargeted).
  Props       - diploma, sticky notes, Monday pad, laptop (side-on at the desk, slammed shut /
                shoved along on its beats), easel, notebook, blanket fort,
                suitcase: editable vector symbols (Library > Props)
  Background  - the sets only (the plain backdrop, front door, living room day/night, living room reverse angle (TV on/off), kitchen, work room day/night,
                bedroom, office) as editable vector symbols:
                each set is drawn once in full at its real position. Each set is also in
                backgrounds/ as an .svg file.

VOICE (already in the file)
  Every scene has a "Voice" layer on top that plays that scene's part of the voice from frame 1,
  Sync: Stream, so scrubbing and playback stay in sync with the animation. The clips are in the
  Library under Voice/. The same clips are in voice_by_scene/, and the full track is Ebo_Ep04_voice.mp3.

NOTES
  - Text uses Arial Black / Arial Bold; outlines are Glow filters on the text.
  - In the video the sets are slightly blurred for depth; in Animate they are sharp.
  - Props in the video have a light crayon grain; in Animate they keep the wavy hand-drawn
    outlines but use flat fills.
  - Built by script and checked by re-rendering it outside Animate; please open it in
    Animate and report anything that looks off.

FACTS USED
  - US adults watch about 2.8 hours of TV a day (BLS American Time Use Survey).
  - Big US jackpot odds are about 1 in 292 million (Powerball).

PROP PASS (Ebo handles the props, and they feel tangible)
  Defined per shot in src/series/ep04acts.tsx. Things fall with gravity and bounce once,
  and get flicked, poked, slapped, shoved or flipped:
  - "You don't need experience": the blank CV is flicked over his shoulder.
  - Bedroom "Television." / "And we certainly can't have that": the remote clicks.
  - Breakfast: bowl in hand, bobbing on each spoonful; it stays in hand on the whip to the TV.
  - "Drawing?": he drops the brush on the shrug; it hits the floor and bounces.
  - "Writing?": one poke and the notebook tips over flat on the desk.
  - "Got an idea?": the sticky is slapped on the wall and settles.
    "Forget it.": it peels off, falls and bounces.
  - "next Monday": he reaches over and flips the pad to the next week.
  - "What if they reject you?": the letter slips out of his fingers on the flinch.
  - Comfort zone: munching from the chip bag.
  - "Don't make a plan": the planner is shoved and slides to a stop.
  - Typing shots: his hands alternate on the keys.
  - "Pick one hobby": brush strokes, and the canvas fills stroke by stroke.
  In the .fla, held props are keyed in his hand and falling props on the props layer;
  each frame's position is a keyframe (no tweens).
