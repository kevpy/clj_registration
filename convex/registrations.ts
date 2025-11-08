import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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
      phoneNumber: v.string(),
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

    // Verify event exists and is active
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found or inactive");
    }

    let attendeeId: Id<"attendees">;

    if (args.useExistingAttendee && args.existingAttendeeId) {
      // Use existing attendee
      attendeeId = args.existingAttendeeId;
      
      // Check if already registered for this event
      const existingRegistration = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event_and_attendee", (q) => 
          q.eq("eventId", args.eventId).eq("attendeeId", args.existingAttendeeId!)
        )
        .unique();

      if (existingRegistration) {
        throw new Error("Attendee has already been registered for this event");
      }

      // Update attendee info if needed
      const existingAttendee = await ctx.db.get(args.existingAttendeeId);
      if (existingAttendee) {
        await ctx.db.patch(args.existingAttendeeId, {
          ...args.attendeeData,
          isFirstTimeGuest: args.isFirstTimeGuest,
        });
      }
    } else {
      // Create new attendee or find existing by phone
      const existingAttendee = await ctx.db
        .query("attendees")
        .withIndex("by_phone", (q) => q.eq("phoneNumber", args.attendeeData.phoneNumber))
        .unique();

      if (existingAttendee) {
        attendeeId = existingAttendee._id;
        
        // Check if already registered for this event
        const existingRegistration = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_event_and_attendee", (q) => 
            q.eq("eventId", args.eventId).eq("attendeeId", existingAttendee._id)
          )
          .unique();

        if (existingRegistration) {
          throw new Error("Attendee has already been registered for this event");
        }

        // Update attendee info and first-time status
        await ctx.db.patch(existingAttendee._id, {
          ...args.attendeeData,
          isFirstTimeGuest: args.isFirstTimeGuest,
        });
      } else {
        // Create new attendee
        attendeeId = await ctx.db.insert("attendees", {
          ...args.attendeeData,
          isFirstTimeGuest: args.isFirstTimeGuest,
          registeredBy: authUserId,
        });
      }
    }

    // Check event capacity
    if (event.maxCapacity) {
      const currentRegistrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();

      if (currentRegistrations.length >= event.maxCapacity) {
        throw new Error("Event has reached maximum capacity");
      }
    }

    // Create event registration with immediate attendance
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

    // If this is their first attendance ever, mark them as no longer first-time
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
      phoneNumber: v.string(),
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

export const getEventRegistrations = query({
  args: { 
    eventId: v.id("events"),
    attendedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let registrations;
    if (args.attendedOnly) {
      registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event_and_attendance", (q) => 
          q.eq("eventId", args.eventId).eq("hasAttended", true)
        )
        .collect();
    } else {
      registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
    }

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

    return registrationsWithAttendees;
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
