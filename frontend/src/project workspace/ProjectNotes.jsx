import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ProjectNotes() {
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditedBy, setLastEditedBy] = useState("");
  const [username, setUsername] = useState("");

  // Load from localStorage
  useEffect(() => {
    setNotes(localStorage.getItem("projectNotes") || "");
    setLastEditedBy(localStorage.getItem("lastEditedBy") || "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("projectNotes", notes);
    localStorage.setItem("lastEditedBy", username || "Unknown");
    setLastEditedBy(username || "Unknown");
    setIsEditing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = () => setNotes(reader.result);
      reader.readAsText(file);
    } else {
      alert("Only .md files allowed");
    }
  };

  const handleExport = () => {
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ProjectNotes.md";
    a.click();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF" }}
    >
      <div
        className="max-w-6xl w-full rounded-xl shadow-lg p-6"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Project Notes</h1>
          <input
            type="text"
            placeholder="Your Name"
            className="p-2 rounded-lg outline-none"
            style={{
              backgroundColor: "#0D0D0D",
              color: "#FFFFFF",
              border: "1px solid #333",
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Edit/View Mode */}
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <textarea
              className="w-full h-[500px] p-4 rounded-lg resize-none outline-none"
              style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div
              className="rounded-lg p-4 overflow-auto"
              style={{ backgroundColor: "#0D0D0D" }}
            >
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div
            className="p-4 rounded-lg min-h-[300px] prose prose-invert max-w-none"
            style={{ backgroundColor: "#0D0D0D" }}
          >
            <ReactMarkdown>{notes || "_No notes yet_"}</ReactMarkdown>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#A259FF", color: "#FFFFFF" }}
            >
              Done
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#7C3AED", color: "#FFFFFF" }}
            >
              Edit
            </button>
          )}

          <label
            className="px-4 py-2 rounded-lg cursor-pointer"
            style={{ backgroundColor: "#A259FF", color: "#FFFFFF" }}
          >
            Upload .md
            <input
              type="file"
              accept=".md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: "#7C3AED", color: "#FFFFFF" }}
          >
            Export .md
          </button>
        </div>

        {/* Last Edited Info */}
        {lastEditedBy && (
          <p style={{ color: "#B3B3B3" }} className="mt-4 text-sm">
            Last edited by{" "}
            <span style={{ color: "#A259FF" }}>{lastEditedBy}</span>
          </p>
        )}
      </div>
    </div>
  );
}
