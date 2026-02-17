import { v4 as uuidv4 } from 'uuid';

/**
 * Extract JSON object from a string
 * @param {string} content 
 * @returns {string|null}
 */
function extractJsonObject(content) {
    let balance = 0;
    let start = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (escape) {
            escape = false;
            continue;
        }

        if (char === '\\') {
            escape = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') {
                if (balance === 0) start = i;
                balance++;
            } else if (char === '}') {
                balance--;
                if (balance === 0 && start !== -1) {
                    return content.substring(start, i + 1);
                }
            }
        }
    }
    return null;
}

/**
 * Parse tool calls in response
 * Returns: { tool_calls: Array, remaining: string }
 * @param {string} content 
 */
function parseToolCalls(content) {
    let tool_calls = [];
    let matches = [];
    let remaining = content;

    // Strategy: Find tool_call blocks by counting backticks
    const toolCallPattern = /(`{3,})(tool_call|json)\s*\n?/gi;

    let processedRanges = [];

    let match;
    while ((match = toolCallPattern.exec(content)) !== null) {
        const backticks = match[1];
        const backtickCount = backticks.length;
        const startPos = match.index;
        const contentStart = startPos + match[0].length;

        // Skip if already processed
        if (processedRanges.some(r => startPos >= r[0] && startPos < r[1])) {
            continue;
        }

        // Find closing backticks
        // JS doesn't have identical regex features to Python, so we implement manual search
        let searchPos = contentStart;
        let foundEnd = false;
        let endPos = -1;

        // Construct regex for closing: \n`{count} or `{count}$
        // We search manually for the backtick sequence
        const closingSequence = '\n' + '`'.repeat(backtickCount);
        const closingSequenceEnd = '`'.repeat(backtickCount);

        // Simple search for next occurrence
        let closeIdx = content.indexOf(closingSequence, searchPos);
        if (closeIdx === -1) {
            // Try end of string match
            // Check if it ends with backticks
            // This is a simplified check compared to regex
            const lastTicks = content.lastIndexOf(closingSequenceEnd);
            if (lastTicks >= searchPos && lastTicks + backtickCount === content.length) {
                closeIdx = lastTicks;
            }
        }

        if (closeIdx !== -1) {
            endPos = closeIdx;
            const jsonContent = content.substring(contentStart, endPos).trim();

            // Extract JSON
            // We use a simple JSON parsability check or custom extraction if needed
            // For now assume the content IS the JSON or contains it
            try {
                // Try full parse
                JSON.parse(jsonContent);
                matches.push(jsonContent);
                processedRanges.push([startPos, endPos + backtickCount + (content[endPos] === '\n' ? 1 : 0)]);
                foundEnd = true;
            } catch (e) {
                // Try extracting object if dirty
                const extracted = extractJsonObject(jsonContent);
                if (extracted) {
                    matches.push(extracted);
                    processedRanges.push([startPos, endPos + backtickCount]);
                    foundEnd = true;
                }
            }
        }
    }

    // Fallback: Match JSON objects directly: {"name": ...}
    if (matches.length === 0) {
        const namePattern = /\{"name"\s*:/g;
        let nameMatch;
        while ((nameMatch = namePattern.exec(content)) !== null) {
            const start = nameMatch.index;
            const extracted = extractJsonObject(content.substring(start));
            if (extracted) {
                matches.push(extracted);
            }
        }
    }

    matches.forEach((jsonStr, i) => {
        try {
            const callData = JSON.parse(jsonStr);
            if (callData.name) {
                tool_calls.push({
                    index: i,
                    id: `call_${uuidv4().substring(0, 8)}`,
                    type: "function",
                    function: {
                        name: callData.name,
                        arguments: JSON.stringify(callData.arguments || {})
                    }
                });
            }
        } catch (e) {
            console.log("[DEBUG] JSON parse error:", e.message);
        }
    });

    // Remove tool call sections from remaining content
    // Sort ranges descending to remove correctly
    processedRanges.sort((a, b) => b[0] - a[0]);
    for (const [start, end] of processedRanges) {
        remaining = remaining.substring(0, start) + remaining.substring(end);
    }

    return { tool_calls, remaining: remaining.trim() };
}


export { parseToolCalls };

