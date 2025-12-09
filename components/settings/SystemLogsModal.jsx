import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { Search, Download, Filter } from "lucide-react";

const SystemLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching logs
      const mockLogs = [
        {
          id: 1,
          timestamp: "2025-07-30 03:45:12",
          level: "info",
          message: "User login successful",
          user: "admin@example.com",
        },
        {
          id: 2,
          timestamp: "2025-07-30 03:44:58",
          level: "warning",
          message: "Failed login attempt",
          user: "unknown@example.com",
        },
        {
          id: 3,
          timestamp: "2025-07-30 03:44:30",
          level: "error",
          message: "Database connection timeout",
          user: "system",
        },
        // Add more mock logs...
      ];
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter((log) => log.level === filterLevel);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterLevel]);

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Logs" size="xl">
      <div className="space-y-4">
        {/* Search and Filter */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>

        {/* Logs Table */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                        log.level
                      )}`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.message}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default SystemLogsModal;