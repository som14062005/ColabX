import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Monitor, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams(); // get projectId from route
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/projects/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Projects:", response.data);

        // Find the project by projectId from params
        const project = response.data.find(p => p._id === projectId);
        if (project) {
          setRole(project.role); // set role for dashboard navigation
        } else {
          console.warn("Project not found!");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [projectId, navigate]);

  const handleMouseMove = (e, id) => {
    const card = document.getElementById(id);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `rotateY(${x / 20}deg) rotateX(${-y / 20}deg) scale(1.05)`;
  };

  const handleMouseLeave = (id) => {
    const card = document.getElementById(id);
    if (!card) return;
    card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
  };

  const handleDashboardClick = () => {
    if (!role) return alert("Project role not loaded yet!");

    if (role === "owner") navigate("/tasks-lead");
    else if (role === "member") navigate("/tasks-member");
    else console.warn("Unknown role:", role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Workspace Card */}
        <motion.div
          id="workspace-card"
          className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-lg cursor-pointer text-white text-center transform transition-transform duration-300"
          onMouseMove={(e) => handleMouseMove(e, "workspace-card")}
          onMouseLeave={() => handleMouseLeave("workspace-card")}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/workspace")}
        >
          <Monitor className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold">Workspace</h2>
          <p className="mt-2 text-gray-200">Collaborate and manage resources</p>
        </motion.div>

        {/* Dashboard Card */}
        <motion.div
          id="dashboard-card"
          className="bg-gradient-to-br from-pink-500 to-red-500 p-6 rounded-2xl shadow-lg cursor-pointer text-white text-center transform transition-transform duration-300"
          onMouseMove={(e) => handleMouseMove(e, "dashboard-card")}
          onMouseLeave={() => handleMouseLeave("dashboard-card")}
          whileHover={{ scale: 1.05 }}
          onClick={handleDashboardClick}
        >
          <LayoutDashboard className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold">Project Dashboard</h2>
          <p className="mt-2 text-gray-200">Track progress and manage tasks</p>
        </motion.div>

      </div>
    </div>
  );
}
