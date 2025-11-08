import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const events = await ctx.db.query("events").collect();
    const attendees = await ctx.db.query("attendees").collect();
    const registrations = await ctx.db.query("eventRegistrations").collect();

    const today = new Date().toISOString().split('T')[0];
    const activeEvents = events.filter(e => e.isActive);
    const todaysEvents = events.filter(e => e.date === today && e.isActive);
    const todaysRegistrations = registrations.filter(r => r.registrationDate === today);
    const todaysAttendance = registrations.filter(r => r.hasAttended && 
      new Date(r.attendanceTime || 0).toISOString().split('T')[0] === today);

    // Gender distribution
    const genderStats = attendees.reduce((acc, attendee) => {
      acc[attendee.gender] = (acc[attendee.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      todaysEvents: todaysEvents.length,
      totalAttendees: attendees.length,
      totalRegistrations: registrations.length,
      todaysRegistrations: todaysRegistrations.length,
      todaysAttendance: todaysAttendance.length,
      genderStats,
    };
  },
});

export const getEventAnalytics = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get attendee details for demographic analysis
    const attendees = await Promise.all(
      registrations.map(r => ctx.db.get(r.attendeeId))
    );
    const validAttendees = attendees.filter(a => a !== null);

    const demographics = {
      gender: validAttendees.reduce((acc, attendee) => {
        acc[attendee.gender] = (acc[attendee.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      guestType: validAttendees.reduce((acc, attendee) => {
        const type = attendee.isFirstTimeGuest ? 'firstTime' : 'returning';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const attendedCount = registrations.filter(r => r.hasAttended).length;
    const attendanceRate = registrations.length > 0 ? (attendedCount / registrations.length) * 100 : 0;

    return {
      event,
      totalRegistrations: registrations.length,
      attendedCount,
      attendanceRate: Math.round(attendanceRate),
      demographics,
      registrationsByDate: registrations.reduce((acc, reg) => {
        acc[reg.registrationDate] = (acc[reg.registrationDate] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});

export const getMonthlyEventStats = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const startDate = `${args.year}-${String(args.month).padStart(2, '0')}-01`;
    const endDate = `${args.year}-${String(args.month).padStart(2, '0')}-31`;

    const events = await ctx.db
      .query("events")
      .withIndex("by_date")
      .filter((q) => q.and(
        q.gte(q.field("date"), startDate),
        q.lte(q.field("date"), endDate)
      ))
      .collect();

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_registration_date")
      .filter((q) => q.and(
        q.gte(q.field("registrationDate"), startDate),
        q.lte(q.field("registrationDate"), endDate)
      ))
      .collect();

    const attendedRegistrations = registrations.filter(r => r.hasAttended);

    return {
      totalEvents: events.length,
      totalRegistrations: registrations.length,
      totalAttendance: attendedRegistrations.length,
      averageAttendanceRate: registrations.length > 0 
        ? Math.round((attendedRegistrations.length / registrations.length) * 100)
        : 0,
      eventsByDate: events.reduce((acc, event) => {
        acc[event.date] = (acc[event.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      registrationsByDate: registrations.reduce((acc, reg) => {
        acc[reg.registrationDate] = (acc[reg.registrationDate] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});
