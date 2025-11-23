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
            placeOfResidence: string;
            phoneNumber: string;
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
        // Create new attendee or find existing by phone
        const existingAttendee = await ctx.db
            .query("attendees")
            .withIndex("by_phone", (q) => q.eq("phoneNumber", args.attendeeData.phoneNumber))
            .unique();

        if (existingAttendee) {
            attendeeId = existingAttendee._id;

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
