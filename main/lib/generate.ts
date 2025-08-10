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

async function generate(
    prompt: string,
    messages: Array<Message> = []
): Promise<string> {
    console.log("Prompt from frontend:", prompt);
    console.log("Message history:", messages);

    // Build the conversation history
    const conversationMessages: Array<Message> = [
        {
            role: "system",
            content:
                "You are a helpful cricket content generator assistant. You can discuss cricket topics, provide analysis, stats, and generate cricket-related content. Maintain context from previous messages in the conversation.",
        },
        ...messages, // Include conversation history
        {
            role: "user",
            content: prompt,
        },
    ];

    const response = await groq.chat.completions.create({
        model,
        messages: conversationMessages,
    });

    console.log("Response from Groq:", response);

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
