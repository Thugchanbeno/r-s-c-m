"use client";
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";

const WorkRequestsSectionNew = ({ 
  requests = [],
  onRequestLeave,
  onRequestOvertime 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-rscm-violet/10 text-rscm-violet border-rscm-violet/30";
      case "rejected":
        return "bg-rscm-plum/10 text-rscm-plum border-rscm-plum/30";
      case "pending":
      case "pending_lm":
      case "pending_hr":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      case "pending":
      case "pending_lm":
      case "pending_hr":
        return <Clock size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      pending_lm: "Pending LM",
      pending_hr: "Pending HR",
    };
    return labels[status] || status;
  };

  const getRequestTypeLabel = (type) => {
    const types = {
      leave: "Leave Request",
      overtime: "Overtime Request",
      annual_leave: "Annual Leave",
      sick_leave: "Sick Leave",
      comp_day: "Comp Day",
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rscm-plum/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-rscm-plum" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rscm-dark-purple">
              Work Requests
            </h2>
            <p className="text-xs text-gray-500">
              Leave and overtime request history
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRequestLeave}
            className="px-3 py-2 text-sm font-medium text-rscm-violet hover:bg-rscm-violet hover:text-white border border-rscm-violet rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={14} />
            Request Leave
          </button>
          <button
            onClick={onRequestOvertime}
            className="px-3 py-2 text-sm font-medium text-rscm-plum hover:bg-rscm-plum hover:text-white border border-rscm-plum rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={14} />
            Log Overtime
          </button>
        </div>
      </div>

      <div className="p-6">
        {!requests || requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-2">No work requests yet</p>
            <p className="text-xs text-gray-400">
              Submit leave or overtime requests using the buttons above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="p-4 rounded-lg bg-gray-50 hover:bg-rscm-dutch-white/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-rscm-dark-purple">
                        {getRequestTypeLabel(request.requestType || request.type)}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-xs text-gray-500 mt-1">
                        {request.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {request.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(request.startDate)}
                      {request.endDate && ` - ${formatDate(request.endDate)}`}
                    </span>
                  )}
                  {request.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {request.duration} {request.durationType || 'days'}
                    </span>
                  )}
                  {request.overtimeHours && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {request.overtimeHours} hours
                    </span>
                  )}
                </div>

                {(request.lineManagerNotes || request.hrNotes) && (
                  <div className="mt-3 pt-3">
                    {request.lineManagerNotes && (
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">LM Note:</span> {request.lineManagerNotes}
                      </p>
                    )}
                    {request.hrNotes && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">HR Note:</span> {request.hrNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkRequestsSectionNew;
