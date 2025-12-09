import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function maskPhoneNumber(phone: string | undefined): string {
    if (!phone) return "-";
    // "3rd to 6th last digits of the phone number be masked"
    // Example: 0712345678 (10 digits)
    // Last 6 digits: 345678
    // 3rd to 6th last: 3456
    // Result: 0712****78

    const len = phone.length;
    if (len < 6) return phone; // Too short to mask as requested

    // We want to mask characters at indices: len-6, len-5, len-4, len-3
    // (1-based from end: 6th, 5th, 4th, 3rd)

    const startMaskIndex = len - 6;
    const endMaskIndex = len - 2; // Up to but not including 2nd last (so we keep last 2)

    // Wait, "3rd to 6th last digits"
    // 1st last: index len-1
    // 2nd last: index len-2
    // 3rd last: index len-3  <-- Mask start (from right)
    // ...
    // 6th last: index len-6  <-- Mask end (from right)

    // So we mask from index (len-6) up to (len-2) exclusive?
    // Let's trace:
    // Phone: 0123456789 (10 chars, indices 0-9)
    // 1st last: 9 (idx 9)
    // 2nd last: 8 (idx 8)
    // 3rd last: 7 (idx 7) -> MASK
    // 4th last: 6 (idx 6) -> MASK
    // 5th last: 5 (idx 5) -> MASK
    // 6th last: 4 (idx 4) -> MASK
    // 7th last: 3 (idx 3) -> KEEP

    // So we mask indices 4, 5, 6, 7.
    // Prefix: 0..3 (0123)
    // Suffix: 8..9 (89)

    const prefix = phone.substring(0, len - 6);
    const suffix = phone.substring(len - 2);
    return `${prefix}****${suffix}`;
}

export const generateShareableLink = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Generate a random token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Set expiration to 24 hours from now
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

        await ctx.db.insert("shareableLinks", {
            token,
            eventId: args.eventId,
            expiresAt,
            createdBy: userId,
        });

        return token;
    },
});

export const getSharedReport = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const link = await ctx.db
            .query("shareableLinks")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!link) {
            throw new Error("Invalid or expired link");
        }

        if (Date.now() > link.expiresAt) {
            throw new Error("Link has expired");
        }

        const event = await ctx.db.get(link.eventId);
        if (!event) {
            throw new Error("Event not found");
        }

        const registrations = await ctx.db
            .query("eventRegistrations")
            .withIndex("by_event", (q) => q.eq("eventId", link.eventId))
            .collect();

        const attendees = await Promise.all(
            registrations.map(async (r) => {
                const attendee = await ctx.db.get(r.attendeeId);
                return {
                    ...attendee,
                    registration: r,
                };
            })
        );

        const validAttendees = attendees.filter((a) => a.name !== undefined);

        const firstTimeGuests = validAttendees
            .filter((a) => a.isFirstTimeGuest)
            .map((a) => ({
                name: a.name!,
                phone: a.phoneNumber || "-",
                residence: a.placeOfResidence || "-",
            }));

        const returningGuests = validAttendees
            .filter((a) => !a.isFirstTimeGuest)
            .map((a) => ({
                name: a.name!,
                phone: a.phoneNumber || "-",
                residence: a.placeOfResidence || "-",
            }));

        return {
            eventName: event.name,
            eventDate: event.date,
            firstTimeGuests,
            returningGuests,
        };
    },
});
