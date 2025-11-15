import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const processExcelUpload = mutation({
  args: {
    excelData: v.array(v.object({
      name: v.string(),
      phone: v.optional(v.string()),
      location: v.optional(v.string()),
      isFirstTimeGuest: v.optional(v.boolean()),
    })),
    eventId: v.optional(v.id("events")), // Optional existing event ID
    newEventDetails: v.optional(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      date: v.string(),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      location: v.optional(v.string()),
      maxCapacity: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let eventId: Id<"events">;
    
    // Create new event if requested
    if (args.newEventDetails) {
      eventId = await ctx.db.insert("events", {
        ...args.newEventDetails,
        isActive: true,
        createdBy: userId,
      });
    } else if (args.eventId) {
      // Verify the existing event exists and is active
      const event = await ctx.db.get(args.eventId);
      if (!event || !event.isActive) {
        throw new Error("Event not found or inactive");
      }
      eventId = args.eventId;
    } else {
      throw new Error("Either an existing event ID or new event details must be provided");
    }

    // Process each attendee record
    const results = {
      createdAttendees: 0,
      updatedAttendees: 0,
      registrations: 0,
      errors: [] as string[],
    };

    const today = new Date().toISOString().split('T')[0];

    for (const row of args.excelData) {
      try {
        // Clean and validate data
        const name = row.name?.trim();
        const phoneNumber = row.phone?.trim() || "";
        const placeOfResidence = row.location?.trim() || "";

        if (!name || !phoneNumber) {
          results.errors.push(`Skipping row: name or phone number missing for ${name || 'unknown'}`);
          continue;
        }

        // Check if attendee already exists by phone number
        const existingAttendee = await ctx.db
          .query("attendees")
          .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
          .unique();

        let attendeeId: Id<"attendees">;

        if (existingAttendee) {
          // Update existing attendee
          await ctx.db.patch(existingAttendee._id, {
            name,
            placeOfResidence,
            phoneNumber,
            // Update isFirstTimeGuest if provided in the Excel data
            ...(row.isFirstTimeGuest !== undefined && { isFirstTimeGuest: row.isFirstTimeGuest }),
          });
          attendeeId = existingAttendee._id;
          results.updatedAttendees++;
        } else {
          // Create new attendee
          attendeeId = await ctx.db.insert("attendees", {
            name,
            placeOfResidence,
            phoneNumber,
            gender: "other", // Default value - could be derived from Excel if available
            isFirstTimeGuest: row.isFirstTimeGuest !== undefined ? row.isFirstTimeGuest : false, // Use Excel value or default to false (returnee)
            registeredBy: userId,
          });
          results.createdAttendees++;
        }

        // Check if already registered for this event
        const existingRegistration = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_event_and_attendee", (q) =>
            q.eq("eventId", eventId).eq("attendeeId", attendeeId)
          )
          .unique();

        if (!existingRegistration) {
          // Create event registration - default to checked in (hasAttended: true)
          await ctx.db.insert("eventRegistrations", {
            eventId,
            attendeeId,
            registrationDate: today,
            registrationTime: Date.now(),
            registeredBy: userId,
            hasAttended: true, // Default to checked in (attendance recorded)
            attendanceTime: Date.now(), // Record attendance time
          });
          results.registrations++;
        } else {
          results.errors.push(`Attendee ${name} is already registered for this event`);
        }
      } catch (error) {
        results.errors.push(`Error processing row for ${row.name}: ${(error as Error).message}`);
      }
    }

    return {
      eventId,
      ...results,
    };
  },
});