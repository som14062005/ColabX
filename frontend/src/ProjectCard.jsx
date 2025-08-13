import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

// API Service
const apiService = {
  baseUrl: 'http://localhost:3000',
  
  async request(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
    
    return response.json();
  },

  // Project APIs
  async getMyProjects() {
    return this.request('/projects/my');
  },

  async getAvailableProjects() {
    return this.request('/projects/available-to-join');
  },

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Join Request APIs
  async sendJoinRequest(projectId) {
    return this.request(`/projects/${projectId}/join-request`, {
      method: 'POST',
    });
  },

  async getJoinRequests(projectId) {
    return this.request(`/projects/${projectId}/join-requests`);
  },

  async acceptJoinRequest(projectId, requestUserId) {
    return this.request(`/projects/${projectId}/join-requests/${requestUserId}/accept`, {
      method: 'POST',
    });
  },

  async rejectJoinRequest(projectId, requestUserId) {
    return this.request(`/projects/${projectId}/join-requests/${requestUserId}/reject`, {
      method: 'POST',
    });
  }
};

// Data transformers
const transformProject = (backendProject, currentUserId) => ({
  id: backendProject._id,
  _id: backendProject._id,
  name: backendProject.name,
  title: backendProject.name,
  description: backendProject.description,
  status: backendProject.owner === currentUserId ? "Owned" : "Available",
  updated: formatDate(backendProject.updatedAt),
  githubLink: backendProject.githubLink || '',
  techStack: backendProject.techStack || [],
  requirements: backendProject.requirements || 'No requirements specified',
  difficulty: backendProject.difficulty || 'Not specified',
  members: backendProject.members || [],
  joinRequests: backendProject.joinRequests || [],
  isOwned: backendProject.owner === currentUserId,
  owner: backendProject.owner,
});

const transformJoinRequest = (request) => ({
  id: request._id || request.id,
  userId: request.user._id || request.user.id,
  user: {
    id: request.user._id || request.user.id,
    username: request.user.username,
    displayName: request.user.displayName || request.user.username,
    email: request.user.email,
    skills: request.user.skills || [],
    experience: request.user.experience || 'Not specified',
    bio: request.user.bio || 'No bio available',
    avatar: request.user.avatar || `https://i.pravatar.cc/150?u=${request.user._id || request.user.id}`,
  },
  projectId: request.project || request.projectId,
  projectTitle: request.projectTitle || 'Unknown Project',
  status: request.status || 'pending',
  createdAt: request.createdAt,
  timestamp: request.createdAt,
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const getCurrentUserId = () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || payload.id;
  } catch {
    return null;
  }
};

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
  { value: "Intermediate", label: "Intermediate" },
  { value: "Hard", label: "Hard" },
  { value: "Beginner", label: "Beginner" },
  { value: "Advanced", label: "Advanced" },
];

// User Profile Component
function UserProfile({ userData, onBack, isOwnProfile }) {
  return (
    <div style={{ backgroundColor: "#0b0b0f", color: "white", minHeight: "100vh", padding: "2rem" }}>
      <button 
        onClick={onBack}
        style={{
          backgroundColor: "#a259ff",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          marginBottom: "2rem"
        }}
      >
        ← Back
      </button>
      
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <img 
          src={userData.avatar} 
          alt={userData.displayName}
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            marginBottom: "1rem"
          }}
        />
        <h1 style={{ color: "#a259ff" }}>{userData.displayName}</h1>
        <p style={{ color: "#888" }}>@{userData.username}</p>
        <p>{userData.bio}</p>
        
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ color: "#a259ff" }}>Skills</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {userData.skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  background: "#2c2c34",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "#ddd",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Experience:</strong> {userData.experience}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      </div>
    </div>
  );
}

