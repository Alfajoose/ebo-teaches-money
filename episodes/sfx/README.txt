SOUND EFFECTS LIBRARY (ElevenLabs Sound Effects v2, one take each, flow "Ebo SFX library")

click        Small plastic TV remote button click, crisp, close-mic
drop         Small wooden stick dropping on a hard floor, light clack and one small bounce
paper_flick  Single sheet of paper flicked away with a quick paper whoosh
slap         Hand slapping a paper note flat onto a wall, short soft slap
page_flip    Single page of a desk calendar flipped over, crisp paper flip
crunch       Single crunchy bite of a potato chip, close-mic crunch
typing       Fast typing on a laptop keyboard, soft plastic key clicks, close-mic
laptop_slam  Laptop lid slammed shut hard, sharp plastic clap
slide        Book shoved sliding across a wooden desk, short scrape slowing to a stop
hammer       Single hammer hit on a small wooden box, dry wood knock
book_thud    Paperback notebook falling flat onto a wooden desk, soft papery thud
phone_buzz   Smartphone vibrating on a wooden floor, two short buzzes
marker_tick  Felt marker making a quick tick mark on paper, short squeak
whoosh       Quick arm swing whoosh through the air, short and light
pop          Soft cartoon bubble pop, small and bright
ball_catch   Small rubber ball caught in a palm, soft slap
stamp        Rubber stamp pressed hard onto paper on a desk, single heavy thunk
clink        Small metal dumbbell plates clinking once, short metallic clink
footstep     Single soft sneaker footstep on a wooden floor
couch_flop   Person flopping down onto a soft couch cushion, muffled fabric thump
brush        Paint brush swiping across canvas, two quick bristle strokes
body_thud    Body flopping flat onto a wooden floor, soft heavy thud

HOW THEY'RE USED
  Cues (which effect, when, how loud) per shot: src/series/sfxCues.ts, timed from the same
  beats as the prop acting. Build the tracks:
    node scripts/sfx/run.mjs out/sfx/cues.json
    python3 -I scripts/sfx/mix.py out/sfx/cues.json ep04 out/sfx/ep04-sfx.wav      (-> public/ebo-ep04/sfx.mp3)
    python3 -I scripts/sfx/mix.py out/sfx/cues.json konka01 out/sfx/konka01-sfx.wav (-> public/konka01/sfx-ebo.mp3)
  The videos play the track under the voice; the Animate files carry it on an "SFX" layer
  (Sync: Stream, one clip per scene), next to "Voice". The raw effects here are uncut; the mixer
  trims each to its hit and normalises it.
  swoosh.mp3  ElevenLabs Sound Effects (flow olkFQ6OjOFDIZCKanif6, generation 2HpEWyoM4ej8MRNc8zJ0): the Peanut-style swoosh for pieces swooping in and camera reveals (rule 21).
