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

    // Fetch registrations for each event
    const eventIds = events.map(e => e._id);
    const allRegistrations = await Promise.all(
      eventIds.map(eventId =>
        ctx.db
          .query("eventRegistrations")
          .withIndex("by_event", q => q.eq("eventId", eventId))
          .collect()
      )
    );

    // Flatten registrations
    const registrations = allRegistrations.flat();
    const attendedRegistrations = registrations.filter(r => r.hasAttended);

    // Fetch attendee details for demographics
    // We need to fetch unique attendees to avoid double counting demographics if they attended multiple events?
    // Actually, for "Monthly Stats", if someone attended 2 events, they count as 2 registrations.
    // So their gender/type should probably count twice in the aggregate "who came this month" view.
    // But for "Top Residences", maybe we want unique people?
    // Let's stick to counting per registration for now as it reflects "traffic".

    // Optimization: Fetch all needed attendees
    const attendeeIds = [...new Set(registrations.map(r => r.attendeeId))];
    const attendees = await Promise.all(attendeeIds.map(id => ctx.db.get(id)));
    const attendeeMap = new Map(attendees.map(a => [a?._id, a]));

    const genderStats: Record<string, number> = {};
    const guestTypeStats: Record<string, number> = {};
    const locationStats: Record<string, number> = {};

    registrations.forEach(reg => {
      const attendee = attendeeMap.get(reg.attendeeId);
      if (attendee) {
        // Gender
        genderStats[attendee.gender] = (genderStats[attendee.gender] || 0) + 1;

        // Guest Type
        const type = attendee.isFirstTimeGuest ? 'firstTime' : 'returning';
        guestTypeStats[type] = (guestTypeStats[type] || 0) + 1;

        // Location
        if (attendee.placeOfResidence) {
          // Normalize location
          const loc = attendee.placeOfResidence.trim(); // Case sensitive? Or capitalize?
          // Let's keep it simple for now, maybe title case in UI
          locationStats[loc] = (locationStats[loc] || 0) + 1;
        }
      }
    });

    // Sort locations by count
    const topLocations = Object.entries(locationStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

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
        // We want to group by EVENT date or REGISTRATION date?
        // "Registration Trends" usually implies when they signed up.
        // But if we are looking at "Monthly Event Stats", maybe we want to see when people registered for THESE events?
        // The previous logic used registrationDate. Let's stick to that, but filtered by these events.
        acc[reg.registrationDate] = (acc[reg.registrationDate] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      genderStats,
      guestTypeStats,
      topLocations
    };
  },
});
