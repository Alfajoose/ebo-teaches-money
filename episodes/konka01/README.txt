KONKA SHORT 01 — "Can't control your lust?" (Adobe Animate file)

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

LAYERS in every scene (top to bottom)
  Captions    - editable caption text (Library > Captions)
  Graphics    - chapter cards and the push-up count
  Props front - the big-hand phone inserts, the dumbbell
  Konka       - his animated pose symbol
  Christy     - walking past (her own walk cycle)
  Props       - to-do list, laptop, birdhouse, mirror, thought bubble, pizza, phones, chalk line,
                checklist: editable vector symbols (Library > Props)
  Background  - the backdrop (day / night) as vector symbols, also in backgrounds/

ADD THE VOICE
  The voice is cut per scene in voice_by_scene/ (01 Hook.mp3 … 07 Ending.mp3). In each scene:
  File > Import > Import to Library... > that scene's clip, then a "Voice" layer with the sound
  on frame 1, Sync: Stream. Each clip starts exactly on its scene's frame 1.
  (The full track is Konka_Short01_voice.mp3 if you'd rather work in one long timeline.)
