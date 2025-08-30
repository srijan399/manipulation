from client import LLMClient
from typing import Optional
from utils import clean_response, call_with_retry, log_info, log_success, log_warning, log_error, log_debug, log_step, log_timing, log_pipeline_start, log_pipeline_end
import time
from rag import semantic_search
from models import Intent, ContextQueries, ContextSummary, Response, ResponseValidation

llm_client = LLMClient()


def get_intent(query: str, chat_history: list[dict] = []) -> Intent:
    """
    Analyze user query and chat history to determine intent and topic for educational chatbot.

    Classifies user intent into one of five categories: Learning Mode, Revision Mode,
    Cheatsheet Mode, Normal Mode, or Misc Mode. Also extracts the main conversation topic.

    Args:
        query: The current user query to analyze
        chat_history: List of previous conversation messages in dict format with 'role' and 'content' keys
        max_retries: Maximum number of retry attempts for LLM calls (default: 3)
        delay: Delay between retry attempts in seconds (default: 1)

    Returns:
        Intent: Object containing classified intent and extracted topic
    """
    log_step("Intent Classification", f"Analyzing query with {len(chat_history)} chat history items")
    start_time = time.time()
    
    prompt = f"""You are an expert Intent & Topic Classifier for an educational chatbot. Your job is to analyze the user's query and the last 10 turns of chat history to determine the user's intent and the main topic of conversation.

You must classify the intent into one of the following categories: **["Learning Mode", "Revision Mode", "Cheatsheet Mode", "Normal Mode", "Misc Mode"]**.

  * **Learning Mode**: Use for foundational questions, requests for definitions, or "what is" / "how does" style questions where the user is learning a topic for the first time.
  * **Revision Mode**: Use when the user asks complex or layered questions, multiple-choice questions (MCQs), or quizzes to test their knowledge.
  * **Cheatsheet Mode**: Use when the user asks for a summary, a direct "cheatsheet", a list of important points, or key formulas.
  * **Normal Mode**: Use for normal questions related to the topic, whose answers are however present in the chat history. This can be used for any question which simply asks for clarification on a topic or concept already discussed.
  * **Misc Mode**: Use for greetings, goodbyes, thank yous, or any other conversational filler that does not require retrieving educational material.

You must also extract the core **"Topic"** from the chat history.

Analyze the following input and provide your output in a JSON format with two keys: "intent" and "topic".

-----

**Example 1:**

**Chat History:**
`User: "Hey, can you help me study for my CS exam?"`
`Bot: "Of course! What topic are you focusing on today?"`
`User: "Let's start with data structures. Can you tell me about linked lists?"`
`Bot: "A linked list is a linear data structure..."`

**User Query:**
`"How do you traverse a singly linked list?"`

**Output:**

json
{{
  "intent": "Learning Mode",
  "topic": "Linked Lists"
}}


-----

**Example 2:**

**Chat History:**
`User: "Can you explain the concept of photosynthesis?"`
`Bot: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight..."`


**User Query:**
`"Awesome, thanks so much!"`

**Output:**

json
{{
  "intent": "Misc Mode",
  "topic": "Photosynthesis"
}}


-----

**Your Task:**

**Analyze the following input:**

**Chat History:**
{chat_history}

**User Query:**
{query}

**Output:**
"""

    messages = [{"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return Intent(**response)
        except Exception as e:
            log_error("Intent classification failed", error=e)
            raise

    try:
        intent = call_with_retry(call_llm)
        duration = time.time() - start_time
        log_success("Intent Classification Complete", f"Intent: {intent.intent}, Topic: {intent.topic}")
        log_timing("Intent Classification", duration)
        return intent
    except Exception as e:
        log_error("Intent classification failed after retries", error=e)
        raise


def get_context_queries(
    query: str, chat_history: list[dict], topic: str
) -> ContextQueries:
    """
    Generate 1-3 relevant context queries for knowledge base retrieval.

    Analyzes user query, chat history, and topic to determine the most relevant
    queries for retrieving context information that is not already present in the chat history.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation extracted from intent classification

    Returns:
        ContextQueries: Object containing list of generated context queries
    """
    log_step("Context Query Generation", f"Generating queries for topic: {topic}")
    start_time = time.time()
    
    prompt = f"""You are an expert Context Query Generator for an educational chatbot. Your job is to analyze the user's query, the last 10 turns of chat history and the topic of conversation to determine the 1 to 3 most relevant queries to retrieve context from the knowledge base.

    Each query should be a single topic or phrase that is relevant to the topic of conversation and whose answers or context is not present in the chat history.
    Do not take your own knowledge into account, only the chat history and the user's query.

    The generated queries should be unique and should not overlap with each other. The queries should be specific to the topic of conversation and should not be too broad. In maximum cases, only 1 query should be generated, unless the user's query is very broad.

    Your output should be a JSON with a single key "queries" which is a list of strings.

    **Example 1:**

    **Chat History:**
    `User: "Hey, can you help me study for my CS exam?"`
    `Bot: "Of course! What topic are you focusing on today?"`

    **User Query:**
    `"How do you traverse a singly linked list?"`

    **Topic:**
    `"Linked Lists"`

    **Output:**

json
{{
  "queries": ["Singly Linked List", "Linked List Traversal"]
}}


-----


**Chat History:**
{chat_history}

**User Query:**
{query}

**Topic:**
{topic}

**Output:**
"""

    messages = [{"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return ContextQueries(**response)
        except Exception as e:
            log_error("Context query generation failed", error=e)
            raise

    try:
        context_queries = call_with_retry(call_llm)
        duration = time.time() - start_time
        log_success("Context Query Generation Complete", f"Generated {len(context_queries.queries)} queries")
        log_info("Generated Context Queries", f"Queries: {', '.join(context_queries.queries)}")
        log_timing("Context Query Generation", duration)
        return context_queries
    except Exception as e:
        log_error("Context query generation failed after retries", error=e)
        raise


def summarize_context(
    query: str,
    chat_history: list[dict],
    topic: str,
    context_query: str,
    context: list[tuple[str, dict]],
) -> ContextSummary:
    """
    Summarize retrieved context to extract only relevant information for the current conversation.

    Analyzes the fetched context and filters out irrelevant information, focusing only on
    facts and explanations that directly address the user's needs based on query and chat history.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation
        context_query: The specific query used to retrieve this context
        context: List of tuples containing retrieved context text and metadata

    Returns:
        ContextSummary: Object containing summarized relevant information from the context
    """
    log_step("Context Summarization", f"Summarizing {len(context)} items for query: {context_query}")
    start_time = time.time()
    
    prompt = f"""You are an expert Context Summarizer for an educational chatbot. Your job is to analyze the user's query, the last 10 turns of chat history, and the topic of conversation to extract and summarize only the most relevant information from the context retrieved from the knowledge base.

    **Important Instructions:**
    - Do NOT summarize or repeat the user query or the chat history.
    - Use the user query and chat history only as background to understand what information is relevant to the current conversation.
    - Focus solely on the fetched context: extract the key facts, explanations, or data that directly address the user's needs, as inferred from the query and chat history.
    - Filter out any irrelevant, redundant, or generic information (noise) that is not useful for the current conversation.
    - Your summary should be concise, focused, and should not include any information already present in the chat history or user query.

    Your output should be a JSON with a single key \"summary\" which is a string, in the following format:

    json
    {{
        \"summary\": \"<summary of the relevant information from the fetched context>\"
    }}
    

    **User Query:**
    {query}

    **Chat History:**
    {chat_history}

    **Topic:**
    {topic}

    **Context Query:**
    {context_query}

    **Fetched Context to be summarized:**
    {context}

    **Output:**
    """

    messages = [{"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return ContextSummary(**response)
        except Exception as e:
            log_error("Context summarization failed", f"Query: {context_query}", error=e)
            raise

    try:
        context_summary = call_with_retry(call_llm)
        duration = time.time() - start_time
        summary_length = len(context_summary.summary)
        log_success("Context Summarization Complete", f"Summary length: {summary_length} chars for query: {context_query}")
        log_timing("Context Summarization", duration)
        return context_summary
    except Exception as e:
        log_error("Context summarization failed after retries", f"Query: {context_query}", error=e)
        raise


def get_context(
    context_queries: list[str], chat_history: list[dict], topic: str, query: str
) -> tuple[list[str], list[dict]]:
    """
    Retrieve and process context information from knowledge base using multiple queries.

    Performs semantic search for each context query, deduplicates metadata,
    and summarizes the retrieved context to extract relevant information.

    Args:
        context_queries: List of queries to search the knowledge base
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation
        query: The original user query

    Returns:
        Tuple containing:
            - List of summarized context strings
            - List of unique metadata dictionaries from retrieved documents
    """
    log_step("Context Retrieval", f"Processing {len(context_queries)} context queries")
    start_time = time.time()

    results: list[str] = []
    metadata: list[dict] = []
    seen_metadata = set()

    for i, context_query in enumerate(context_queries, 1):
        log_info(f"Context Query {i}/{len(context_queries)}", f"Searching for: {context_query}")
        
        try:
            search_start = time.time()
            result: list[tuple[str, dict]] = semantic_search(context_query)
            search_duration = time.time() - search_start
            
            log_success(f"Semantic Search Complete", f"Found {len(result)} results in {search_duration:.2f}s")
            
            for item in result:
                metadata_dict = item[1]
                metadata_key = frozenset(metadata_dict.items())
                if metadata_key not in seen_metadata:
                    seen_metadata.add(metadata_key)
                    metadata.append(metadata_dict)
                    results.append(item[0])

            # Summarize context currrently skipped
            # summary: ContextSummary = summarize_context(
            #     query, chat_history, topic, context_query, result
            # )
            # results.append(summary.summary)

            
        except Exception as e:
            log_error(f"Context retrieval failed for query: {context_query}", error=e)
            results.append("")

    duration = time.time() - start_time
    total_summaries = sum(1 for r in results if r.strip())
    log_success("Context Retrieval Complete", f"Generated {total_summaries} summaries from {len(metadata)} unique sources")
    log_timing("Context Retrieval", duration)
    
    return results, metadata


def run_context_layer(
    query: str, chat_history: list[dict], topic: str
) -> tuple[list[str], list[dict]]:
    """
    Execute the complete context retrieval pipeline.

    Orchestrates the context layer by first generating context queries,
    then retrieving and processing the relevant context information.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation

    Returns:
        Tuple containing:
            - List of summarized context strings
            - List of unique metadata dictionaries from retrieved documents
    """
    log_step("Context Layer", "Starting context retrieval pipeline")
    start_time = time.time()
    
    try:
        context_queries = get_context_queries(query, chat_history, topic)
        context, metadata = get_context(context_queries.queries, chat_history, topic, query)
        
        duration = time.time() - start_time
        log_success("Context Layer Complete", f"Retrieved {len(context)} context summaries")
        log_timing("Context Layer", duration)
        
        return context, metadata
    except Exception as e:
        log_error("Context layer failed", error=e)
        raise


def generate_response(
    query: str,
    chat_history: list[dict],
    topic: str,
    context: list[str],
    reason: str = None,
    resolution: str = None,
    past_response: str = None,
) -> Response:
    """
    Generate educational chatbot response using provided context and conversation history.

    Creates a comprehensive response that incorporates retrieved context information
    and maintains conversation flow. Supports refinement based on previous response validation.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation
        context: List of summarized context strings from knowledge base
        reason: Optional reason why previous response was suboptimal (for refinement)
        resolution: Optional suggestion for improving response (for refinement)
        past_response: Optional previous response that needs improvement (for refinement)

    Returns:
        Response: Object containing the generated response text
    """
    is_refinement = bool(reason and resolution and past_response)
    step_name = "Response Refinement" if is_refinement else "Response Generation"
    log_step(step_name, f"Using {len(context)} context summaries")
    
    if is_refinement:
        log_warning("Response Refinement Required", f"Reason: {reason[:100]}...")
    
    start_time = time.time()
    
    base_prompt = f"""You are an expert educational chatbot response generator. Your task is to carefully read the user's query, the last 10 turns of chat history, the main topic, and any relevant context, and then generate a clear, helpful, and conversational response that directly addresses the user's query.

Guidelines:
- Your response should be accurate, friendly, engaging, descriptive, and relevant to the user's question.
- Maintain a friendly and engaging tone, appropriate for an educational setting.
- Try to be as descriptive as possible, and use the context to provide more information.
- In the end, ask the user if they have any questions or need further clarification.
- If the context contains useful information, incorporate it naturally into your answer.
- Avoid repeating information already present in the chat history unless it is necessary for clarity.
- Assume that you know nothing outside the provided context, topic, or chat history.
- Only output a JSON object with a single key "response" whose value is your generated response as a string."""

    refinement_section = ""
    if reason and resolution and past_response:
        refinement_section = f"""

**IMPORTANT - This is a response refinement attempt:**
The previous response was deemed suboptimal for the following reason: {reason}

**Previous Response:**
{past_response}

**How to improve:**
{resolution}

Please generate a new response that addresses these issues and follows the improvement suggestions."""

    prompt = f"""{base_prompt}{refinement_section}

Format your output exactly as follows:

json
{{
    \"response\": \"<response to the user's query>\"
}}


**User Query:**
{query}

**Chat History:**
{chat_history}

**Topic:**
{topic}

**Context:**
{context}

**Output:**"""

    messages = [*chat_history, {"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return Response(**response)
        except Exception as e:
            log_error("Response generation failed", error=e)
            raise

    try:
        response = call_with_retry(call_llm)
        duration = time.time() - start_time
        response_length = len(response.response)
        log_success(f"{step_name} Complete", f"Generated response of {response_length} chars")
        log_timing(step_name, duration)
        return response
    except Exception as e:
        log_error(f"{step_name} failed after retries", error=e)
        raise


def validate_response(
    response: str, query: str, chat_history: list[dict], topic: str, context: list[str]
) -> ResponseValidation:
    """
    Validate the quality of a generated chatbot response.

    Evaluates response accuracy, relevance, and completeness based on the provided
    context and conversation history. Provides feedback for improvement if needed.

    Args:
        response: The generated response text to validate
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation
        context: List of summarized context strings used for response generation

    Returns:
        ResponseValidation: Object containing quality assessment and improvement suggestions
    """
    log_step("Response Validation", "Evaluating response quality")
    start_time = time.time()
    
    prompt = f"""You are a meticulous and impartial judge. Your role is to evaluate a generated chatbot response based on the provided context.

You must assess the response for accuracy, relevance to the user's query, and completeness based on the summarized context.

Your output must be a JSON object with one of two structures:

1. If the response is high-quality, clear, accurate, and fully utilizes the provided context:

json
{{
    "quality": "Optimal",
    "reason": "None",
    "resolution": "None"
}}


2. If the response is inaccurate, incomplete, irrelevant, or could be significantly improved:

json
{{
    "quality": "Suboptimal",
    "reason": "Provide a brief explanation of what is wrong with the response.",
    "resolution": "Provide a specific suggestion on how to fix the response and make it better."
}}


---

**Evaluation Materials:**

**User Query:**
{query}

**Chat History:**
{chat_history}

**Topic:**
{topic}

**Summarized Context that was used to generate the response:**
{context}

**Generated Response to be judged:**
{response}

---

**Your Judgement:**
"""

    messages = [{"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return ResponseValidation(**response)
        except Exception as e:
            log_error("Response validation failed", error=e)
            raise

    try:
        response_validation = call_with_retry(call_llm)
        duration = time.time() - start_time
        
        if response_validation.quality == "Optimal":
            log_success("Response Validation Complete", "Response quality: Optimal")
        else:
            log_warning("Response Validation Complete", f"Response quality: {response_validation.quality}")
            log_debug("Validation Issues", f"Reason: {response_validation.reason}")
        
        log_timing("Response Validation", duration)
        return response_validation
    except Exception as e:
        log_error("Response validation failed after retries", error=e)
        raise


def run_response_layer(
    query: str,
    chat_history: list[dict],
    topic: str,
    context: list[str],
    max_retries: int = 3,
) -> Response:
    """
    Execute the complete response generation and validation pipeline.

    Generates responses and validates their quality, attempting refinement if needed.
    Continues iteration until optimal response is achieved or maximum retries reached.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format
        topic: The main topic of conversation
        context: List of summarized context strings from knowledge base
        max_retries: Maximum number of refinement attempts (default: 3)

    Returns:
        Response: Object containing the final generated response text
    """
    log_step("Response Layer", f"Starting response generation with max {max_retries} attempts")
    start_time = time.time()
    
    response = None
    reason = None
    resolution = None
    past_response = None
    
    for attempt in range(max_retries):
        log_info(f"Response Attempt {attempt + 1}/{max_retries}", "Generating response")
        
        try:
            if attempt == 0:
                response = generate_response(query, chat_history, topic, context)
            else:
                response = generate_response(
                    query, chat_history, topic, context, reason, resolution, past_response
                )

            response_validation = validate_response(
                response.response, query, chat_history, topic, context
            )

            if response_validation.quality == "Optimal":
                duration = time.time() - start_time
                log_success("Response Layer Complete", f"Optimal response achieved on attempt {attempt + 1}")
                log_timing("Response Layer", duration)
                return response

            reason = response_validation.reason
            resolution = response_validation.resolution
            past_response = response.response
            
            if attempt < max_retries - 1:
                log_warning(f"Response needs refinement", f"Attempting refinement {attempt + 2}/{max_retries}")
            
        except Exception as e:
            log_error(f"Response generation attempt {attempt + 1} failed", error=e)
            if attempt == max_retries - 1:
                raise

    duration = time.time() - start_time
    log_warning("Response Layer Complete", f"Using suboptimal response after {max_retries} attempts")
    log_timing("Response Layer", duration)
    return response


def get_direct_response(query: str, chat_history: list[dict]) -> Response:
    """
    Generate direct conversational response without context retrieval.

    Used for miscellaneous queries, greetings, or when answers are already
    present in chat history. Provides friendly, engaging responses.

    Args:
        query: The current user query
        chat_history: List of previous conversation messages in dict format

    Returns:
        Response: Object containing the generated response text
    """
    log_step("Direct Response", "Generating response without context retrieval")
    start_time = time.time()
    
    prompt = f"""You are a helpful educational chatbot. Your task is to converse with the user in a friendly and engaging manner, and respond to the user's latest query in an engaging and conversational manner.

    Your output should be a JSON object with a single key "response" whose value is your generated response as a string.

    Format your output exactly as follows:

    json
    {{
        \"response\": \"<response to the user's query>\"
    }}
    

    **User Query:**
    {query}

    **Chat History:**
    {chat_history}

    **Output:**
    """

    messages = [*chat_history, {"role": "user", "content": prompt}]

    def call_llm():
        try:
            response = clean_response(llm_client.chat(messages))
            return Response(**response)
        except Exception as e:
            log_error("Direct response generation failed", error=e)
            raise

    try:
        direct_response = call_with_retry(call_llm)
        duration = time.time() - start_time
        response_length = len(direct_response.response)
        log_success("Direct Response Complete", f"Generated response of {response_length} chars")
        log_timing("Direct Response", duration)
        return direct_response
    except Exception as e:
        log_error("Direct response generation failed after retries", error=e)
        raise


def run_pipeline(
    query: str, chat_history: list[dict]
) -> tuple[str, Optional[list[dict]]]:
    """
    Execute the complete educational chatbot pipeline.

    Orchestrates the entire process from intent classification to response generation.
    Routes queries through appropriate processing paths based on detected intent.

    Args:
        query: The current user query to process
        chat_history: List of previous conversation messages in dict format with 'role' and 'content' keys

    Returns:
        Tuple containing:
            - Generated response text string
            - Optional list of metadata dictionaries from retrieved documents (None for direct responses)
    """
    start_time = time.time()
    log_pipeline_start(query)
    
    try:
        intent = get_intent(query, chat_history)
        topic = intent.topic
        metadata = None
        response = "I am sorry, I am not able to answer that question."
        
        log_info("Intent Routing", f"Routing to {intent.intent} pipeline")
        
        if intent.intent == "Learning Mode":
            log_info("Learning Mode Pipeline", "Using context retrieval and response generation")
            context, metadata = run_context_layer(query, chat_history, topic)
            response = run_response_layer(query, chat_history, topic, context)
        elif intent.intent == "Misc Mode":
            log_info("Misc Mode Pipeline", "Using direct response generation")
            response = get_direct_response(query, chat_history)
        elif intent.intent == "Normal Mode":
            log_info("Normal Mode Pipeline", "Using direct response generation")
            response = get_direct_response(query, chat_history)
        else:
            log_info(f"{intent.intent} Pipeline", "Using direct response generation (fallback)")
            response = get_direct_response(query, chat_history)

        end_time = time.time()
        total_duration = end_time - start_time
        
        response_text = response.response
        final_metadata = metadata if metadata else None
        
        log_success("Pipeline Success", f"Generated response for {intent.intent} query")
        if final_metadata:
            log_info("Response Metadata", f"Includes {len(final_metadata)} source documents")
        
        log_pipeline_end(total_duration)
        
        return response_text, final_metadata

    except Exception as e:
        end_time = time.time()
        total_duration = end_time - start_time
        log_error("Pipeline Failed", f"Total duration: {total_duration:.2f}s", error=e)
        log_pipeline_end(total_duration)
        raise


if __name__ == "__main__":
    print(
        run_pipeline(
            "What is the formula of density?",
            [
                {
                    "role": "user",
                    "content": "Hey, can you help me study for my Chemistry exam?",
                },
                {
                    "role": "assistant",
                    "content": "Of course! What topic are you focusing on today?",
                },
            ],
        )
    )
