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
        console.log("Parsed JSON data:", jsonData);

        // Handle nested JSON string in intent field
        let intent = jsonData.intent || jsonData.data?.intent || "";

        if (
            typeof intent === "string" &&
            (intent.startsWith("{") || intent.includes('"intent"'))
        ) {
            try {
                const parsedIntent = JSON.parse(intent);
                intent = parsedIntent.intent || intent;
            } catch {}
        }

        // Return the cleaned JSON structure
        const cleanedData = {
            data: {
                intent: intent,
            },
        };

        return JSON.stringify(cleanedData);
    } catch (error) {
        // If JSON parsing fails, return empty string
        return "";
    }
};

export default cleanResponse;
