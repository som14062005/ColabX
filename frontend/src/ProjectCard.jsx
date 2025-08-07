import React, { useState } from "react";
import Select from "react-select";

// Dummy user list for inviting members
const dummyUsers = [
  { id: 1, username: "alice" },
  { id: 2, username: "bob" },
  { id: 3, username: "charlie" },
  { id: 4, username: "david" },
];

const techOptions = [
  { value: "React", label: "React" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Flask", label: "Flask" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "NestJS", label: "NestJS" },
];

const difficultyOptions = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export default function ProjectCard() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [requestedMembers, setRequestedMembers] = useState([]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Full-stack React application with Node.js backend",
      status: "Active",
      updated: "2 hours ago",
      github: "https://github.com/example/ecommerce",
      techStack: ["React", "Node.js"],
      requirements: "Basic JS knowledge",
      difficulty: "Medium",
      members: ["alice"],
    },
    {
      id: 2,
      title: "AI Content Generator",
      description: "Machine learning powered content generation tool",
      status: "Completed",
      updated: "3 days ago",
      github: "https://github.com/example/aicontent",
      techStack: ["Python", "Flask"],
      requirements: "ML basics",
      difficulty: "Hard",
      members: ["bob", "charlie"],
    },
    {
      id: 3,
      title: "IoT Device Manager",
      description: "Platform for monitoring and managing IoT devices",
      status: "Active",
      updated: "12 hours ago",
      github: "https://github.com/example/iot",
      techStack: ["NestJS", "MongoDB"],
      requirements: "IoT concepts",
      difficulty: "Medium",
      members: ["david"],
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    github: "",
    techStack: [],
    requirements: "",
    difficulty: "",
    members: [],
  });

  const [searchUser, setSearchUser] = useState("");

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMember = (username) => {
    if (!form.members.includes(username)) {
      setForm({ ...form, members: [...form.members, username] });
      setRequestedMembers([...requestedMembers, username]);
    }
  };

  const handleSubmit = () => {
    const newProject = {
      id: projects.length + 1,
      title: form.title,
      description: form.description,
      status: "Active",
      updated: "Just now",
      github: form.github,
      techStack: form.techStack.map((t) => t.value),
      requirements: form.requirements,
      difficulty: form.difficulty.value,
      members: form.members,
    };

    setProjects([...projects, newProject]);
    setActiveTab("Projects");
    setForm({
      title: "",
      description: "",
      github: "",
      techStack: [],
      requirements: "",
      difficulty: "",
      members: [],
    });
    setRequestedMembers([]);
  };

  return (
    <div style={{ backgroundColor: "#0b0b0f", color: "white", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 2rem", borderBottom: "1px solid #222" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Host a project", "Projects", "Join Requests"].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                cursor: "pointer",
                padding: "0.4rem 1rem",
                borderRadius: "10px",
                backgroundColor: activeTab === tab ? "#1e1e26" : "transparent",
                border: activeTab === tab ? "1px solid #a259ff" : "none",
                color: activeTab === tab ? "#a259ff" : "#ccc",
                fontWeight: "500",
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        {activeTab === "Projects" && (
          <>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "monospace" }}><b>PROJECTS</b></h2>
            <p style={{ marginBottom: "2rem", color: "#aaa" }}>
              Manage and track your development projects
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: "#16161a",
                    border: "1px solid #2c2c34",
                    borderRadius: "10px",
                    width: "280px",
                    padding: "1rem",
                    transition: "box-shadow 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px #a259ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "0.5rem", color: "#a259ff" }}>
                    {project.title}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1rem" }}>{project.description}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    <div>Status: {project.status}</div>
                    <div>Updated: {project.updated}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "Host a project" && (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    padding: "1rem"
  }}>
    <div style={{
      width: "100%",
      maxWidth: "650px",
      backgroundColor: "#1a1a1f",
      padding: "2.5rem",
      borderRadius: "16px",
      boxShadow: "0 4px 25px rgba(162, 89, 255, 0.25)",
      border: "1px solid #2e2e35"
    }}>
      <h2 style={{
        fontSize: "2rem",
        marginBottom: "1.5rem",
        color: "#a259ff",
        textAlign: "center",
        fontWeight: "700",
        fontFamily: "unset"
      }}>
        Host a New Project
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input placeholder="Project Name" name="title" value={form.title} onChange={handleInputChange} style={inputStyle} />
        <textarea placeholder="Project Description" name="description" value={form.description} onChange={handleInputChange} style={inputStyle} />
        <input placeholder="GitHub Link" name="github" value={form.github} onChange={handleInputChange} style={inputStyle} />

        <Select
          isMulti
          name="techStack"
          options={techOptions}
          value={form.techStack}
          onChange={(selected) => setForm({ ...form, techStack: selected })}
          styles={customSelectStyle}
          placeholder="Select tech stack..."
        />

        <input placeholder="Requirements (e.g., prior knowledge, tools)" name="requirements" value={form.requirements} onChange={handleInputChange} style={inputStyle} />

        <Select
          name="difficulty"
          options={difficultyOptions}
          value={form.difficulty}
          onChange={(selected) => setForm({ ...form, difficulty: selected })}
          styles={customSelectStyle}
          placeholder="Select difficulty level"
        />

        <input
          placeholder="Search users to add..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          style={{ ...inputStyle, marginBottom: "0.75rem" }}
        />

        <div style={{
          backgroundColor: "#1f1f26",
          padding: "0.75rem",
          borderRadius: "8px",
          maxHeight: "140px",
          overflowY: "auto",
          border: "1px solid #2a2a2f"
        }}>
          {dummyUsers
            .filter((u) => u.username.toLowerCase().includes(searchUser.toLowerCase()))
            .map((user) => (
              <div key={user.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #333"
              }}>
                <span style={{ fontSize: "0.95rem", color: "#ddd" }}>{user.username}</span>
                <button
                  onClick={() => handleAddMember(user.username)}
                  style={{
                    backgroundColor: requestedMembers.includes(user.username) ? "#444" : "#a259ff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 14px",
                    color: "white",
                    cursor: requestedMembers.includes(user.username) ? "default" : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}
                  disabled={requestedMembers.includes(user.username)}
                >
                  {requestedMembers.includes(user.username) ? "Request Sent" : "Request"}
                </button>
              </div>
            ))}
        </div>

        <div style={{ marginTop: "0.6rem", fontSize: "0.9rem", color: "#aaa" }}>
          Selected: {form.members.length > 0 ? form.members.join(", ") : "None"}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: "1.75rem",
            backgroundColor: "#a259ff",
            padding: "0.9rem",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontWeight: "600",
            fontSize: "1rem",
            width: "100%",
            transition: "0.3s",
            cursor: "pointer",
            fontFamily: "monospace"
          }}
        >
          <b>Create Project</b>
        </button>
      </div>
    </div>
  </div>
)}


        {activeTab === "Join Requests" && (
          <div style={{ color: "#aaa", fontSize: "1.2rem" }}>
            No join requests yet.
          </div>
        )}
      </div>
    </div>
  );
}

// Common styles
const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  margin: "0.5rem 0",
  borderRadius: "6px",
  border: "1px solid #333",
  backgroundColor: "#16161a",
  color: "#fff",
};

const customSelectStyle = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#16161a",
    borderColor: state.isFocused ? "#a259ff" : "#333",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#a259ff",
    },
    color: "white",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#16161a",
    border: "none",
    marginTop: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#16161a",
    borderTop: "1px solid #333",
    borderBottom: "1px solid #333",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2a2a2f"
      : state.isFocused
      ? "#2a2a2f"
      : "#16161a",
    color: "white",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "white",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#2c2c34",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "white",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#a259ff",
    ":hover": {
      backgroundColor: "#a259ff",
      color: "white",
    },
  }),
};
