"use client";
import { useState, useEffect } from "react";
import { FileText, Calendar, Search, ExternalLink } from "lucide-react";

export default function CachedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cv");
      const data = await res.json();
      if (data.success) {
        setCvs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch CVs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#3d2346]">CV Library</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {cvs.length} Files
        </span>
      </div>

      <div className="p-3 bg-gray-50 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cached CVs..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3d2346]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Loading...
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No CVs found in cache
          </div>
        ) : (
          cvs.map((cv) => (
            <div
              key={cv._id}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {cv.fileName || "Untitled.pdf"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(cv._creationTime).toLocaleDateString()}
                  </div>
                  {cv.processed && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full">
                      Processed
                    </span>
                  )}
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-[#3d2346] opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
