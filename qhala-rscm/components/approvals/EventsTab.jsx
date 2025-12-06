"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CheckCircle, Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function EventsTab({ user }) {
  const { data: session } = useSession();
  const [processingEventId, setProcessingEventId] = useState(null);

  const pendingEvents = useQuery(
    api.events.getPendingAcknowledgment,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const acknowledgeEvent = useMutation(api.events.acknowledgeEvent);

  const loading = pendingEvents === undefined;

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
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

  const handleAcknowledge = async (eventId) => {
    setProcessingEventId(eventId);
    try {
      await acknowledgeEvent({
        email: session.user.email,
        eventId,
      });
      toast.success("Event acknowledged");
    } catch (error) {
      console.error("Error acknowledging event:", error);
      toast.error(error.message || "Failed to acknowledge event");
    } finally {
      setProcessingEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (!pendingEvents || pendingEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-gray-100">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-rscm-dark-purple">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">
              No pending events to acknowledge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingEvents.map((event) => {
        const isThisEventProcessing = processingEventId === event._id;

        return (
          <div
            key={event._id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar size={18} className="text-gray-400" />
                  <h3 className="font-semibold text-rscm-dark-purple">
                    {event.title}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700">
                    {event.eventCategory?.charAt(0).toUpperCase() +
                      event.eventCategory?.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                By:{" "}
                <span className="font-medium text-rscm-dark-purple">
                  {event.user?.name || "Unknown"}
                </span>
              </p>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                    <p className="text-sm text-rscm-dark-purple mt-0.5">
                      {formatDate(event.startDateTime)} {formatTime(event.startDateTime)} -{" "}
                      {formatTime(event.endDateTime)} ({formatDuration(event.startDateTime, event.endDateTime)})
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm text-rscm-dark-purple mt-0.5">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {event.attendeesList && event.attendeesList.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={16} className="text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">Attendees:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.attendeesList.map((attendee) => (
                      <div
                        key={attendee._id}
                        className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-full"
                      >
                        {attendee.avatarUrl && (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={attendee.avatarUrl}
                              alt={attendee.name}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-rscm-dark-purple">
                          {attendee.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
                  <p className="text-sm text-rscm-dark-purple whitespace-pre-wrap">
                    {event.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleAcknowledge(event._id)}
                  disabled={isThisEventProcessing}
                  isLoading={isThisEventProcessing}
                >
                  <CheckCircle size={16} className="mr-1.5" /> Acknowledge
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
