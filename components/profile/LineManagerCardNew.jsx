"use client";
import Image from "next/image";
import { User, Mail, Phone, MessageCircle, UserCheck } from "lucide-react";

const LineManagerCardNew = ({ lineManager, user }) => {
  // If no line manager data, show a fallback
  const hasManager = lineManager && lineManager._id;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rscm-lilac/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-rscm-lilac" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rscm-dark-purple">
              Line Manager
            </h2>
            <p className="text-xs text-gray-500">
              Your direct reporting manager
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!hasManager ? (
          <div className="text-center py-8">
            <User size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-1">No line manager assigned</p>
            <p className="text-xs text-gray-400">
              Contact HR to assign a line manager
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Manager Avatar and Name */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center flex-shrink-0">
                {lineManager.avatarUrl ? (
                  <Image
                    src={lineManager.avatarUrl}
                    alt={lineManager.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {lineManager.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-base text-rscm-dark-purple">
                  {lineManager.name}
                </h3>
                {lineManager.role && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {lineManager.role === "line_manager" ? "Line Manager" : lineManager.role}
                  </p>
                )}
                {lineManager.department && (
                  <p className="text-xs text-gray-400 mt-1">
                    {lineManager.department}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {lineManager.email && (
                <div className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${lineManager.email}`}
                    className="text-sm text-rscm-dark-purple group-hover:text-rscm-violet transition-colors"
                  >
                    {lineManager.email}
                  </a>
                </div>
              )}
              
              {lineManager.phone && (
                <div className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <a 
                    href={`tel:${lineManager.phone}`}
                    className="text-sm text-rscm-dark-purple group-hover:text-rscm-violet transition-colors"
                  >
                    {lineManager.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineManagerCardNew;
