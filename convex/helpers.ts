import { MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function checkEventCapacity(ctx: MutationCtx | QueryCtx, eventId: Id<"events">) {
    const event = await ctx.db.get(eventId);
    if (!event || !event.isActive) {
        throw new Error("Event not found or inactive");
    }

    if (event.maxCapacity) {
        const currentRegistrations = await ctx.db
            .query("eventRegistrations")
            .withIndex("by_event", (q) => q.eq("eventId", eventId))
            .collect();

        if (currentRegistrations.length >= event.maxCapacity) {
            throw new Error("Event has reached maximum capacity");
        }
    }

    return event;
}

export async function getOrCreateAttendee(
    ctx: MutationCtx,
    args: {
        attendeeData: {
            name: string;
            placeOfResidence?: string;
            phoneNumber?: string;
            gender: "male" | "female" | "other";
            email?: string;
        };
        isFirstTimeGuest: boolean;
        useExistingAttendee?: boolean;
        existingAttendeeId?: Id<"attendees">;
        authUserId: Id<"users">;
    }
) {
    let attendeeId: Id<"attendees">;

    if (args.useExistingAttendee && args.existingAttendeeId) {
        // Use existing attendee
        attendeeId = args.existingAttendeeId;

        // Update attendee info if needed
        const existingAttendee = await ctx.db.get(args.existingAttendeeId);
        if (existingAttendee) {
            await ctx.db.patch(args.existingAttendeeId, {
                ...args.attendeeData,
                isFirstTimeGuest: args.isFirstTimeGuest,
            });
        }
    } else {
        // Try to find existing attendee
        let existingAttendee = null;

        // 1. Try by phone number if provided
        if (args.attendeeData.phoneNumber) {
            existingAttendee = await ctx.db
                .query("attendees")
                .withIndex("by_phone", (q) => q.eq("phoneNumber", args.attendeeData.phoneNumber!))
                .unique();
        }

        // 2. If not found by phone (or no phone), try by Name + Location (if location provided)
        if (!existingAttendee && args.attendeeData.placeOfResidence) {
            const candidates = await ctx.db
                .query("attendees")
                .withIndex("by_name", (q) => q.eq("name", args.attendeeData.name))
                .collect();

            // Filter by location (case-insensitive)
            const locationToMatch = args.attendeeData.placeOfResidence.toLowerCase().trim();
            existingAttendee = candidates.find(c =>
                c.placeOfResidence?.toLowerCase().trim() === locationToMatch
            ) || null;
        }

        if (existingAttendee) {
            attendeeId = existingAttendee._id;

            // Update attendee info and first-time status
            // Only update phone if the new data has it and the old one didn't, or if we want to overwrite?
            // Let's overwrite for now to keep data fresh.
            await ctx.db.patch(existingAttendee._id, {
                ...args.attendeeData,
                isFirstTimeGuest: args.isFirstTimeGuest,
            });
        } else {
            // Create new attendee
            attendeeId = await ctx.db.insert("attendees", {
                ...args.attendeeData,
                isFirstTimeGuest: args.isFirstTimeGuest,
                registeredBy: args.authUserId,
            });
        }
    }

    return attendeeId;
}

export async function checkRegistrationExists(
    ctx: QueryCtx,
    eventId: Id<"events">,
    attendeeId: Id<"attendees">
) {
    const existingRegistration = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_event_and_attendee", (q) =>
            q.eq("eventId", eventId).eq("attendeeId", attendeeId)
        )
        .unique();

    return !!existingRegistration;
}

export async function checkRole(
    ctx: QueryCtx | MutationCtx,
    userId: Id<"users">,
    requiredRole: "admin" | "user"
) {
    const user = await ctx.db.get(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Admins can do everything
    if (user.role === "admin") {
        return true;
    }

    if (user.role !== requiredRole) {
        throw new Error(`Unauthorized: Requires ${requiredRole} role`);
    }

    return true;
}
