SHORT 01 — "Can't control your lust?" (Adobe Animate files)

EBO VERSION (current): Short01_Ebo.fla / short01-ebo.mp4 — Ebo plays the part. Each of Konka's
poses is matched to an Ebo pose from his pose library (src/series/konka01.tsx, EBO table): floor
sitting, the dumbbell squat, push-ups and the robot are new Ebo poses. Same voice, timing,
scenes and props; Ebo's rig is keyed in his symbol ("Ebo – Konka Short01").
KONKA VERSION: Konka_Short01.fla / konka-short01.mp4 (set STAR = 'konka' to rebuild it).
The notes below describe the Konka version; the Ebo file has the same scenes, layers and voice.

Stage: 1080 x 1920 (vertical YouTube Short), 30 fps, 2594 frames (1:26)

Konka acts it out on a plain lilac backdrop (dark at night for the pizza bit), animated from
the approved storyboard (storyboard.png, shotlist.md): 32 shots, each starting on the first word
of its line in the recorded voice. Voice: ElevenLabs "Jimmy - Energetic & Chill" (eleven_v4).

KONKA
  Konka is a pose-library character: his master (cast/masters/Konka.fla, symbol "Symbol 2") has
  87 drawn poses, one per frame. In this file his symbol (Library > Konka > "Konka – Konka
  Short01") holds, on every frame, the pose the shot uses (copied from that library frame), with
  his mouth swapped for lip sync and his eyes for blinks. Poses snap from one to the next.
  Pose numbers per shot are in shotlist.md. His newer rigged file is cast/masters/Konka_rig.fla.

SCENES
  The file is split into 7 Animate scenes, one per section (Window > Scene to switch; each
  starts at frame 1): 1 Hook · 2 Find Your Purpose · 3 Work On Yourself · 4 Control Your Mind ·
  5 Avoid Your Triggers · 6 Build Discipline · 7 Ending. Played in order they make the whole Short.
  Konka's pose symbol is one long symbol shared by all scenes; each scene's instance starts on
  the right frame of it, so editing a pose there updates every scene that uses it.

CAMERA
  There is no camera animation in this file: every scene shows the full stage at zoom 1, with
  characters, props and sets at their real positions. Add your own camera (Camera tool / camera
  layer). The rendered video's camera moves are only a guide (see the storyboard and shot list).

LAYERS in every scene (top to bottom)
  Captions    - editable caption text (Library > Captions)
  Graphics    - chapter cards and the push-up count
  Props front - the big-hand phone inserts, the dumbbell
  Konka       - his animated pose symbol
  Christy     - walking past (her own walk cycle)
  Props       - to-do list, laptop, birdhouse, mirror, thought bubble, pizza, phones, chalk line,
                checklist: editable vector symbols (Library > Props)
  Background  - the backdrop (day / night) as vector symbols, also in backgrounds/

VOICE (already in the file)
  Every scene has a "Voice" layer on top that plays that scene's part of the voice from frame 1,
  Sync: Stream, so scrubbing and playback stay in sync with the animation. The clips are in the
  Library under Voice/. The same clips are in voice_by_scene/, and the full track is Konka_Short01_voice.mp3.