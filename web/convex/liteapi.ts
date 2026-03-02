import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const LITEAPI_URL = "https://api.liteapi.travel/v3.0";

// Helper to access LITEAPI_KEY
function getLiteApiKey() {
    return process.env.LITEAPI_KEY || "";
}

// ── Search Hotels (Action) ───────────────────────────────────

export const searchHotels = action({
    args: {
        destination: v.string(),
        country: v.string(),
        checkin: v.string(),
        checkout: v.string(),
        guests: v.number(),
    },
    handler: async (_ctx, args) => {
        const apiKey = getLiteApiKey();
        if (!apiKey) {
            throw new Error("LITEAPI_KEY environment variable is not set");
        }

        const payload = {
            countryCode: args.country,
            cityName: args.destination,
            checkin: args.checkin,
            checkout: args.checkout,
            occupancies: [
                {
                    adults: args.guests,
                }
            ],
            // Request some basic details along with rates
            // In a real app we might paginate or filter
            limit: 20
        };

        const res = await fetch(`${LITEAPI_URL}/rates`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`LiteAPI search failed (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        return data; // returns the LiteAPI rates response
    },
});

export const prebookHotel = action({
    args: {
        rateId: v.string(),
    },
    handler: async (_ctx, args) => {
        const apiKey = getLiteApiKey();
        const payload = { rateId: args.rateId };

        const res = await fetch(`${LITEAPI_URL}/rates/prebook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`LiteAPI prebook failed (${res.status}): ${errorText}`);
        }

        return await res.json();
    }
});

export const bookHotel = action({
    args: {
        prebookId: v.string(),
        hotelId: v.string(),
        hotelName: v.string(),
        checkin: v.string(),
        checkout: v.string(),
        guests: v.number(),
        totalAmount: v.number(),
        currency: v.string(),

        // Hardcoding guest details for demo purposes 
        // Real app would take these as arguments
        guestFirstName: v.string(),
        guestLastName: v.string(),
        guestEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = getLiteApiKey();

        // In the real app, user identity should be verified
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Get user from our db
        const user = await ctx.runQuery(internal.users.getProfileByUserId, {
            userId: identity.subject
        });

        if (!user) {
            throw new Error("User not found");
        }

        const payload = {
            prebookId: args.prebookId,
            guestDetails: [
                {
                    adults: args.guests,
                    children: 0,
                    emails: [args.guestEmail],
                    names: [
                        {
                            firstName: args.guestFirstName,
                            lastName: args.guestLastName,
                            title: "MR"
                        }
                    ]
                }
            ],
            payment: {
                method: "CREDIT_CARD",
            },
            // Note: In test environment, the actual booking completes with a mocked payment
        };

        const res = await fetch(`${LITEAPI_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`LiteAPI book failed (${res.status}): ${errorText}`);
        }

        const bookingData = await res.json();

        // Save the booking to our database
        await ctx.runMutation(internal.liteapi.saveBooking, {
            userId: user._id,
            prebookId: args.prebookId,
            bookingId: bookingData.data?.bookingId || null,
            hotelId: args.hotelId,
            hotelName: args.hotelName,
            checkin: args.checkin,
            checkout: args.checkout,
            guests: args.guests,
            status: bookingData.data?.bookingId ? "confirmed" : "prebooked",
            totalAmount: args.totalAmount,
            currency: args.currency,
        });

        return bookingData;
    }
});

// ── Internal Mutations ──────────────────────────────────────────

export const saveBooking = internalMutation({
    args: {
        userId: v.id("userProfiles"),
        prebookId: v.string(),
        bookingId: v.optional(v.string()),
        hotelId: v.string(),
        hotelName: v.string(),
        checkin: v.string(),
        checkout: v.string(),
        guests: v.number(),
        status: v.union(v.literal("prebooked"), v.literal("confirmed"), v.literal("cancelled"), v.literal("failed")),
        totalAmount: v.number(),
        currency: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("bookings", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }
});

export const getBookings = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("bookings")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    }
});
