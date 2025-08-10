import { ALL, parseJSON } from "partial-json";

export function parseUntilJson(jsonstr: string): Record<string, any> {
    if (!jsonstr || typeof jsonstr !== "string") {
        return {};
    }

    let jsonRes = jsonstr.trim();

    // Remove markdown code blocks - handle multiple backticks properly
    if (jsonRes.startsWith("```json")) {
        jsonRes = jsonRes.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (jsonRes.startsWith("```")) {
        jsonRes = jsonRes.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Remove single backticks at start/end
    jsonRes = jsonRes.replace(/^`+|`+$/g, "");
    jsonRes = jsonRes.trim();

    // Try standard JSON parsing first - this handles complete, valid JSON
    try {
        const parsed = JSON.parse(jsonRes);
        if (typeof parsed === "object" && parsed !== null) {
            return parsed;
        }
    } catch (error) {
        // Continue to partial parsing below
        console.log("Standard JSON parsing failed, trying partial parsing...");
    }

    // Find the start of JSON structure (either { or [)
    const curlIndex = jsonRes.indexOf("{");
    const sqIndex = jsonRes.indexOf("[");

    // If no JSON structure found, return empty object
    if (curlIndex === -1 && sqIndex === -1) {
        console.warn("No JSON structure found in input");
        return {};
    }

    // Get the earliest JSON structure
    const startIndex =
        curlIndex === -1
            ? sqIndex
            : sqIndex === -1
            ? curlIndex
            : Math.min(curlIndex, sqIndex);

    jsonRes = jsonRes.slice(startIndex);

    // Try partial JSON parsing with the partial-json library
    try {
        const result = parseJSON(jsonRes, ALL);

        // Ensure we return an object, not a string or primitive
        if (typeof result === "object" && result !== null) {
            return result;
        } else {
            console.warn("Parsed result is not an object:", typeof result);
            return {};
        }
    } catch (error) {
        console.error("Partial JSON parsing failed:", error);
        return {};
    }
}

// Alternative version with more robust error handling and logging
export function parseUntilJsonVerbose(jsonstr: string): Record<string, any> {
    console.log("Input string length:", jsonstr?.length || 0);

    if (!jsonstr || typeof jsonstr !== "string") {
        console.warn("Invalid input: not a string or empty");
        return {};
    }

    let jsonRes = jsonstr.trim();
    console.log("After trim, length:", jsonRes.length);

    // Remove various markdown code block formats
    const originalLength = jsonRes.length;

    if (jsonRes.startsWith("```json")) {
        jsonRes = jsonRes.replace(/^```json\s*/, "").replace(/```\s*$/, "");
        console.log("Removed ```json wrapper");
    } else if (jsonRes.startsWith("```")) {
        jsonRes = jsonRes.replace(/^```\s*/, "").replace(/```\s*$/, "");
        console.log("Removed ``` wrapper");
    }

    // Remove single backticks
    const beforeBackticks = jsonRes.length;
    jsonRes = jsonRes.replace(/^`+|`+$/g, "");
    if (beforeBackticks !== jsonRes.length) {
        console.log("Removed backticks");
    }

    jsonRes = jsonRes.trim();
    console.log("Final cleaned length:", jsonRes.length);

    // Try standard JSON parsing first
    try {
        const parsed = JSON.parse(jsonRes);
        if (typeof parsed === "object" && parsed !== null) {
            console.log("Successfully parsed with standard JSON.parse");
            return parsed;
        } else {
            console.log(
                "Standard parse succeeded but result is not an object:",
                typeof parsed
            );
        }
    } catch (error) {
        console.log("Standard JSON parsing failed:", (error as Error).message);
    }

    // Find JSON structure boundaries
    const curlIndex = jsonRes.indexOf("{");
    const sqIndex = jsonRes.indexOf("[");

    console.log("Found { at index:", curlIndex);
    console.log("Found [ at index:", sqIndex);

    if (curlIndex === -1 && sqIndex === -1) {
        console.warn("No JSON structure markers found");
        return {};
    }

    const startIndex =
        curlIndex === -1
            ? sqIndex
            : sqIndex === -1
            ? curlIndex
            : Math.min(curlIndex, sqIndex);

    console.log("Starting JSON extraction from index:", startIndex);
    jsonRes = jsonRes.slice(startIndex);
    console.log("Extracted JSON string length:", jsonRes.length);
    console.log("First 100 chars:", jsonRes.substring(0, 100));

    // Try partial JSON parsing
    try {
        console.log("Attempting partial JSON parsing...");
        const result = parseJSON(jsonRes, ALL);
        console.log("Partial parsing result type:", typeof result);

        if (typeof result === "object" && result !== null) {
            console.log("Successfully parsed with partial-json library");
            return result;
        } else {
            console.warn(
                "Partial parsing succeeded but result is not an object:",
                result
            );
            return {};
        }
    } catch (error) {
        console.error("Partial JSON parsing failed:", (error as Error).message);
        return {};
    }
}
