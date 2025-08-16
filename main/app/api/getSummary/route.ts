import { generate } from "@/lib/generate";
import { NextRequest, NextResponse } from "next/server";
import cleanResponse from "@/utils/cleanResponse";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

/*
1. Gets text from the user
2. Processes the text to find intent of the text (Intent Layer)
3. If Intent is of type SUMMARY_MODE, then condense the text into a short bulleted point summary.
4. If Intent is of type MISC_MODE, then send normal LLM response.
5. Format Point into an email
6. Send to a selected List.
 */

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
const get_intent = async (
    query: string,
    conversationHistory: Array<Message>
): Promise<string> => {
    const prompt = `You are an expert Intent & Topic Classifier for a summarizing and email sending chatbot. Your job is to analyze the user's query and the last 10 turns of chat history to determine the user's intent.

    You must classify the intent into one of the following categories: **["Summary Mode", "Misc Mode"]**.

    * **Summary Mode**: Use for requests to summarize information, condense text, or extract key points.
    * **Misc Mode**: Use for greetings, goodbyes, thank yous, or any other conversational filler that does not require summarizing or sending anything.


    Analyze the following input and provide your output in a JSON format with one key: "intent" followed by the actual intent mode.

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

const get_direct_response = async (
    query: string,
    conversationHistory: Array<Message>
) => {
    // This function returns a direct response based on the query.
    const prompt = `You are a helpful summarization chatbot. Your task is to converse with the user in a friendly and engaging manner, and respond to the user's latest query in an engaging and conversational manner.

    Your output should be a JSON object with a single key "response" whose value is your generated response as a string.

    Format your output exactly as follows:

    json
    {
        \"response\": \"<response to the user's query>\"
}

    **User Query:**
    ${query}

    **Output:**
`;
    const response = await generate(prompt, conversationHistory);
    console.log("MISC response:", response);

    cleanResponse(response);
    const cleanRes = response.replace(/^json\s*/, "");

    return cleanRes;
};

const get_summary_response = async (
    query: string,
    conversationHistory: Array<Message>
) => {
    const SUMMARY_PROMPT = `You are a Meeting Summarization Agent. 
Your job is to read a meeting transcript and return a concise summary of key points. 
Follow these rules strictly:

1. **Output Format**: 
   Always return ONLY valid JSON in the following structure:
   {
     "response": "<concise meeting summary>"
   }

2. **Content Guidelines**:
   - Capture the main topics, decisions, and next steps.
   - Include important numbers, dates, and commitments.
   - Keep the summary short and professional (3 to 6 sentences).
   - Do NOT include filler, greetings, or irrelevant chatter.

3. **Style**:
   - Neutral and factual tone.
   - Use past tense for what happened.
   - Do not add commentary or speculation.

4. **Strictness**:
   - Never output text outside the JSON object.
   - Never wrap the JSON in code fences or markdown.
   - Ensure the JSON is always syntactically valid.

 **Example 1:**

    **Chat History:**
    User: "Hey, can you help me summarize a meeting content?"
    Bot: "Of course! What topic are you focusing on today?"
    User: "Focusing on Sales today."
    Bot: "Feel free to drop in the text content for the meeting/transcripts."

    **User Query:**
    "Can you summarize the key points from the meeting on this meeting transcript? Transcript:

Alex: Thanks for joining today, Priya. I’d like to learn more about Finlytics and see where our platform might help. Could you start by telling me about your current setup?

Priya: Sure. We are running analytics pipelines for 40+ enterprise clients. Right now we use a mix of AWS Glue and Snowflake, but managing data ingestion has been difficult. Our main issue is scaling with cost efficiency.

Jordan: Interesting. Could you give an example of a bottleneck?

Priya: Our monthly ETL jobs are expensive, and queries sometimes fail when concurrency spikes. We also lack strong monitoring.

Alex: Understood. To clarify, are you mainly looking to optimize cost or reliability?

Priya: Both, but cost is the number one driver. We spend around $250k annually just on ETL.

Alex: Got it. Let me share how our solution could help. Our orchestration engine reduces redundant compute cycles, and our monitoring layer provides real-time alerts. We have seen customers cut costs by 30–40%.

Jordan: Also, we support native connectors for AWS and Snowflake, so migration would be minimal.

Priya: That sounds promising. What does onboarding look like?

Alex: Typically, we run a 2-week pilot. Our team handles most of the setup, and we train your engineers. After that, full deployment usually takes 6 to 8 weeks.

Priya: Okay. Pricing is obviously important.

Alex: For enterprises of your scale, pricing starts at $12k per month, plus variable storage.

Priya: That is within the range we consider reasonable. I would like a proposal to review internally.

Alex: Absolutely. We will send a proposal by Friday.

Jordan: We can also include a case study from a similar client in fintech.

Priya: Great, please do. Thanks for the detailed walkthrough today.

Alex: Thanks, Priya. Looking forward to next steps.
    " 

    **Output:**

    json
    {{
  "response": "In the sales discovery call, Priya (CTO of Finlytics) explained their challenges with costly and unreliable data pipelines using AWS Glue and Snowflake, with ETL costs reaching $250k annually. The sales team proposed their orchestration and monitoring solution, highlighting 30–40% cost savings, native integrations, and a 2-week pilot leading to a 6–8 week deployment. Pricing was discussed at $12k per month plus storage. Priya expressed interest and requested a proposal and case study, with next steps being a proposal delivery by Friday."
}}

**Your Task:**
Analyse transcript to give a proper summary.

    **Analyze the following input:**

    **Chat History:**
    ${conversationHistory}

    **User Query:**
    ${query}

    **Output:**


`;
    const response = await generate(SUMMARY_PROMPT, conversationHistory);
    console.log("summary response:", response);

    cleanResponse(response);
    const cleanRes = response.replace(/^json\s*/, "");

    return cleanRes;
};

const postHandler = async (request: NextRequest) => {
    const { query, messages } = await request.json();
    console.log("Received query:", query);

    let res: string = "";

    const conversationHistory: Array<Message> = messages.slice(0, -1); // All messages except the last one
    console.log("Conversation history:", conversationHistory);

    const intentResult = await get_intent(query, conversationHistory);

    const intent = JSON.parse(intentResult);
    console.log("Intent trying result:", intent.intent);

    if (intent.intent === "Misc Mode") {
        res = await get_direct_response(query, conversationHistory);
        console.log("checkmisc:", res);
        const miscResponse = JSON.parse(res);
        console.log("Misc response:", miscResponse.response);

        return NextResponse.json({
            message: "Prompt received successfully",
            intent: intent,
            response: miscResponse.response,
        });
    } else if (intent.intent === "Summary Mode") {
        res = await get_summary_response(query, conversationHistory);
        console.log("CheckSummaryResponse:", res);
        return NextResponse.json({
            message: "Prompt received successfully",
        });
    }

    return NextResponse.json({
        message: "Prompt received successfully",
    });
};

export { postHandler as POST };
