import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Legacy functions for backward compatibility
export const searchUsers = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.searchTerm.trim()) {
      return [];
    }

    const attendees = await ctx.db
      .query("attendees")
      .withSearchIndex("search_attendees", (q) =>
        q.search("name", args.searchTerm)
      )
      .take(args.limit ?? 10);

    return attendees;
  },
});

export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attendee = await ctx.db
      .query("attendees")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .unique();

    return attendee;
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("attendees").collect();
  },
});

// Deprecated - use event-based registration
export const registerUser = mutation({
  args: {
    name: v.string(),
    placeOfResidence: v.string(),
    phoneNumber: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    isFirstTimeGuest: v.boolean(),
  },
  handler: async (ctx, args) => {
    throw new Error("Deprecated. Use event-based registration.");
  },
});

export const recordAttendance = mutation({
  args: { userId: v.id("attendees") },
  handler: async (ctx, args) => {
    throw new Error("Deprecated. Use event-based attendance.");
  },
});

export const getUserWithAttendance = query({
  args: { userId: v.id("attendees") },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const attendee = await ctx.db.get(args.userId);
    if (!attendee) {
      return null;
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_attendee", (q) => q.eq("attendeeId", args.userId))
      .collect();

    return {
      ...attendee,
      attendanceCount: registrations.filter(r => r.hasAttended).length,
      lastAttendance: registrations.length > 0 
        ? Math.max(...registrations.map(r => r.registrationTime))
        : null,
    };
  },
});
