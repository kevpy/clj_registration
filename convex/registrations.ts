import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { checkEventCapacity, getOrCreateAttendee, checkRegistrationExists } from "./helpers";

export const searchAttendees = query({
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

export const getAttendeeByPhone = query({
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

// New function: Register attendee at the door (combines registration + attendance)
export const registerAttendeeAtDoor = mutation({
  args: {
    eventId: v.id("events"),
    attendeeData: v.object({
      name: v.string(),
      placeOfResidence: v.string(),
      phoneNumber: v.optional(v.string()),
      gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
      email: v.optional(v.string()),
    }),
    isFirstTimeGuest: v.boolean(),
    useExistingAttendee: v.optional(v.boolean()),
    existingAttendeeId: v.optional(v.id("attendees")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // 1. Verify event exists and check capacity
    await checkEventCapacity(ctx, args.eventId);

    // 2. Get or create attendee (and update their details)
    const attendeeId = await getOrCreateAttendee(ctx, {
      attendeeData: args.attendeeData,
      isFirstTimeGuest: args.isFirstTimeGuest,
      useExistingAttendee: args.useExistingAttendee,
      existingAttendeeId: args.existingAttendeeId,
      authUserId,
    });

    // 3. Check if already registered
    const isRegistered = await checkRegistrationExists(ctx, args.eventId, attendeeId);
    if (isRegistered) {
      throw new Error("Attendee has already been registered for this event");
    }

    // 4. Create event registration with immediate attendance
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();
    const registrationId = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      attendeeId: attendeeId,
      registrationDate: today,
      registrationTime: now,
      registeredBy: authUserId,
      hasAttended: true, // Automatically mark as attended since they're at the door
      attendanceTime: now, // Record attendance time as now
    });

    // 5. If this is their first attendance ever, mark them as no longer first-time
    // (This logic is slightly redundant with getOrCreateAttendee which sets isFirstTimeGuest based on input,
    // but we want to ensure they are marked as NOT first time AFTER this attendance)
    // Actually, getOrCreateAttendee sets it to what we passed.
    // If we passed isFirstTimeGuest=true, they are saved as true.
    // But now they have attended, so they should be false?
    // The original logic was: set to input value, then if they attend, set to false?
    // Original code: 
    // "If this is their first attendance ever, mark them as no longer first-time"
    // This implies we want to record that they CAME as a first timer, but for FUTURE they are not.
    // So we should leave it as is for now, or update it to false immediately?
    // The original code did: 
    // await ctx.db.patch(attendeeId, { isFirstTimeGuest: false });
    // AFTER inserting registration.

    const attendeeRecord = await ctx.db.get(attendeeId);
    if (attendeeRecord && attendeeRecord.isFirstTimeGuest) {
      await ctx.db.patch(attendeeId, {
        isFirstTimeGuest: false,
      });
    }

    return registrationId;
  },
});

// Keep the old function for backward compatibility but mark as deprecated
export const registerAttendeeForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeeData: v.object({
      name: v.string(),
      placeOfResidence: v.string(),
      phoneNumber: v.optional(v.string()),
      gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
      email: v.optional(v.string()),
    }),
    isFirstTimeGuest: v.boolean(),
    useExistingAttendee: v.optional(v.boolean()),
    existingAttendeeId: v.optional(v.id("attendees")),
  },
  handler: async (ctx, args) => {
    throw new Error("Pre-registration is no longer supported. Use door registration instead.");
  },
});

export const recordAttendance = mutation({
  args: {
    eventId: v.id("events"),
    attendeeId: v.id("attendees"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Find the registration
    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event_and_attendee", (q) =>
        q.eq("eventId", args.eventId).eq("attendeeId", args.attendeeId)
      )
      .unique();

    if (!registration) {
      throw new Error("Attendee is not registered for this event");
    }

    if (registration.hasAttended) {
      throw new Error("Attendance already recorded for this attendee");
    }

    // Update registration to mark attendance
    await ctx.db.patch(registration._id, {
      hasAttended: true,
      attendanceTime: Date.now(),
    });

    // If this is their first attendance ever, mark them as no longer first-time
    const attendee = await ctx.db.get(args.attendeeId);
    if (attendee && attendee.isFirstTimeGuest) {
      await ctx.db.patch(args.attendeeId, {
        isFirstTimeGuest: false,
      });
    }

    return { success: true };
  },
});

export const updateAttendee = mutation({
  args: {
    attendeeId: v.id("attendees"),
    updates: v.object({
      name: v.optional(v.string()),
      placeOfResidence: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
      isFirstTimeGuest: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.attendeeId, args.updates);
  },
});

export const getEventRegistrations = query({
  args: {
    eventId: v.id("events"),
    attendedOnly: v.optional(v.boolean()),
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.searchTerm) {
      // Search implementation
      const attendees = await ctx.db
        .query("attendees")
        .withSearchIndex("search_attendees", (q) =>
          q.search("name", args.searchTerm!)
        )
        .take(20);

      const attendeeIds = attendees.map((a) => a._id);

      // Fetch registrations for these attendees and this event
      const registrations = await Promise.all(
        attendeeIds.map(async (attendeeId) => {
          const registration = await ctx.db
            .query("eventRegistrations")
            .withIndex("by_event_and_attendee", (q) =>
              q.eq("eventId", args.eventId).eq("attendeeId", attendeeId)
            )
            .unique();
          return registration;
        })
      );

      // Filter out nulls (attendees not registered for this event) and apply attendedOnly filter if needed
      const validRegistrations = registrations.filter((r) => {
        if (!r) return false;
        if (args.attendedOnly && !r.hasAttended) return false;
        return true;
      });

      // Map to include attendee details (we already have them, but to keep structure consistent)
      const pageWithAttendees = validRegistrations.map((r) => {
        const attendee = attendees.find((a) => a._id === r!.attendeeId);
        return {
          ...r!,
          attendee,
        };
      });

      return {
        page: pageWithAttendees,
        isDone: true,
        continueCursor: "",
      };
    }

    let registrations;
    if (args.attendedOnly) {
      registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event_and_attendance", (q) =>
          q.eq("eventId", args.eventId).eq("hasAttended", true)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Get attendee details
    const pageWithAttendees = await Promise.all(
      registrations.page.map(async (registration) => {
        const attendee = await ctx.db.get(registration.attendeeId);
        return {
          ...registration,
          attendee,
        };
      })
    );

    return {
      ...registrations,
      page: pageWithAttendees,
    };
  },
});

export const getAttendeeHistory = query({
  args: { attendeeId: v.id("attendees") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attendee = await ctx.db.get(args.attendeeId);
    if (!attendee) {
      return null;
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_attendee", (q) => q.eq("attendeeId", args.attendeeId))
      .collect();

    // Get event details for each registration
    const registrationsWithEvents = await Promise.all(
      registrations.map(async (registration) => {
        const event = await ctx.db.get(registration.eventId);
        return {
          ...registration,
          event,
        };
      })
    );

    return {
      attendee,
      registrations: registrationsWithEvents,
      totalEvents: registrations.length,
      attendedEvents: registrations.filter(r => r.hasAttended).length,
    };
  },
});
