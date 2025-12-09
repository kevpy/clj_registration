import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const stats = useQuery(api.analytics.getDashboardStats);

  // Get local date in YYYY-MM-DD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const upcomingEvents = useQuery(api.events.getUpcomingEvents, { currentDate: today });

  if (!stats || !upcomingEvents) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      subtitle: `${stats.activeEvents} active`,
      icon: "🎉",
      color: "bg-primary-500",
    },
    {
      title: "Total Attendees",
      value: stats.totalAttendees,
      subtitle: "Unique people",
      icon: "👥",
      color: "bg-green-500",
    },
    {
      title: "Total Registrations",
      value: stats.totalRegistrations,
      subtitle: "All events",
      icon: "📝",
      color: "bg-purple-500",
    },
    {
      title: "Today's Activity",
      value: stats.todaysRegistrations,
      subtitle: `${stats.todaysAttendance} attended`,
      icon: "📅",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-full text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current / Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                      {event.startTime && ` at ${event.startTime}`}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500">{event.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {event.date === today ? 'Today' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Demographics</h3>
          {Object.keys(stats.genderStats).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendee data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.genderStats).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{gender}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalAttendees) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
