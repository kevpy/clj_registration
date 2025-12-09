import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkRole } from "./helpers";

export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    await checkRole(ctx, userId, "admin");

    const eventId = await ctx.db.insert("events", {
      ...args,
      isActive: true,
      createdBy: userId,
    });

    return eventId;
  },
});

export const getAllEvents = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let events;
    if (args.includeInactive) {
      events = await ctx.db.query("events").order("desc").collect();
    } else {
      events = await ctx.db
        .query("events")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("desc")
        .collect();
    }

    // Get registration counts for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const attendedCount = registrations.filter(r => r.hasAttended).length;

        return {
          ...event,
          registrationCount: registrations.length,
          attendedCount,
        };
      })
    );

    return eventsWithStats;
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    // Get registrations for this event
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get attendee details
    const registrationsWithAttendees = await Promise.all(
      registrations.map(async (registration) => {
        const attendee = await ctx.db.get(registration.attendeeId);
        return {
          ...registration,
          attendee,
        };
      })
    );

    return {
      ...event,
      registrations: registrationsWithAttendees,
      registrationCount: registrations.length,
      attendedCount: registrations.filter(r => r.hasAttended).length,
    };
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    await checkRole(ctx, userId, "admin");

    const { eventId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(eventId, cleanUpdates);
    return { success: true };
  },
});

export const getUpcomingEvents = query({
  args: { currentDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const today = args.currentDate || new Date().toISOString().split('T')[0];

    const events = await ctx.db
      .query("events")
      .withIndex("by_date_and_active", (q) => q.gte("date", today))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(10);

    return events;
  },
});
