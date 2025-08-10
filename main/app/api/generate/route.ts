import { generate } from "@/lib/generate";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

// Store messages in memory (for demo purposes)
// In production, you might want to use a database or session storage
let messages: Array<Message> = [];

const postHandler = async (request: NextRequest) => {
    const { prompt } = await request.json();
    console.log("Received prompt:", prompt);

    // Add user message to history
    messages.push({
        role: "user",
        content: prompt,
    });

    // Pass the message history (excluding the current prompt since it's already added in generate function)
    const conversationHistory = messages.slice(0, -1); // All messages except the last one
    const text = await generate(prompt, conversationHistory);

    const filePath = path.join(process.cwd(), "logs", "output.json");
    console.log(fs.existsSync(path.dirname(filePath)));

    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        console.log("Created logs directory");
    }

    let existingData = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        existingData = fileContent ? JSON.parse(fileContent) : [];
    }

    existingData.push({
        prompt,
        response: text,
        timestamp: new Date().toISOString(),
        messageHistory: messages,
    });

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    // Add assistant response to history
    messages.push({
        role: "assistant",
        content: text,
    });

    return NextResponse.json({
        message: "Prompt received successfully",
        data: {
            text: text,
            messages: messages,
            conversationLength: messages.length,
        },
    });
};

export { postHandler as POST };
