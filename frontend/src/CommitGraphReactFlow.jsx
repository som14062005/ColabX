import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

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
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [error, setError] = useState(null);

  const ghToken = token || process.env.REACT_APP_GITHUB_TOKEN || "";

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

  if (loading) return <div style={{ color: "#fff" }}>Loading commit graph…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!elements.nodes.length) return <div style={{ color: "#fff" }}>No commits found</div>;

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
  );
}

