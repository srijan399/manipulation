import { generate } from "@/lib/generate";
import { NextRequest, NextResponse } from "next/server";
import cleanResponse from "@/lib/parseUntilJSON";
import parseUntilJson from "@/lib/parseUntilJSON";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

const MAX_RETRIES = 3;

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

const generateWithRetry = async (
    prompt: string,
    conversationHistory: Array<Message>,
    retries = MAX_RETRIES,
    delay = 1500
): Promise<string> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await generate(prompt, conversationHistory);
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error("All attempts failed");
};

const get_intent = async (
    query: string,
    conversationHistory: Array<Message>
) => {
    const prompt = `You are an expert Intent & Topic Classifier for a summarizing and email sending chatbot. Your job is to analyze the user's query and the last 10 turns of chat history to determine the user's intent.

    You must classify the intent into one of the following categories: **["Summary Mode", "Misc Mode"]**.

    * **Summary Mode**: Use for requests to summarize information, condense text, or extract key points from meeting transcripts, emails, and other documents when provided.
    * **Misc Mode**: Use for greetings, goodbyes, thank yous, or any other conversational filler that does not require summarizing or sending anything.
    
    **RULES**
    Do not blindly set the intent. Understand the context of the question in hand. Questions pertaining to why, what, how's should be answered using the Misc Mode. If a transcript is provided and a clear goal is provided by the user, then the Summary Mode should be used in order to extract the summary.

    Analyze the following input and provide your output in a JSON format with one key: "intent" followed by the actual intent mode.

    -----

    **Example 1:**

    **Chat History:**
    User: "Hey, what's up?"
    Bot: "Not much, just here to help you summarize any information you'd like to condense. Would you like to talk about something specific or just say hello?"
    User: "I have a meeting today but I wont be able to attend it."
    Bot: "That's not ideal! Don't worry, I'd be happy to help you summarize the meeting. However, I'll need some more information from you. Can you give me some details about the meeting, such as what it's about, who is attending, and where the meeting is happening? This way, I can provide you with a personalized summary"

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

    const res = await generateWithRetry(prompt, conversationHistory);

    const shouldBeCleanedRes = parseUntilJson(res);
    console.log("Testing Intent parseUntilJSON:", shouldBeCleanedRes);

    return shouldBeCleanedRes;
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
    const response = await generateWithRetry(prompt, conversationHistory);

    const shouldBeCleanedRes = parseUntilJson(response);
    console.log("Testing parseUntilJSON:", shouldBeCleanedRes);

    return shouldBeCleanedRes;
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
     "response": "<concise meeting summary>",
     "action": "<next steps or actions to be taken>"
   }

2. **Content Guidelines**:
   - Capture the main topics, decisions, and next steps.
   - Include important numbers, dates, and commitments.
   - Keep the summary short and professional (3 to 6 sentences).
   - Do NOT include filler, greetings, or irrelevant chatter.
   - Guidelines for Meeting Summaries

    Keep it concise → focus on decisions, action items, blockers, and timelines.
    Organize logically → group points under sections (e.g., Review, Discussion, Decisions, Next Steps).
    Be neutral and factual → avoid speculation or personal opinions.
    Highlight accountability → note who is responsible where possible.
    Always include timelines → deadlines, release targets, or follow-up dates.
    Format consistently → so team members know where to find what.
    Adapt to context → for sprints, highlight backlog items; for client calls, highlight agreements and next steps.

    📌 Standard Output Format

    (what you should produce every time in different JSON properties inside the response field)

    Meeting Summary

    date: [from given if possible]
    participants: [optional if available]
    agenda: [1 to 2 lines, optional if available]
    discussion_points: [Bullet list of main discussion highlights]
    decision_made: [What was agreed on in the meeting]
    action_items: [Bullet list of action items]
    next_steps: [e.g., next meeting date, checkpoints, release milestones]

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

    Alex: Thanks for joining today, Priya. I would like to learn more about Finlytics and see where our platform might help. Could you start by telling me about your current setup?

    Priya: Sure. We are running analytics pipelines for 40+ enterprise clients. Right now we use a mix of AWS Glue and Snowflake, but managing data ingestion has been difficult. Our main issue is scaling with cost efficiency.

    Jordan: Interesting. Could you give an example of a bottleneck?

    Priya: Our monthly ETL jobs are expensive, and queries sometimes fail when concurrency spikes. We also lack strong monitoring.

    Alex: Understood. To clarify, are you mainly looking to optimize cost or reliability?

    Priya: Both, but cost is the number one driver. We spend around $250k annually just on ETL.

    Alex: Got it. Let me share how our solution could help. Our orchestration engine reduces redundant compute cycles, and our monitoring layer provides real-time alerts. We have seen customers cut costs by 30 to 40%.

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
    {
        "response": {
            "date": null,
            "participants": ["Alex", "Priya", "Jordan"],
            "agenda": "Explore Finlytics’ current data analytics setup and discuss how the platform could help with cost and reliability improvements.",
            "discussion_points": [
                "Priya shared that Finlytics manages analytics pipelines for 40+ enterprise clients using AWS Glue and Snowflake.",
                "Key issues included high ETL costs, concurrency-related query failures, and lack of monitoring.",
                "Priya highlighted cost as the primary concern, with annual ETL spending of ~$250k.",
                "Alex and Jordan explained their platform’s orchestration engine, monitoring layer, and AWS/Snowflake connector support.",
                "Solution claims included 30–40% cost reduction and minimal migration effort.",
                "Onboarding typically involves a 2-week pilot, followed by 6–8 weeks for full deployment.",
                "Pricing starts at $12k per month plus variable storage."
            ],
            "decision_made": "Priya expressed interest and requested a proposal for internal review.",
            "action_items": [
                "Alex to send a proposal to Priya by Friday.",
                "Jordan to include a fintech case study in the proposal."
            ],
            "next_steps": [
                "Proposal delivery and internal review by Finlytics.",
                "Potential follow-up discussions based on proposal evaluation."
            ]
        }, 
    }


    **Your Task:**
    Analyse transcript to give a proper summary.

        **Analyze the following input:**

        **Chat History:**
        ${conversationHistory}

        **User Query:**
        ${query}

        **Output:**


    `;

    const response = await generateWithRetry(
        SUMMARY_PROMPT,
        conversationHistory
    );

    const cleanedRes = parseUntilJson(response);
    console.log("Testing Summary parseUntilJSON:", cleanedRes);

    return cleanedRes;
};

const get_email_response = async (
    query: string,
    summary: Record<string, any>,
    conversationHistory: Array<Message>
) => {
    console.log("Summary:", summary);
    /* 
        ask if the user wants to send the summary and email it to <participant_emails>
    */
};

const postHandler = async (request: NextRequest) => {
    const { query, messages } = await request.json();
    console.log("Received query:", query);

    const conversationHistory: Array<Message> = messages.slice(0, -1); // All messages except the last one
    // console.log("Conversation history:", conversationHistory);

    const { intent } = await get_intent(query, conversationHistory);

    if (intent === "Misc Mode") {
        const miscResponse = await get_direct_response(
            query,
            conversationHistory
        );

        return NextResponse.json({
            message: "Prompt received successfully",
            intent: intent,
            response: miscResponse.response,
        });
    } else if (intent === "Summary Mode") {
        const summaryResponse = await get_summary_response(
            query,
            conversationHistory
        );

        const summary = summaryResponse.response;
        console.log("Summary response:", summary);

        // await get_email_response(summary, conversationHistory);

        return NextResponse.json({
            message: "Prompt received successfully",
            intent: intent,
            response: summary,
        });
    }

    return NextResponse.json({
        message: "Prompt received successfully",
    });
};

export { postHandler as POST };
