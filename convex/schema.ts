import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Events that can be attended
  events: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD format
    startTime: v.optional(v.string()), // HH:MM format
    endTime: v.optional(v.string()), // HH:MM format
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    isActive: v.boolean(),
    createdBy: v.id("users"), // Auth user who created the event
  })
    .index("by_date", ["date"])
    .index("by_active", ["isActive"])
    .index("by_date_and_active", ["date", "isActive"]),

  // Registered attendees/guests (separate from auth users)
  attendees: defineTable({
    name: v.string(),
    placeOfResidence: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    email: v.optional(v.string()),
    isFirstTimeGuest: v.boolean(), // Per-attendee basis - true if they've never attended before
    registeredBy: v.id("users"), // Auth user who registered this person
  })
    .index("by_name", ["name"])
    .index("by_phone", ["phoneNumber"])
    .searchIndex("search_attendees", {
      searchField: "name",
      filterFields: ["placeOfResidence", "gender"],
    }),

  // Event registrations - links attendees to specific events
  eventRegistrations: defineTable({
    eventId: v.id("events"),
    attendeeId: v.id("attendees"),
    registrationDate: v.string(), // YYYY-MM-DD format
    registrationTime: v.number(), // timestamp
    registeredBy: v.id("users"), // Auth user who registered this attendee for this event
    hasAttended: v.boolean(), // Whether they actually showed up
    attendanceTime: v.optional(v.number()), // When they checked in
  })
    .index("by_event", ["eventId"])
    .index("by_attendee", ["attendeeId"])
    .index("by_event_and_attendee", ["eventId", "attendeeId"])
    .index("by_registration_date", ["registrationDate"])
    .index("by_event_and_attendance", ["eventId", "hasAttended"]),
};

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  }).index("email", ["email"]),
  ...applicationTables,
});
