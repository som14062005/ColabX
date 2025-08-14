import React, { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, MessageCircle, Code, FileText, CheckSquare, GitBranch, PenTool } from "lucide-react";

const token = import.meta.env.VITE_GITHUB_TOKEN;
const NODE_WIDTH = 260;
const NODE_HEIGHT = null; // taller to fit tags nicely

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getDagreLayout(reactFlowNodes, reactFlowEdges, direction = "TB") {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 200
  });

  reactFlowNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  reactFlowEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: reactFlowNodes.map((node) => {
      const n = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: n.x - NODE_WIDTH / 2, y: n.y - NODE_HEIGHT / 2 },
      };
    }),
    edges: reactFlowEdges,
  };
}

function colorForBranch(branchName) {
  const colors = [
    "#6C5CE7",
    "#00B894",
    "#0984E3",
    "#D63031",
    "#E17055",
    "#00CEC9",
    "#fdcb6e",
    "#b2bec3",
  ];
  let h = 0;
  for (let i = 0; i < branchName.length; i++) {
    h = (h << 5) - h + branchName.charCodeAt(i);
  }
  return colors[Math.abs(h) % colors.length];
}

export default function CommitGraphReactFlow({
  owner,
  repo,
  maxCommitsPerBranch = 120,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [error, setError] = useState(null);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const dropdownRef = useRef(null);

  const ghToken = token || process.env.REACT_APP_GITHUB_TOKEN || "";

  // Workspace features data
  const workspaceFeatures = [
    { id: 'chatroom', name: 'Chat Room', icon: MessageCircle, isActive: false, route: '/chat' },
    { id: 'code-editor', name: 'Code Editor', icon: Code, isActive: false, route: '/code' },
    { id: 'notes', name: 'Notes', icon: FileText, isActive: false, route: '/notes' },
    { id: 'issue-board', name: 'Issue Board', icon: CheckSquare, isActive: false, route: '/issues' },
    { id: 'git-commits', name: 'Git Commits', icon: GitBranch, isActive: true, route: '/git' },
    { id: 'whiteboard', name: 'Whiteboard', icon: PenTool, isActive: false, route: '/whiteboard' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkspaceDropdown(false);
        setHoveredItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWorkspaceFeatureClick = (feature) => {
    if (!feature.isActive) {
      navigate(feature.route);
    }
    setShowWorkspaceDropdown(false);
    setHoveredItem(null);
  };

  const handleMouseEnter = (featureId) => {
    setHoveredItem(featureId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  useEffect(() => {
    let mounted = true;
    async function fetchGraph() {
      setLoading(true);
      setError(null);

      if (!owner || !repo) {
        setError("owner and repo props required");
        setLoading(false);
        return;
      }
      if (!ghToken) {
        setError("GitHub token required (prop token or REACT_APP_GITHUB_TOKEN)");
        setLoading(false);
        return;
      }

      try {
        const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;
        const branchesResp = await fetch(branchesUrl, {
          headers: { Authorization: `Bearer ${ghToken}`, "User-Agent": "react-vcs-graph" },
        });
        if (!branchesResp.ok) {
          const errBody = await branchesResp.json().catch(() => ({}));
          throw new Error(errBody.message || `Failed to fetch branches: ${branchesResp.status}`);
        }
        const branches = await branchesResp.json();

        const commitMap = new Map();
        const edges = [];

        for (const br of branches) {
          const brName = br.name;
          let page = 1;
          let collected = 0;
          outer: while (collected < maxCommitsPerBranch) {
            const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(
              brName
            )}&per_page=100&page=${page}`;
            const commitsResp = await fetch(commitsUrl, {
              headers: { Authorization: `Bearer ${ghToken}`, "User-Agent": "react-vcs-graph" },
            });
            if (!commitsResp.ok) break;
            const commits = await commitsResp.json();
            if (!Array.isArray(commits) || commits.length === 0) break;

            for (const c of commits) {
              if (!commitMap.has(c.sha)) {
                commitMap.set(c.sha, {
                  sha: c.sha,
                  message: (c.commit?.message?.split("\n")[0]) || "(no message)",
                  author:
                    (c.commit?.author?.name || c.commit?.committer?.name) ||
                    (c.author && c.author.login) ||
                    "unknown",
                  parents: (c.parents || []).map((p) => p.sha),
                  branches: new Set([brName]),
                  date: (c.commit?.author?.date || c.commit?.committer?.date) || null,
                });
              } else {
                commitMap.get(c.sha).branches.add(brName);
              }
              collected++;
              if (collected >= maxCommitsPerBranch) break outer;
            }
            if (commits.length < 100) break;
            page++;
          }
        }

        const nodes = [];
        for (const [, info] of commitMap) {
          const branchNames = Array.from(info.branches).join(", ");
          nodes.push({
            id: info.sha,
            data: {
              label: info.message,
              author: info.author,
              branch: branchNames,
              date: info.date,
            },
            position: { x: 0, y: 0 },
            style: { width: NODE_WIDTH, height: NODE_HEIGHT },
          });

          for (const parentSha of info.parents) {
            edges.push({
              id: `e-${parentSha}-${info.sha}`,
              source: parentSha,
              target: info.sha,
              animated: false,
              markerEnd: { type: MarkerType.Arrow, color: "#aaa" },
            });
          }
        }

        const { nodes: layoutNodes, edges: layoutEdges } = getDagreLayout(nodes, edges, "TB");

        if (!mounted) return;
        setElements({ nodes: layoutNodes, edges: layoutEdges });
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || String(err));
          setLoading(false);
        }
      }
    }

    fetchGraph();
    return () => {
      mounted = false;
    };
  }, [owner, repo, ghToken, maxCommitsPerBranch]);

  function FitViewOnLoad() {
    const instance = useReactFlow();
    useEffect(() => {
      if (elements.nodes.length) {
        instance.fitView({ padding: 0.1 });
      }
    }, [elements, instance]);
    return null;
  }

  const nodeStyle = {
    borderRadius: 8,
    padding: 8,
    background: "#1e1e1e",
    border: "1px solid #444",
    color: "#fff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  };

  const renderNode = (node) => {
    const branches = (node.data.branch || "").split(", ").filter(Boolean);
    return (
      <div style={{ ...nodeStyle, borderLeft: `6px solid ${colorForBranch(branches[0] || "main")}` }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={node.data.label}
        >
          {node.data.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#bbb",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={node.data.author}
        >
          {node.data.author}
        </div>
        <div style={{ marginTop: 4, flexWrap: "wrap", display: "flex" }}>
          {branches.map((b) => (
            <span
              key={b}
              style={{
                background: colorForBranch(b),
                color: "#fff",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                marginRight: 4,
                marginTop: 2,
              }}
            >
              {b}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#777", marginTop: 4 }}>
          {node.data.date}
        </div>
      </div>
    );
  };

  // Render dropdown menu
  const renderDropdownMenu = () => (
    <div 
      className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(13,13,13,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(168,85,247,0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 8px 32px rgba(168,85,247,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="p-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-2 mb-1">
          Workspace Features
        </div>
        {workspaceFeatures.map((feature) => {
          const Icon = feature.icon;
          const isHovered = hoveredItem === feature.id;
          const isActive = feature.isActive;
          
          return (
            <button
              key={feature.id}
              onClick={() => handleWorkspaceFeatureClick(feature)}
              onMouseEnter={() => handleMouseEnter(feature.id)}
              onMouseLeave={handleMouseLeave}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{
                background: isActive 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : isHovered 
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(59,130,246,0.15) 100%)'
                    : 'transparent',
                color: isActive ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#B3B3B3',
                boxShadow: isActive 
                  ? '0 4px 20px rgba(124,58,237,0.4)' 
                  : isHovered 
                    ? '0 2px 10px rgba(168,85,247,0.2)'
                    : 'none',
                transform: isHovered && !isActive ? 'translateX(2px)' : 'translateX(0px)',
              }}
            >
              {/* Background glow effect on hover */}
              {isHovered && !isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-100 transition-opacity duration-300"></div>
              )}
              
              <Icon 
                size={18} 
                className={`mr-3 relative z-10 transition-all duration-200 ${
                  isHovered ? 'transform scale-110' : ''
                }`} 
              />
              <span className="text-sm font-medium relative z-10">{feature.name}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse relative z-10"></div>
              )}
              
              {/* Hover indicator for non-active items */}
              {isHovered && !isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 opacity-75 relative z-10"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#121212", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#FFFFFF' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: showWorkspaceDropdown 
                  ? '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 4px 20px rgba(168,85,247,0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 relative z-10 ${showWorkspaceDropdown ? 'rotate-180 text-purple-300' : 'text-white'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && renderDropdownMenu()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading commit graph…
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#121212", color: "red", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#FFFFFF' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: showWorkspaceDropdown 
                  ? '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 4px 20px rgba(168,85,247,0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 relative z-10 ${showWorkspaceDropdown ? 'rotate-180 text-purple-300' : 'text-white'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && renderDropdownMenu()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Error: {error}
      </div>
    </div>
  );

  if (!elements.nodes.length) return (
    <div style={{ minHeight: "100vh", background: "#121212", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#FFFFFF' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: showWorkspaceDropdown 
                  ? '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 4px 20px rgba(168,85,247,0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 relative z-10 ${showWorkspaceDropdown ? 'rotate-180 text-purple-300' : 'text-white'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && renderDropdownMenu()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No commits found
      </div>
    </div>
  );

  const rfNodes = elements.nodes.map((n) => ({
    id: n.id,
    type: "default",
    position: n.position,
    data: { ...n.data, label: renderNode(n) },
    style: { width: NODE_WIDTH, height: NODE_HEIGHT, padding: 0, border: "none" },
  }));

  const rfEdges = elements.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated || false,
    markerEnd: { type: MarkerType.Arrow, color: "#aaa" },
    style: { stroke: "#666", strokeWidth: 1.2 },
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#121212", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#FFFFFF' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: showWorkspaceDropdown 
                  ? '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 4px 20px rgba(168,85,247,0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 relative z-10 ${showWorkspaceDropdown ? 'rotate-180 text-purple-300' : 'text-white'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && renderDropdownMenu()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content - ReactFlow Graph */}
      <div style={{ flex: 1, padding: "20px" }}>
        <div style={{ height: "700px", background: "#121212", border: "1px solid #333", borderRadius: 8, overflow: "hidden" }}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <FitViewOnLoad />
            <Controls style={{ background: "#222", color: "#fff" }} />
            <MiniMap
              nodeStrokeColor={(n) => {
                const branch = (n.data?.branch || "").split(",")[0] || "main";
                return colorForBranch(branch);
              }}
              nodeColor={() => "#222"}
              maskColor="rgba(255,255,255,0.05)"
            />
            <Background gap={16} color="#333" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
