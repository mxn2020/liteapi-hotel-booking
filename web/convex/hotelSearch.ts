import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const searchWithAI = action({
    args: {
        query: v.string(), // The natural language query from the user
    },
    handler: async (ctx, args) => {
        // 1. Fetch the parsing prompt
        const systemPrompt = await ctx.runQuery(internal.prompts.getPromptContent, {
            promptId: "liteapi_search_system",
        });

        if (!systemPrompt) {
            throw new Error("Missing liteapi_search_system prompt");
        }

        const completionResult: any = await ctx.runAction(api.nvidia.callModel, {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: args.query }
            ],
            model: "meta/llama-3.3-70b-instruct", // Typical fast model
            temperature: 0.1, // Low temp for parse extraction
        });

        const parsedContent = completionResult;

        // 3. Parse the JSON Output
        let searchParams;
        try {
            // Find the JSON block if the model included extra text
            const jsonMatch = parsedContent.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : parsedContent;
            searchParams = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse JSON from AI", parsedContent);
            throw new Error("AI failed to extract valid search parameters");
        }

        // 4. Call LiteAPI
        // We'll call the liteapi.ts searchHotels action. 
        // We can do it via runAction or calling the function directly.
        // It's cleaner to just runAction.
        const liteApiParams = {
            destination: searchParams.destination || "London",
            country: searchParams.country || "GB",
            checkin: searchParams.checkin, // Need a date default logic if missed
            checkout: searchParams.checkout,
            guests: searchParams.guests || 2,
        };

        // Date fallbacks
        if (!liteApiParams.checkin) {
            const tmrw = new Date();
            tmrw.setDate(tmrw.getDate() + 1);
            liteApiParams.checkin = tmrw.toISOString().split('T')[0];
        }
        if (!liteApiParams.checkout) {
            const next = new Date(liteApiParams.checkin);
            next.setDate(next.getDate() + 1);
            liteApiParams.checkout = next.toISOString().split('T')[0];
        }

        const stats = {
            extractedParams: liteApiParams,
        }

        try {
            const rates: any = await ctx.runAction(api.liteapi.searchHotels, liteApiParams);
            return {
                stats,
                rates
            };
        } catch (e: any) {
            throw new Error("Failed to get hotel rates: " + e.message);
        }
    },
});
