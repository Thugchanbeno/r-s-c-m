"use client";
import { useState } from "react";
import { Search, Loader2, UserPlus, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TalentPool({ selectedId, onSelect, onAddNew }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTalent = useAction(api.api.searchTalent);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchTalent({ query });
      setResults(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Candidate Queue
          </h2>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a2545] text-white rounded-lg text-xs font-bold hover:bg-[#251323] transition-colors shadow-sm"
          >
            <UserPlus size={14} /> New
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border-none rounded-lg focus:bg-white focus:ring-2 focus:ring-[#4a2545]/10 transition-all placeholder:text-gray-400"
            placeholder="Search skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin text-[#4a2545] opacity-50" />
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelect(user)}
              className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 ${
                selectedId === user._id
                  ? "bg-white border-[#4a2545]/20 shadow-sm ring-1 ring-[#4a2545]/5"
                  : "bg-transparent border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c398b5] to-[#824c71] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  user.name?.[0]
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <h4
                    className={`text-sm font-semibold truncate ${selectedId === user._id ? "text-[#4a2545]" : "text-gray-900"}`}
                  >
                    {user.name}
                  </h4>
                  {user._score && (
                    <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 rounded">
                      {(user._score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6">
            <p className="text-xs text-gray-400">Search to find candidates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
