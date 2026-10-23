// Generates the Ebo-episode voiceover with ElevenLabs and the per-line timing the video syncs to.
//
//   ELEVENLABS_API_KEY=...  node scripts/elevenlabs-voice.mjs [--voice "Dan"] [--model eleven_multilingual_v2]
//
// Writes public/narration-ebo.mp3 and public/narration-ebo-timing.json (one start time per
// caption line in src/timing.ts), so the VendingMachineMoneyCast composition locks every scene
// to the real delivery. Requires network access to api.elevenlabs.io.
import fs from 'fs';
import path from 'path';

const API = 'https://api.elevenlabs.io/v1';
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set.');
  process.exit(1);
}
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const voiceQuery = arg('voice', process.env.ELEVENLABS_VOICE_ID || 'Dan');
const model = arg('model', 'eleven_multilingual_v2');
const MAX_SECONDS = 57.3; // the video is 58 s; leave room for the final beat

// The 18 caption lines, in order (kept in sync with LINES_EBO in src/timing.ts).
const src = fs.readFileSync(path.resolve('src/timing.ts'), 'utf8');
const lines = [...src.matchAll(/\{text: (['"])(.*?)\1, start: \d+, end: \d+\}/g)].map((m) => m[2].replace(/\\'/g, "'").replace(/Benny/g, 'Ebo'));
if (lines.length !== 18) throw new Error(`expected 18 narration lines, found ${lines.length}`);
const text = lines.join(' ');

const api = async (url, init = {}) => {
  const res = await fetch(API + url, {...init, headers: {'xi-api-key': key, 'Content-Type': 'application/json', ...(init.headers || {})}});
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${url} → ${res.status} ${await res.text()}`);
  return res.json();
};

const resolveVoice = async () => {
  if (/^[A-Za-z0-9]{20}$/.test(voiceQuery)) return {voice_id: voiceQuery, name: voiceQuery};
  const {voices} = await api('/voices');
  const q = voiceQuery.toLowerCase();
  const hit = voices.find((v) => v.name.toLowerCase() === q) || voices.find((v) => v.name.toLowerCase().includes(q));
  if (!hit) throw new Error(`No voice matching "${voiceQuery}". Available: ${voices.map((v) => v.name).join(', ')}`);
  return hit;
};

const synth = async (voiceId, speed) =>
  api(`/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: {stability: 0.38, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed},
    }),
  });

const voice = await resolveVoice();
console.log(`Voice: ${voice.name} (${voice.voice_id}), model ${model}`);

let speed = 1.0;
let out;
for (let attempt = 0; attempt < 3; attempt++) {
  out = await synth(voice.voice_id, speed);
  const ends = out.alignment.character_end_times_seconds;
  const dur = ends[ends.length - 1];
  console.log(`  take ${attempt + 1}: speed ${speed.toFixed(2)} → ${dur.toFixed(2)} s`);
  if (dur <= MAX_SECONDS) break;
  speed = Math.min(1.2, (speed * dur) / (MAX_SECONDS - 0.5));
}

// Map each caption line to the time its first character is spoken.
const chars = out.alignment.characters.join('');
const starts = out.alignment.character_start_times_seconds;
let cursor = 0;
const timing = lines.map((line) => {
  const idx = chars.indexOf(line, cursor);
  const at = idx >= 0 ? idx : chars.indexOf(line.split(' ')[0], cursor);
  if (at < 0) throw new Error(`Could not align line: ${line}`);
  cursor = at + 1;
  return {text: line, start: +starts[at].toFixed(3)};
});

fs.mkdirSync('public', {recursive: true});
fs.writeFileSync('public/narration-ebo.mp3', Buffer.from(out.audio_base64, 'base64'));
fs.writeFileSync('public/narration-ebo-timing.json', JSON.stringify({voice: voice.name, model, speed, lines: timing}, null, 2));
console.log('Wrote public/narration-ebo.mp3 and public/narration-ebo-timing.json');
for (const l of timing) console.log(`  ${l.start.toFixed(2).padStart(6)}s  ${l.text}`);
