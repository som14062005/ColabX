// src/pages/Notification.jsx
import React, { useEffect, useState } from "react";

export default function Notification() {
  const [requests, setRequests] = useState([]);
  const loggedInUserId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!loggedInUserId || !token) return;

        const res = await fetch(
          `http://localhost:3000/notifications/${loggedInUserId}?status=pending`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();

        // Map backend response to UI-friendly shape
        const formatted = data.map((req) => ({
          _id: req._id,
          senderName:
            req.senderId?.username ||
            req.senderName ||
            `User ${req.senderId?._id || "Unknown"}`,
          skills: req.senderId?.skills || [],
          message: req.message || "",
        }));

        setRequests(formatted);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRequests();
  }, [loggedInUserId, token]);

  const updateRequestStatus = async (notificationId, status) => {
    try {
      const res = await fetch(
        `http://localhost:3000/notifications/${notificationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error(`Failed to update status to ${status}`);

      // Remove request from UI after updating
      setRequests((prev) => prev.filter((r) => r._id !== notificationId));

      alert(`Friend request ${status}!`);
    } catch (err) {
      console.error(err);
      alert(`Error updating status to ${status}`);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center py-12 px-4"
      style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF" }}
    >
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          <span style={{ color: "#A259FF" }}>Friend</span> Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-[#B3B3B3]">No friend requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-6 rounded-xl border border-[#333] hover:border-[#A259FF] transition-all"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">
                        {req.senderName?.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-xl font-semibold">{req.senderName}</h3>
                    </div>

                    {req.message && (
                      <p className="text-sm text-[#B3B3B3] mb-2">
                        {req.message}
                      </p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {req.skills.length > 0 ? (
                        req.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#B3B3B3]">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateRequestStatus(req._id, "accepted")}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateRequestStatus(req._id, "rejected")}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
