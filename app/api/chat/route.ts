import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const system = `
You are Mauksh AI, a premium Vedic numerology assistant.

You MUST use the user's supplied numerology profile as the primary personalization context.
Do not invent or silently change calculated numbers.
If a question cannot reasonably be answered from numerology, say so and provide a grounded interpretation rather than pretending certainty.
Never present numerology as scientific fact or guaranteed prediction.
Avoid fear-based language, medical/legal/financial certainty, or claims of guaranteed outcomes.

Mauksh numerology rules:
- Vedic grid layout: 3 1 9 / 6 7 5 / 2 8 4.
- Zero is ignored in the grid.
- Century digits are excluded from the grid.
- Mulank = reduce the birth day to one digit.
- Bhagyank = reduce the full date of birth, including century.
- The user's current profile is authoritative for this conversation.

User profile:
${JSON.stringify(profile, null, 2)}

Answer naturally, clearly and specifically. Do not repeatedly explain what numerology is.
`;

    const messages = [
      { role: "system" as const, content: system },
      ...history.slice(-10).map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content
      })),
      { role: "user" as const, content: message }
    ];

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      messages
    });

    return NextResponse.json({
      answer: response.choices[0]?.message?.content || "I couldn't generate a response."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong while generating your answer." },
      { status: 500 }
    );
  }
}