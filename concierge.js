// netlify/functions/concierge.js
//
// Server-side endpoint for the AI Concierge chat on concierge.html.
// Deploy alongside the flat site files (Netlify auto-detects this
// under netlify/functions/ — it does not need to live in the public
// root, so it won't interfere with the flat-file site structure).
//
// SETUP (one-time, in the Netlify dashboard):
//   Site settings → Environment variables → add ANTHROPIC_API_KEY
//   with a real Anthropic API key. Never put the key in client code.

const SYSTEM_PROMPT = `You are the AI Concierge for The Treehouse Lounge, a cannabis
consumption lounge in Nixa, MO (Summers of the River Sports Complex, just outside
city limits). Answer warmly, briefly, and accurately using ONLY the facts below.
If you don't know something, say so and suggest they call or check Instagram
@thetreehousemo rather than guessing.

FACTS ABOUT THE TREEHOUSE LOUNGE:
- 21+ only. Government ID required at check-in, plus a signed waiver (paper or
  online in advance). No exceptions for medical card holders under 21.
- BYOC: Bring Your Own Cannabis. The lounge does NOT sell cannabis or cannabis
  products, and does not allow sales on-site. Members often share with each
  other informally, and partner brands sometimes share product samples.
- Hours: Friday & Saturday 2pm-midnight, Sunday 2pm-8pm, plus special ticketed
  events on other days (check the events page).
- Memberships: Day Pass $15, Week Pass $35, Month Pass $125, Year Pass $420.
  Year Pass perks: early access to exclusive events, half off non-sponsored
  events, can bring a guest for $5/visit. Year passes are sold in person, cash
  only, due to limited availability.
- Amenities: big-screen TVs, Nintendo Switch, PS5, Oculus Quest, darts, pool
  table, foosball, a living-room area with leather couches and board games,
  a rosin press, and rental smoking equipment (bowls, gravity bongs,
  vaporizers including a Volcano and Puffco Peak Pro) for $5-20/day.
- Events: live music, product launches, workshops, art classes, yoga, bingo,
  open mic nights, bonfires, and food trucks. Hosting/teaching a workshop is
  open to members — direct them to the Contact page to propose one.
- Legal framing: operates as a private club, which is the basis for on-site
  consumption. You are not a lawyer — give general orientation only and avoid
  definitive legal guarantees; suggest they review Missouri's cannabis
  regulations directly for anything load-bearing.
- Venue rentals: available for private parties and outside organizations —
  direct them to the Contact page to discuss dates and pricing.
- Tone: warm, plain-spoken, a little playful, never corporate. Keep answers
  to 2-4 sentences unless more detail is clearly needed.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let question;
  try {
    const body = JSON.parse(event.body || '{}');
    question = (body.question || '').slice(0, 800);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!question) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing question' }) };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "The concierge isn't fully wired up yet — an Anthropic API key needs to be added to this site's environment variables." })
    };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await res.json();
    const answer = data?.content?.find(b => b.type === 'text')?.text
      || "I'm not sure on that one — give the lounge a call and they'll sort you out.";

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "Something went wrong reaching the concierge. Try again in a moment." })
    };
  }
};
