import React, { useState } from "react";
import Select from "react-select";
import UserProfile from './profile_onchain_resume'; // Make sure this path is correct

// Dummy user list for inviting members
const dummyUsers = [
  { 
    id: 1, 
    username: "alice",
    displayName: "Alice Johnson",
    email: "alice@example.com",
    skills: ["React", "JavaScript", "CSS"],
    experience: "2 years",
    bio: "Frontend developer passionate about creating beautiful user interfaces",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  { 
    id: 2, 
    username: "bob",
    displayName: "Bob Smith",
    email: "bob@example.com",
    skills: ["Node.js", "Python", "MongoDB"],
    experience: "3 years",
    bio: "Full-stack developer with expertise in backend technologies",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  { 
    id: 3, 
    username: "charlie",
    displayName: "Charlie Brown",
    email: "charlie@example.com",
    skills: ["Python", "Machine Learning", "Data Science"],
    experience: "4 years",
    bio: "Data scientist and ML engineer building intelligent systems",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  { 
    id: 4, 
    username: "david",
    displayName: "David Wilson",
    email: "david@example.com",
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    experience: "5 years",
    bio: "Senior developer with cloud architecture experience",
    avatar: "https://i.pravatar.cc/150?img=4"
  },
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

// Notifications Modal Component
function NotificationsModal({ notifications, onClose, onAccept, onReject, onViewProfile }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#1a1a1f",
          borderRadius: 16,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 40px rgba(162, 89, 255, 0.3)",
          border: "1px solid #2e2e35",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #2e2e35",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#a259ff", fontSize: 20, fontWeight: 700 }}>
            Join Requests ({notifications.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#888",
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
              No join requests at the moment
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {notifications.map((notification, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#16161a",
                    border: "1px solid #2c2c34",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.displayName}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1px solid #3a3a42",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        onClick={() => onViewProfile(notification.user)}
                        style={{
                          color: "#a259ff",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: 14,
                          textDecoration: "underline",
                        }}
                      >
                        {notification.user.displayName} (@{notification.user.username})
                      </div>
                      <div style={{ color: "#888", fontSize: 12 }}>
                        wants to join "{notification.projectTitle}"
                      </div>
                    </div>
                  </div>

                  {/* User Skills Preview */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#a259ff", marginBottom: 4 }}>Skills:</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {notification.user.skills.slice(0, 3).map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          style={{
                            background: "#2c2c34",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 10,
                            color: "#ddd",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {notification.user.skills.length > 3 && (
                        <span style={{ fontSize: 10, color: "#888" }}>
                          +{notification.user.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => onReject(notification.id)}
                      style={{
                        background: "#ef4444",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onAccept(notification.id)}
                      style={{
                        background: "#22c55e",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Project Detail Modal Component
function ProjectDetailModal({ project, onClose, onJoinRequest, hasRequested }) {
  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Hard") return "#ef4444";
    if (difficulty === "Medium") return "#eab308";
    return "#22c55e";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#1a1a1f",
          borderRadius: 16,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 40px rgba(162, 89, 255, 0.3)",
          border: "1px solid #2e2e35",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #2e2e35",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "#a259ff", fontSize: 24, fontWeight: 700 }}>
              {project.title}
            </h2>
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span
                style={{
                  background: getDifficultyColor(project.difficulty),
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {project.difficulty}
              </span>
              <span style={{ color: "#888", fontSize: 14 }}>
                Status: {project.status}
              </span>
              <span style={{ color: "#888", fontSize: 14 }}>
                Updated: {project.updated}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#888",
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Description</h4>
            <p style={{ color: "#ddd", lineHeight: 1.6, margin: 0, fontSize: 14 }}>
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Tech Stack</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "#2c2c34",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#ddd",
                    border: "1px solid #3a3a42",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Requirements</h4>
            <p style={{ color: "#ddd", margin: 0, fontSize: 14 }}>
              {project.requirements}
            </p>
          </div>

          {/* Current Members */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>
              Current Members ({project.members.length})
            </h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.members.map((member, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "#16161a",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#ddd",
                    border: "1px solid #2c2c34",
                  }}
                >
                  @{member}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Link */}
          {project.github && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Repository</h4>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#a259ff",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                🔗 View on GitHub
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #2e2e35",
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#2c2c34",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              color: "#ddd",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Close
          </button>
          <button
            onClick={() => onJoinRequest(project.id)}
            disabled={hasRequested}
            style={{
              background: hasRequested ? "#444" : "#a259ff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              color: "white",
              cursor: hasRequested ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {hasRequested ? "Request Sent" : "Request to Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [requestedMembers, setRequestedMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchProjects, setSearchProjects] = useState("");
  const [techFilter, setTechFilter] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Navigation state - THIS IS THE KEY PART
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'profile'
  const [viewingUserProfile, setViewingUserProfile] = useState(null);

  // Mock notifications for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user: dummyUsers[0], // alice
      projectId: 1,
      projectTitle: "E-Commerce Platform",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      user: dummyUsers[1], // bob
      projectId: 3,
      projectTitle: "IoT Device Manager",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A comprehensive full-stack e-commerce solution built with React and Node.js. Features include user authentication, product catalog, shopping cart, payment integration, order management, and admin dashboard. Perfect for learning modern web development patterns and building scalable applications.",
      status: "Active",
      updated: "2 hours ago",
      github: "https://github.com/example/ecommerce",
      techStack: ["React", "Node.js"],
      requirements: "Basic JavaScript knowledge, familiarity with React hooks, understanding of REST APIs",
      difficulty: "Medium",
      members: ["alice"],
    },
    {
      id: 2,
      title: "AI Content Generator",
      description: "Machine learning powered content generation tool that uses natural language processing to create articles, social media posts, and marketing copy. Includes sentiment analysis, content optimization, and integration with popular CMS platforms.",
      status: "Completed",
      updated: "3 days ago",
      github: "https://github.com/example/aicontent",
      techStack: ["Python", "Flask"],
      requirements: "Machine learning basics, Python programming, understanding of NLP concepts",
      difficulty: "Hard",
      members: ["bob", "charlie"],
    },
    {
      id: 3,
      title: "IoT Device Manager",
      description: "Comprehensive platform for monitoring and managing IoT devices in real-time. Features include device registration, data visualization, alert systems, remote control capabilities, and analytics dashboard for performance metrics.",
      status: "Active",
      updated: "12 hours ago",
      github: "https://github.com/example/iot",
      techStack: ["NestJS", "MongoDB"],
      requirements: "IoT concepts, database design, real-time communication protocols",
      difficulty: "Medium",
      members: ["david"],
    },
    {
      id: 4,
      title: "Collaborative Code Editor",
      description: "Real-time collaborative code editor with syntax highlighting, version control integration, live chat, and pair programming features. Built for remote development teams and coding interviews.",
      status: "Active",
      updated: "1 day ago",
      github: "https://github.com/example/codeeditor",
      techStack: ["React", "Node.js", "MongoDB"],
      requirements: "WebSocket knowledge, React experience, understanding of collaborative algorithms",
      difficulty: "Hard",
      members: ["alice", "bob"],
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

  const handleJoinRequest = (projectId) => {
    if (!joinRequests.includes(projectId)) {
      setJoinRequests([...joinRequests, projectId]);
      
      // Add to notifications (simulate request from current user to project lead)
      const project = projects.find(p => p.id === projectId);
      const newNotification = {
        id: notifications.length + 1,
        user: dummyUsers[2], // charlie as example current user
        projectId: projectId,
        projectTitle: project.title,
        timestamp: new Date().toISOString(),
      };
      setNotifications([...notifications, newNotification]);
    }
    setSelectedProject(null);
  };

  const handleAcceptRequest = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      // Add user to project members
      setProjects(prev => prev.map(project => 
        project.id === notification.projectId 
          ? { ...project, members: [...project.members, notification.user.username] }
          : project
      ));
      
      // Remove notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const handleRejectRequest = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // CRITICAL NAVIGATION FUNCTIONS - FIXED
  const handleViewUserProfile = (user) => {
    console.log('🔥 Navigating to profile for user:', user);
    setViewingUserProfile(user);
    setCurrentView('profile');
    setShowNotifications(false);
  };

  const handleBackToMain = () => {
    console.log('🔥 Navigating back to main');
    setCurrentView('main');
    setViewingUserProfile(null);
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

  // Filter projects for Join Requests tab
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchProjects.toLowerCase()) ||
      project.description.toLowerCase().includes(searchProjects.toLowerCase());
    
    const matchesTech = 
      techFilter.length === 0 ||
      techFilter.some(tech => project.techStack.includes(tech.value));
    
    return matchesSearch && matchesTech;
  });

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Hard") return "#ef4444";
    if (difficulty === "Medium") return "#eab308";
    return "#22c55e";
  };

  // MAIN RENDER LOGIC - THIS IS THE KEY PART THAT WAS MISSING
  console.log('🔥 Current view:', currentView);
  
  // Render profile view
  if (currentView === 'profile') {
    console.log('🔥 Rendering UserProfile with data:', viewingUserProfile);
    return (
      <UserProfile 
        userData={viewingUserProfile}
        onBack={handleBackToMain}
        isOwnProfile={false}
      />
    );
  }

  // Render main view
  return (
    <div style={{ backgroundColor: "#0b0b0f", color: "white", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Enhanced Header with CODEX branding and notifications */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "1.5rem 2rem", 
        borderBottom: "1px solid #222" 
      }}>
        {/* CODEX Brand */}
        <div style={{ 
          fontSize: "1.8rem", 
          fontWeight: "700",
          fontFamily: "monospace"
        }}>
          <span style={{ color: "#a259ff" }}>Colab</span>
          <span style={{ color: "white" }}>X</span>
        </div>

        {/* Navigation Tabs */}
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

        {/* Notifications Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(true)}
            style={{
              background: "transparent",
              border: "1px solid #3a3a42",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              color: "#a259ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              position: "relative",
            }}
          >
            🔔
            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>
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
                  <div style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1rem" }}>
                    {project.description.substring(0, 100)}...
                  </div>
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
          <>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "monospace" }}>
              <b>DISCOVER PROJECTS</b>
            </h2>
            <p style={{ marginBottom: "2rem", color: "#aaa" }}>
              Browse and join exciting development projects
            </p>

            {/* Search and Filter Controls */}
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              marginBottom: "2rem", 
              alignItems: "center",
              flexWrap: "wrap" 
            }}>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchProjects}
                onChange={(e) => setSearchProjects(e.target.value)}
                style={{
                  ...inputStyle,
                  minWidth: "300px",
                  margin: 0,
                }}
              />
              
              <Select
                isMulti
                options={techOptions}
                value={techFilter}
                onChange={setTechFilter}
                styles={customSelectStyle}
                placeholder="Filter by tech stack..."
                className="tech-filter"
                style={{ minWidth: "200px" }}
              />

              <div style={{ color: "#888", fontSize: "0.9rem" }}>
                {filteredProjects.length} projects found
              </div>
            </div>

            {/* Projects Grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    backgroundColor: "#16161a",
                    border: "1px solid #2c2c34",
                    borderRadius: "12px",
                    width: "320px",
                    padding: "1.5rem",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(162, 89, 255, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Project Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: "bold", 
                        fontSize: "1.1rem", 
                        marginBottom: "0.5rem", 
                        color: "#a259ff" 
                      }}>
                        {project.title}
                      </div>
                      <div style={{ 
                        fontSize: "0.85rem", 
                        color: "#888",
                        display: "flex",
                        gap: "1rem"
                      }}>
                        <span>Status: {project.status}</span>
                        <span>Updated: {project.updated}</span>
                      </div>
                    </div>
                    
                    <span
                      style={{
                        background: getDifficultyColor(project.difficulty),
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      {project.difficulty}
                    </span>
                  </div>

                  {/* Project Description */}
                  <div style={{ 
                    fontSize: "0.9rem", 
                    color: "#ccc", 
                    marginBottom: "1rem",
                    lineHeight: "1.4"
                  }}>
                    {project.description.substring(0, 120)}...
                  </div>

                  {/* Tech Stack */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#a259ff", marginBottom: "0.5rem" }}>
                      Tech Stack:
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {project.techStack.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#2c2c34",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            color: "#ddd",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span style={{ fontSize: 11, color: "#888" }}>
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Members */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRequest(project.id);
                      }}
                      disabled={joinRequests.includes(project.id)}
                      style={{
                        backgroundColor: joinRequests.includes(project.id) ? "#444" : "#a259ff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        color: "white",
                        cursor: joinRequests.includes(project.id) ? "not-allowed" : "pointer",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}
                    >
                      {joinRequests.includes(project.id) ? "Requested" : "Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                color: "#666", 
                fontSize: "1.1rem", 
                marginTop: "3rem" 
              }}>
                No projects found matching your criteria.
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onJoinRequest={handleJoinRequest}
          hasRequested={joinRequests.includes(selectedProject.id)}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onViewProfile={handleViewUserProfile} // This is the key connection
        />
      )}
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
    minWidth: "200px",
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
