import { NextResponse } from "next/server";

const OPENAI_API_BASE = "https://api.openai.com/v1";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing 'image' (data URL)" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    // 1) Generate a safe, playful roast from the image using gpt-4o-mini (vision)
    const prompt = `You are a concise roast generator. Produce ONE punchy line (6–20 words) about the person in the image.
Rules (strict):
- PG-13 tone: witty, sharp, playful; mild profanity only, no explicit content.
- Absolutely no slurs, hate, or references to protected attributes (race, religion, gender, sexual orientation, disability, etc.).
- No violence, threats, doxxing, or medical/mental health judgments.
- Do not identify real people or guess sensitive traits.
- Output only the roast line; no emojis, disclaimers, or extra text.
- If the image is unclear, still produce a general, PG-13 roast about their vibe or selfie skills.`;

    const visionRes = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 60,
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Roast this photo with the rules above." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      const err = await safeJson(visionRes);
      return NextResponse.json({ error: "OpenAI vision error", details: err }, { status: 502 });
    }
    const visionJson = await visionRes.json();
    const roastText: string = visionJson?.choices?.[0]?.message?.content?.trim?.() ?? "";
    if (!roastText) {
      return NextResponse.json({ error: "Failed to generate roast" }, { status: 502 });
    }

    // 2) Convert roast to TTS audio using gpt-4o-mini-tts
    const ttsRes = await fetch(`${OPENAI_API_BASE}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: roastText,
        format: "mp3",
      }),
    });

    if (!ttsRes.ok) {
      const err = await safeJson(ttsRes);
      return NextResponse.json({ error: "OpenAI TTS error", details: err }, { status: 502 });
    }

    const audioArrayBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");

    return NextResponse.json({ text: roastText, audioBase64 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Unexpected error", details: message },
      { status: 500 },
    );
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return { status: res.status, statusText: res.statusText };
  }
}
