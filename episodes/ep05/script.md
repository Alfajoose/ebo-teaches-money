# Ebo Teaches Money, Ep 05: Never Run Out of Things to Say

Status: script approved by Im on 2026-11-02. Vertical YouTube Short, about 40 to 45 seconds.

## Script
Your mind goes blank when someone talks to you? Do this.
She says, "I just got back from Chicago."
Most people say, "Oh, nice." Dead.
Instead, grab one word and ask about it. "Chicago? What took you there?"
"My sister's wedding."
Grab another. "How was the wedding?"
"Chaos. The caterer didn't show up!"
"No! So what did you eat?"
You said almost nothing, and she told you a whole story. That's how you win clients, jobs and deals, one conversation at a time.
So next time you freeze, don't search your head for something clever. The answer's in what they just said.

## Revised opening (2026-11-02, the hook)
The original first two lines ("Your mind goes blank when someone talks to you? Do this. She says...") and "Most people say, 'Oh, nice.' Dead. Instead," are replaced by a cold open:

Ama: "I just got back from Chicago."
Ebo: "...Oh, nice." *(flat; then a dead beat of silence)*
Ebo, to camera: "Don't be that guy. Here's the fix. Grab one word and ask about it. 'Chicago? What took you there?'"
*(The rest plays as written.)* About 37 to 38 seconds.

## Production notes
- Ebo teaches to camera, then the conversation plays out with Ama.
- Each grabbed word pops up handwritten: Chicago, wedding, caterer.
- For the loop, cut from the last line straight back to "I just got back from Chicago."

## Voice
- **Hook line:** "Don't be that guy. Here's the fix." is a separate Dan take (`raw_hook.mp3`).
- **Ebo:** ElevenLabs Dan (1cuDPO8sIMatoOE4Z2Zv), eleven_v4. One take, which reads all of Ebo's lines, including his side of the conversation.
- **Ama:** ElevenLabs Yuria (vGfq3y2g8QTWjuUhrNYc), eleven_v4. One take with her three lines.
- **Flow:** "Ebo Ep5 – Never Run Out of Things to Say".
- **Assembly:** the two takes are cut and interleaved per `voice_edl.json`, with 0.25s between speakers. `scripts/ep05-voice.py` builds `voice.mp3` and `words.json`, where each word is tagged with its speaker.
