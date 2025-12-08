import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitTestimony = mutation({
    args: {
        eventId: v.optional(v.id("events")),
        name: v.string(),
        phoneNumber: v.optional(v.string()),
        date: v.string(),
        categories: v.array(v.string()),
        otherTestimony: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const testimonyId = await ctx.db.insert("testimonies", {
            ...args,
            createdBy: userId,
            createdAt: Date.now(),
        });

        return testimonyId;
    },
});

export const getTestimonies = query({
    args: {
        paginationOpts: paginationOptsValidator,
        searchTerm: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        let testimonies;

        // If search term is provided, we can't easily use pagination with search in Convex yet 
        // without a search index, but we didn't add one for name/content.
        // For now, we'll just return paginated results sorted by date.
        // Ideally we would add a search index if search is critical.

        testimonies = await ctx.db
            .query("testimonies")
            .order("desc")
            .paginate(args.paginationOpts);

        // Enrich with event details if needed, but for list view maybe not strictly necessary
        // to keep it fast. We can fetch event details on the client or enrich here.
        // Let's enrich here for better UI.

        const pageWithEvents = await Promise.all(
            testimonies.page.map(async (testimony) => {
                let event = null;
                if (testimony.eventId) {
                    event = await ctx.db.get(testimony.eventId);
                }
                return {
                    ...testimony,
                    event,
                };
            })
        );

        return {
            ...testimonies,
            page: pageWithEvents,
        };
    },
});

export const getTestimoniesByEvent = query({
    args: {
        eventId: v.id("events"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const testimonies = await ctx.db
            .query("testimonies")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .order("desc")
            .paginate(args.paginationOpts);

        return testimonies;
    },
});

export const deleteTestimony = mutation({
    args: { testimonyId: v.id("testimonies") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") {
            throw new Error("Unauthorized: Only admins can delete testimonies");
        }

        await ctx.db.delete(args.testimonyId);
    },
});
