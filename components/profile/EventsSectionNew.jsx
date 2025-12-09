"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Edit2, Calendar, Clock, MapPin } from "lucide-react";
import EventFormModal from "./EventFormModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const categoryColors = {
  seminar: "bg-blue-100 text-blue-700",
  meeting: "bg-purple-100 text-purple-700",
  webinar: "bg-indigo-100 text-indigo-700",
  conference: "bg-orange-100 text-orange-700",
  training: "bg-emerald-100 text-emerald-700",
  other: "bg-gray-100 text-gray-700",
};

export default function EventsSectionNew({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useQuery(
    api.events.getByUser,
    user?.email && user?._id ? { email: user.email, userId: user._id } : "skip"
  ) || [];

  const deleteEventMutation = useMutation(api.events.deleteEvent);

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

  const handleOpenModal = (event = null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEventMutation({ email: user?.email, eventId });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const upcomingEvents = events.filter(
    (e) => new Date(e.startDateTime) > new Date()
  );
  const pastEvents = events.filter(
    (e) => new Date(e.startDateTime) <= new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-rscm-dark-purple">Events</h2>
          <p className="text-sm text-gray-500 mt-1">
            Log and manage your out-of-office activities
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-rscm-violet text-white rounded-lg hover:bg-rscm-plum transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Log Event
        </button>
      </div>

      {events === undefined ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner width={200} height={4} />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">No events logged yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Log your first event to keep your team informed about your schedule
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-rscm-dark-purple uppercase tracking-wide">
                Upcoming Events
              </h3>
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-rscm-dark-purple">
                            {event.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              categoryColors[event.eventCategory] ||
                              categoryColors.other
                            }`}
                          >
                            {event.eventCategory?.charAt(0).toUpperCase() +
                              event.eventCategory?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleOpenModal(event)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-rscm-violet"
                          title="Edit event"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
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
                            <p className="text-sm text-rscm-dark-purple mt-0.5">{event.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {event.notes && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-2">Notes</p>
                        <p className="text-sm text-rscm-dark-purple whitespace-pre-wrap">
                          {event.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-rscm-dark-purple uppercase tracking-wide">
                Past Events
              </h3>
              {pastEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden opacity-75"
                >
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-rscm-dark-purple">
                            {event.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              categoryColors[event.eventCategory] ||
                              categoryColors.other
                            }`}
                          >
                            {event.eventCategory?.charAt(0).toUpperCase() +
                              event.eventCategory?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-600 flex-shrink-0"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                          <p className="text-sm text-rscm-dark-purple mt-0.5">
                            {formatDate(event.startDateTime)} {formatTime(event.startDateTime)} -{" "}
                            {formatTime(event.endDateTime)}
                          </p>
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Location</p>
                            <p className="text-sm text-rscm-dark-purple mt-0.5">{event.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {}}
        initialEvent={selectedEvent}
      />
    </div>
  );
}
