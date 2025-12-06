"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categoryColors = {
  seminar: "bg-blue-100 text-blue-700",
  meeting: "bg-purple-100 text-purple-700",
  webinar: "bg-indigo-100 text-indigo-700",
  conference: "bg-orange-100 text-orange-700",
  training: "bg-emerald-100 text-emerald-700",
  other: "bg-gray-100 text-gray-700",
};

export default function EventsTodayWidget() {
  const { user } = useAuth();

  const dateRange = useMemo(() => {
    const now = Date.now();
    return {
      now,
      next24Hours: now + 24 * 60 * 60 * 1000,
    };
  }, []);

  const eventsData = useQuery(
    api.events.getByDateRange,
    user?.email
      ? {
          email: user.email,
          startDateTime: dateRange.now,
          endDateTime: dateRange.next24Hours,
          limit: 10,
        }
      : "skip"
  ) || [];

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "";
    const durationMs = end - start;
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));
    return `${durationHours}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rscm-violet/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-rscm-violet" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rscm-dark-purple">
              Next 24 Hours
            </h2>
            <p className="text-xs text-gray-500">
              Team out-of-office events
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {eventsData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-2">No events today</p>
            <p className="text-xs text-gray-400">
              All team members are available
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {eventsData.map((event) => (
              <div
                key={event._id}
                className="p-4 rounded-lg bg-gray-50 hover:bg-rscm-dutch-white/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-rscm-dark-purple truncate">
                      {event.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                      categoryColors[event.eventCategory] ||
                      categoryColors.other
                    }`}
                  >
                    {event.eventCategory
                      ?.charAt(0)
                      .toUpperCase() + event.eventCategory?.slice(1)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(event.startDateTime)} -{" "}
                    {formatTime(event.endDateTime)} (
                    {formatDuration(event.startDateTime, event.endDateTime)})
                  </p>
                  {event.location && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location}
                    </p>
                  )}
                  {event.attendeesList && event.attendeesList.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex -space-x-2">
                        {event.attendeesList.slice(0, 3).map((attendee) => (
                          <div
                            key={attendee._id}
                            className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0"
                            title={attendee.name}
                          >
                            {attendee.avatarUrl ? (
                              <Image
                                src={attendee.avatarUrl}
                                alt={attendee.name}
                                fill
                                sizes="24px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-600">
                                {attendee.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {event.attendeesList.length > 3 && (
                        <span className="text-xs text-gray-500">+{event.attendeesList.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/approvals?tab=events"
        className="px-6 py-3 border-t border-gray-100 flex items-center justify-between hover:bg-rscm-dutch-white/10 transition-colors group"
      >
        <span className="text-xs font-semibold text-rscm-violet">
          View all pending events
        </span>
        <ChevronRight
          size={14}
          className="text-rscm-violet group-hover:translate-x-0.5 transition-transform"
        />
      </Link>
    </div>
  );
}
