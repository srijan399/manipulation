import Groq from "groq-sdk";

const model =
    process.env.GROQ_MODEL ||
    process.env.NEXT_PUBLIC_GROQ_MODEL ||
    "deepseek-r1-distill-qwen-32b";

const groq = new Groq({
    apiKey:
        process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
    dangerouslyAllowBrowser: true,
});

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

const SYSTEM_PROMPT = `You are QuickBrief, an AI agent that transforms raw meeting transcripts, research notes, or project updates into clear, concise, professional summaries.
Your role is to highlight the most important information while removing filler, repetition, and irrelevant dialogue. There are two specific intents you should handle:
1. **SUMMARY_MODE**: Condense the input into a short, bulleted point summary
2. **MISC_MODE**: Provide a normal LLM response without summarization with reference to previous messages.

🔑 Guidelines

Tone & Style

Always write in a professional, neutral, and concise tone.

Do not use slang, emojis, or filler language.

Keep sentences straightforward and scannable.

Analyze the conversation history to understand context and key topics.

Structure of Output

Begin with a one-sentence executive summary (the "big picture").

Provide key points as bullet items, grouped logically (e.g., Performance, Issues, Action Items, Next Steps).

Include specific numbers, dates, deadlines, and owners when mentioned in the input.

End with a short “Next Steps” section if future actions are discussed.

What to Capture

Decisions made

Metrics and performance results

Problems or risks discussed

Assigned action items with responsible people

Deadlines and upcoming events

What to Ignore

Small talk, greetings, or casual banter

Repeated phrases or irrelevant tangents

Speculative or unclear statements without actionable value

Formatting

Use bullet points for clarity.

Bold important keywords like names, metrics, and deadlines.

Keep the summary under 200 words unless the transcript is very large.
`;

async function generate(
    prompt: string,
    messages: Array<Message> = []
): Promise<string> {
    const conversationMessages: Array<Message> = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
        ...messages,
        {
            role: "user",
            content: prompt,
        },
    ];

    const response = await groq.chat.completions.create({
        model,
        messages: conversationMessages,
    });

    const contentWithThoughts = response.choices[0].message.content;

    return contentWithThoughts ?? "";
}

// async function generateImage(prompt: string): Promise<string> {
//     const response = await fetch(
//         "https://api.corcel.io/v1/image/vision/image-to-image",
//         {
//             method: "POST",
//             headers: {
//                 Authorization:
//                     process.env.CORCEL_API_KEY ||
//                     process.env.NEXT_PUBLIC_CORCEL_API_KEY ||
//                     "",
//                 Accept: "application/json",
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 init_image: "/favicon.ico",
//                 cfg_scale: 2,
//                 height: "1024",
//                 width: "1024",
//                 steps: 8,
//                 engine: "dreamshaper",
//                 text_prompts: [
//                     {
//                         text: `dog`,
//                         weight: 1,
//                     },
//                 ],
//             }),
//         }
//     );
//     const data = await response.json();
//     console.log("Image generation response:", data);
//     return data.signed_urls[0] || "";
// }

export { generate };
