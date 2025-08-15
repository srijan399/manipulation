import { generate } from "@/lib/generate";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { User } from "lucide-react";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

/*
1. Gets text from the user
2. Processes the text to find intent of the text (Intent Layer)
3. If Intent is of type summarization, then condense the text into a short bulleted point summary.
4. If Intent is of type normal, then send normal LLM response.
5. Format Point into an email
6. Send to a selected List.
 */

// Store messages in memory (for demo purposes)
// In production, you might want to use a database or session storage
let messages: Array<Message> = [];

const cleanResponse = (response: string): string => {
    response = response.trim();

    // Extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
        return "";
    }

    try {
        // Parse the JSON
        const jsonData = JSON.parse(jsonMatch[1]);

        // Return just the intent value
        return jsonData.intent || "";
    } catch (error) {
        // If JSON parsing fails, return empty string
        return "";
    }
};

const get_intent = async (
    query: string,
    conversationHistory: Array<Message>
): Promise<string> => {
    /*
     * This function determines the intent of the user's query.
     * It could involve keyword matching, NLP techniques, etc.
     * For now, let's just return a dummy intent.
     */

    /*
    Analyze user query and chat history to determine intent and topic for educational chatbot.

    Classifies user intent into one of five categories: Summary Mode, Normal Mode, or Misc Mode. Also extracts the main conversation topic.

    Args:
        query: The current user query to analyze
        chat_history: List of previous conversation messages in dict format with 'role' and 'content' keys
        max_retries: Maximum number of retry attempts for LLM calls (default: 3)
        delay: Delay between retry attempts in seconds (default: 1)

    Returns:
        Intent: Object containing classified intent and extracted topic
    */

    const prompt = `You are an expert Intent & Topic Classifier for a summarizing and email sending chatbot. Your job is to analyze the user's query and the last 10 turns of chat history to determine the user's intent.

You must classify the intent into one of the following categories: **["Summary Mode", "Normal Mode", "Misc Mode"]**.

  * **Summary Mode**: Use for requests to summarize information, condense text, or extract key points.
  * **Normal Mode**: Use for normal questions related to the topic, whose answers are however present in the chat history. This can be used for any question which simply asks for clarification on a topic or concept already discussed.
  * **Misc Mode**: Use for greetings, goodbyes, thank yous, or any other conversational filler that does not require summarizing or sending anything.


Analyze the following input and provide your output in a JSON format with two keys: "intent".

-----

**Example 1:**

**Chat History:**
User: "Hey, can you help me summarize a meeting content?"
Bot: "Of course! What topic are you focusing on today?"
User: "Focusing on Sales today."
Bot: "Feel free to drop in the text content for the meeting/transcripts."

**User Query:**
"Can you summarize the key points from the meeting on Sales?" 

**Output:**

json
{{
  "intent": "Summary Mode",
}}


-----

**Example 2:**

**Chat History:**
User: "Can you explain the concept of Agenda?"
Bot: "The planned discussion points for the meeting. Allows to structure the summary around intended focus areas and flag if certain agenda items were skipped."


**User Query:**
"Awesome, thanks so much!"

**Output:**

json
{{
  "intent": "Misc Mode",
}}


-----

RULE: Provide with just the intent key with the actual intent Mode.

**Your Task:**

**Analyze the following input:**

**Chat History:**
${conversationHistory}

**User Query:**
${query}

**Output:**
`;

    const res = await generate(prompt, conversationHistory);
    console.log("Intent response:", res);

    cleanResponse(res);

    return res;
};

// const postHandler = async (request: NextRequest) => {
//     const { query } = await request.json();
//     console.log("Received query:", query);

//     messages.push({
//         role: "user",
//         content: query,
//     });

//     // Pass the message history (excluding the current prompt since it's already added in generate function)
//     const conversationHistory = messages.slice(0, -1); // All messages except the last one
//     const text = await generate(query, conversationHistory);

//     const filePath = path.join(process.cwd(), "logs", "output.json");
//     console.log(fs.existsSync(path.dirname(filePath)));

//     if (!fs.existsSync(path.dirname(filePath))) {
//         fs.mkdirSync(path.dirname(filePath), { recursive: true });
//         console.log("Created logs directory");
//     }

//     let existingData = [];
//     if (fs.existsSync(filePath)) {
//         const fileContent = fs.readFileSync(filePath, "utf8");
//         existingData = fileContent ? JSON.parse(fileContent) : [];
//     }

//     existingData.push({
//         prompt,
//         response: text,
//         timestamp: new Date().toISOString(),
//         messageHistory: messages,
//     });

//     fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

//     // Add assistant response to history
//     messages.push({
//         role: "assistant",
//         content: text,
//     });

//     return NextResponse.json({
//         message: "Prompt received successfully",
//         data: {
//             text: text,
//             messages: messages,
//             conversationLength: messages.length,
//         },
//     });
// };

const postHandler = async (request: NextRequest) => {
    const { query } = await request.json();
    console.log("Received query:", query);

    messages.push({
        role: "user",
        content: query,
    });

    const conversationHistory = messages.slice(0, -1); // All messages except the last one
    const intentResult = await get_intent(query, conversationHistory);

    messages.push({
        role: "assistant",
        content: intentResult,
    });

    return NextResponse.json({
        message: "Prompt received successfully",
        data: {
            intent: intentResult,
        },
    });
};

export { postHandler as POST };
