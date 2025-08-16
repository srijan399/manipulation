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