// Join Requests Management Modal
function JoinRequestsModal({ projectId, isOpen, onClose, onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJoinRequests = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getJoinRequests(projectId);
      setRequests(data.map(transformJoinRequest));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchJoinRequests();
    }
  }, [isOpen, projectId, fetchJoinRequests]);

  const handleAccept = async (requestUserId) => {
    try {
      await apiService.acceptJoinRequest(projectId, requestUserId);
      await fetchJoinRequests(); // Refresh requests
      onUpdate?.(); // Notify parent to refresh projects
    } catch (err) {
      alert(`Error accepting request: ${err.message}`);
    }
  };

  const handleReject = async (requestUserId) => {
    try {
      await apiService.rejectJoinRequest(projectId, requestUserId);
      await fetchJoinRequests(); // Refresh requests
      onUpdate?.(); // Notify parent to refresh projects
    } catch (err) {
      alert(`Error rejecting request: ${err.message}`);
    }
  };

  if (!isOpen) return null;

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
            Join Requests ({requests.length})
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

        <div style={{ padding: 24 }}>
          {loading && (
            <div style={{ textAlign: "center", color: "#a259ff", padding: "2rem" }}>
              Loading requests...
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", color: "#ef4444", padding: "2rem" }}>
              Error: {error}
            </div>
          )}

          {!loading && !error && requests.length === 0 && (
            <div style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
              No join requests at the moment
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    background: "#16161a",
                    border: "1px solid #2c2c34",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <img
                      src={request.user.avatar}
                      alt={request.user.displayName}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1px solid #3a3a42",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#a259ff",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {request.user.displayName} (@{request.user.username})
                      </div>
                      <div style={{ color: "#888", fontSize: 12 }}>
                        {request.user.email}
                      </div>
                    </div>
                  </div>

                  {request.user.skills.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#a259ff", marginBottom: 4 }}>Skills:</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {request.user.skills.slice(0, 3).map((skill, skillIdx) => (
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
                        {request.user.skills.length > 3 && (
                          <span style={{ fontSize: 10, color: "#888" }}>
                            +{request.user.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleReject(request.userId)}
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
                      onClick={() => handleAccept(request.userId)}
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
function ProjectDetailModal({ project, onClose, onJoinRequest, hasRequested, isRequestingJoin }) {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Hard" || difficulty === "Advanced") return "#ef4444";
    if (difficulty === "Medium" || difficulty === "Intermediate") return "#eab308";
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
        {/* HEADER */}
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
              {project.name || project.title}
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

        {/* BODY */}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Description</h4>
            <p style={{ color: "#ddd", lineHeight: 1.6, margin: 0, fontSize: 14 }}>
              {project.description}
            </p>
          </div>

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

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Requirements</h4>
            <p style={{ color: "#ddd", margin: 0, fontSize: 14 }}>
              {project.requirements}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>
              Current Members ({project.members ? project.members.length : 0})
            </h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.members && project.members.length > 0 ? (
                project.members.map((member, idx) => (
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
                ))
              ) : (
                <span style={{ color: "#888", fontSize: 14 }}>No members yet</span>
              )}
            </div>
          </div>

          {(project.github || project.githubLink) && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: "#a259ff", marginBottom: 8, fontSize: 16 }}>Repository</h4>
              <a
                href={project.github || project.githubLink}
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

        {/* FOOTER */}
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
            onClick={() => onJoinRequest(project._id || project.id)}
            disabled={hasRequested || isRequestingJoin}
            style={{
              background: hasRequested ? "#444" : isRequestingJoin ? "#666" : "#a259ff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              color: "white",
              cursor: (hasRequested || isRequestingJoin) ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {isRequestingJoin ? "Sending..." : hasRequested ? "Request Sent" : "Request to Join"}
          </button>

          {/* NEW BLINKING GO TO PROJECT BUTTON */}
          <button
            onClick={() => navigate(`/projects/${project._id || project.id}`)}
            style={{
              background: "#ff9800",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              animation: "blinker 1s linear infinite",
            }}
          >
            🚀 Go To Project
          </button>
        </div>
      </div>

      {/* Blinking keyframes */}
      <style>
        {`
          @keyframes blinker {
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

export default function ProjectCard() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchProjects, setSearchProjects] = useState("");
  const [techFilter, setTechFilter] = useState([]);
  const [isRequestingJoin, setIsRequestingJoin] = useState(false);
  const [joinRequestModalProject, setJoinRequestModalProject] = useState(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState('main');
  const [viewingUserProfile, setViewingUserProfile] = useState(null);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available projects state
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [errorAvailable, setErrorAvailable] = useState(null);

  // Join requests tracking
  const [sentJoinRequests, setSentJoinRequests] = useState(new Set());

  const currentUserId = getCurrentUserId();

  const [form, setForm] = useState({
    name: "",
    description: "",
    githubLink: "",
    techStack: [],
    requirements: "",
    difficulty: "",
    members: [],
  });

  // Fetch projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getMyProjects();
      
      const transformedProjects = [];
      
      if (data.owned) {
        data.owned.forEach(project => {
          transformedProjects.push(transformProject(project, currentUserId));
        });
      }

      if (data.joined) {
        data.joined.forEach(project => {
          transformedProjects.push({
            ...transformProject(project, currentUserId),
            status: "Joined",
            isOwned: false,
          });
        });
      }

      setProjects(transformedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch available projects
  const fetchAvailableProjects = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setErrorAvailable(null);
      
      const data = await apiService.getAvailableProjects();
      
      const transformedProjects = data.map(project => ({
        ...transformProject(project, currentUserId),
        status: "Available",
      }));

      setAvailableProjects(transformedProjects);
    } catch (err) {
      console.error("Error fetching available projects:", err);
      setErrorAvailable(err.message);
      setAvailableProjects([]);
    } finally {
      setLoadingAvailable(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeTab === "Join Requests") {
      fetchAvailableProjects();
    }
  }, [activeTab, fetchAvailableProjects]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleJoinRequest = async (projectId) => {
    if (sentJoinRequests.has(projectId) || isRequestingJoin) return;

    try {
      setIsRequestingJoin(true);
      
      await apiService.sendJoinRequest(projectId);
      
      setSentJoinRequests(prev => new Set([...prev, projectId]));
      setSelectedProject(null);
      
      alert("Join request sent successfully!");

    } catch (err) {
      console.error("Error sending join request:", err);
      alert(`Error sending join request: ${err.message}`);
    } finally {
      setIsRequestingJoin(false);
    }
  };

  const handleViewUserProfile = (user) => {
    setViewingUserProfile(user);
    setCurrentView('profile');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setViewingUserProfile(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!form.description.trim()) {
      alert("Please enter a project description.");
      return;
    }
    if (!form.difficulty) {
      alert("Please select a difficulty level.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      githubLink: form.githubLink.trim(),
      techStack: form.techStack.map(t => t.value),
      requirements: form.requirements.trim(),
      difficulty: typeof form.difficulty === 'object' ? form.difficulty.value : form.difficulty,
    };

    try {
      await apiService.createProject(payload);
      
      await fetchProjects();
      setActiveTab("Projects");

      setForm({
        name: "",
        description: "",
        githubLink: "",
        techStack: [],
        requirements: "",
        difficulty: "",
        members: [],
      });
      
      alert("Project created successfully!");

    } catch (err) {
      console.error("Error creating project:", err);
      alert(`Error creating project: ${err.message}`);
    }
  };

  const filteredAvailableProjects = availableProjects.filter((project) => {
    const projectName = project.name || project.title || "";
    const projectDescription = project.description || "";
    const searchTerm = (searchProjects || "").toLowerCase();

    const matchesSearch =
      projectName.toLowerCase().includes(searchTerm) ||
      projectDescription.toLowerCase().includes(searchTerm);

    const matchesTech =
      techFilter.length === 0 ||
      techFilter.some(tech => project.techStack?.includes(tech.value));

    return matchesSearch && matchesTech;
  });

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Hard" || difficulty === "Advanced") return "#ef4444";
    if (difficulty === "Medium" || difficulty === "Intermediate") return "#eab308";
    return "#22c55e";
  };

  // Render profile view
  if (currentView === 'profile') {
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
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "1.5rem 2rem", 
        borderBottom: "1px solid #222" 
      }}>
        <div style={{ 
          fontSize: "1.8rem", 
          fontWeight: "700",
          fontFamily: "monospace"
        }}>
          <span style={{ color: "#a259ff" }}>Colab</span>
          <span style={{ color: "white" }}>X</span>
        </div>

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
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "monospace" }}>
              <b>PROJECTS</b>
            </h2>
            <p style={{ marginBottom: "2rem", color: "#aaa" }}>
              Manage and track your development projects
            </p>

            {loading && (
              <div style={{ 
                textAlign: "center", 
                color: "#a259ff", 
                fontSize: "1.1rem", 
                marginTop: "3rem" 
              }}>
                Loading projects...
              </div>
            )}

            {error && (
              <div style={{ 
                textAlign: "center", 
                color: "#ef4444", 
                fontSize: "1rem", 
                marginTop: "2rem",
                padding: "1rem",
                backgroundColor: "#2a1a1a",
                borderRadius: "8px",
                border: "1px solid #ef4444"
              }}>
                Error: {error}
                <br />
                <button 
                  onClick={fetchProjects}
                  style={{
                    marginTop: "1rem",
                    backgroundColor: "#a259ff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                color: "#666", 
                fontSize: "1.1rem", 
                marginTop: "3rem" 
              }}>
                No projects found. Create your first project!
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
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
                      position: "relative",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px #a259ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div style={{ 
                      fontWeight: "bold", 
                      fontSize: "1rem", 
                      marginBottom: "0.5rem", 
                      color: "#a259ff" 
                    }}>
                      {project.name}
                    </div>

                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#ccc", 
                      marginBottom: "1rem",
                      lineHeight: "1.4"
                    }}>
                      {project.description.length > 100 
                        ? project.description.substring(0, 100) + "..." 
                        : project.description
                      }
                    </div>

                    <div style={{ 
                      position: "absolute",
                      top: "1rem",
                      right: "1rem"
                    }}>
                      <span style={{
                        backgroundColor: project.isOwned ? "#22c55e" : "#3b82f6",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "bold"
                      }}>
                        {project.status}
                      </span>
                    </div>

                    {project.techStack.length > 0 && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "#a259ff", marginBottom: "0.25rem" }}>
                          Tech Stack:
                        </div>
                        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                          {project.techStack.slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: "#2c2c34",
                                padding: "1px 6px",
                                borderRadius: 3,
                                fontSize: 10,
                                color: "#ddd",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span style={{ fontSize: 10, color: "#888" }}>
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      <div>Difficulty: {project.difficulty}</div>
                      <div>Members: {project.members.length}</div>
                      <div>Updated: {project.updated}</div>
                      {project.isOwned && project.joinRequests && (
                        <div style={{ color: "#a259ff" }}>
                          Join Requests: {project.joinRequests.length}
                        </div>
                      )}
                    </div>

                    {project.githubLink && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "#a259ff",
                            fontSize: "0.75rem",
                            textDecoration: "none"
                          }}
                        >
                          🔗 GitHub
                        </a>
                      </div>
                    )}

                    {/* Manage Join Requests Button for Owned Projects */}
                    {project.isOwned && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setJoinRequestModalProject(project);
                          }}
                          style={{
                            backgroundColor: "#a259ff",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            fontWeight: "500"
                          }}
                        >
                          Manage Requests ({project.joinRequests?.length || 0})
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                <input 
                  placeholder="Project Name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleInputChange} 
                  style={inputStyle} 
                />
                <textarea 
                  placeholder="Project Description" 
                  name="description" 
                  value={form.description} 
                  onChange={handleInputChange} 
                  style={{...inputStyle, minHeight: "80px", resize: "vertical"}} 
                />
                <input 
                  placeholder="GitHub Link (optional)" 
                  name="githubLink" 
                  value={form.githubLink} 
                  onChange={handleInputChange} 
                  style={inputStyle} 
                />

                <Select
                  isMulti
                  name="techStack"
                  options={techOptions}
                  value={form.techStack}
                  onChange={(selected) => setForm({ ...form, techStack: selected || [] })}
                  styles={customSelectStyle}
                  placeholder="Select tech stack..."
                />

                <input 
                  placeholder="Requirements (e.g., prior knowledge, tools)" 
                  name="requirements" 
                  value={form.requirements} 
                  onChange={handleInputChange} 
                  style={inputStyle} 
                />

                <Select
                  name="difficulty"
                  options={difficultyOptions}
                  value={form.difficulty}
                  onChange={(selected) => setForm({ ...form, difficulty: selected })}
                  styles={customSelectStyle}
                  placeholder="Select difficulty level"
                />

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
                {filteredAvailableProjects.length} projects found
              </div>

              <button
                onClick={fetchAvailableProjects}
                disabled={loadingAvailable}
                style={{
                  backgroundColor: "#a259ff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  color: "white",
                  cursor: loadingAvailable ? "not-allowed" : "pointer",
                  fontSize: "0.8rem"
                }}
              >
                {loadingAvailable ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loadingAvailable && (
              <div style={{ 
                textAlign: "center", 
                color: "#a259ff", 
                fontSize: "1.1rem", 
                marginTop: "3rem" 
              }}>
                Loading available projects...
              </div>
            )}

            {errorAvailable && (
              <div style={{ 
                textAlign: "center", 
                color: "#ef4444", 
                fontSize: "1rem", 
                marginTop: "2rem",
                padding: "1rem",
                backgroundColor: "#2a1a1a",
                borderRadius: "8px",
                border: "1px solid #ef4444"
              }}>
                Error: {errorAvailable}
                <br />
                <button 
                  onClick={fetchAvailableProjects}
                  style={{
                    marginTop: "1rem",
                    backgroundColor: "#a259ff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingAvailable && !errorAvailable && filteredAvailableProjects.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                color: "#666", 
                fontSize: "1.1rem", 
                marginTop: "3rem" 
              }}>
                {availableProjects.length === 0 
                  ? "No projects available to join at the moment." 
                  : "No projects found matching your criteria."
                }
              </div>
            )}

            {!loadingAvailable && !errorAvailable && filteredAvailableProjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                {filteredAvailableProjects.map((project) => (
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: "bold", 
                          fontSize: "1.1rem", 
                          marginBottom: "0.5rem", 
                          color: "#a259ff" 
                        }}>
                          {project.name || project.title}
                        </div>
                        <div style={{ 
                          fontSize: "0.85rem", 
                          color: "#888",
                          display: "flex",
                          gap: "1rem"
                        }}>
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

                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#ccc", 
                      marginBottom: "1rem",
                      lineHeight: "1.4"
                    }}>
                      {project.description.length > 120 
                        ? project.description.substring(0, 120) + "..." 
                        : project.description
                      }
                    </div>

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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>
                        {project.members ? project.members.length : 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinRequest(project._id || project.id);
                        }}
                        disabled={sentJoinRequests.has(project._id || project.id)}
                        style={{
                          backgroundColor: sentJoinRequests.has(project._id || project.id) ? "#444" : "#a259ff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          color: "white",
                          cursor: sentJoinRequests.has(project._id || project.id) ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          fontWeight: "500"
                        }}
                      >
                        {sentJoinRequests.has(project._id || project.id) ? "Requested" : "Join"}
                      </button>
                    </div>
                  </div>
                ))}
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
          hasRequested={sentJoinRequests.has(selectedProject._id || selectedProject.id)}
          isRequestingJoin={isRequestingJoin}
        />
      )}

      {joinRequestModalProject && (
        <JoinRequestsModal
          projectId={joinRequestModalProject.id}
          isOpen={!!joinRequestModalProject}
          onClose={() => setJoinRequestModalProject(null)}
          onUpdate={() => {
            fetchProjects();
            fetchAvailableProjects();
          }}
        />
      )}
    </div>
  );
}

// Common styles
const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  margin: "0.5rem 0",
  borderRadius: "8px",
  border: "1px solid #333",
  backgroundColor: "#16161a",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.3s",
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
    padding: "2px",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#16161a",
    border: "1px solid #333",
    marginTop: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#16161a",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#a259ff"
      : state.isFocused
      ? "#2a2a2f"
      : "#16161a",
    color: "white",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#2a2a2f",
    }
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
  placeholder: (base) => ({
    ...base,
    color: "#888",
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
};