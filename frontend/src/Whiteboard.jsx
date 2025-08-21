import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { io } from "socket.io-client";
import { SketchPicker } from "react-color";
import {
  FaPen,
  FaMousePointer,
  FaSquare,
  FaCircle,
  FaStickyNote,
  FaArrowsAlt,
  FaTrash,
  FaSave,
  FaShareAlt,
  FaPlay,
  FaDrawPolygon,
  FaFont,
  FaLongArrowAltRight,
} from "react-icons/fa";

const SOCKET_URL = "http://localhost:3000";
const theme = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  primary: "#A259FF",
  accent: "#7C3AED",
  text: "#FFFFFF",
  mutedText: "#B3B3B3",
  danger: "#EF4444",
};

/* --- small id generator for objects/arrows --- */
let _idCounter = 1;
function generateId(prefix = "obj") {
  _idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${_idCounter}`;
}

/* --- geometry helpers --- */
function getBoundingRect(obj) {
  // canvas-space bounding rect (with transforms applied)
  return obj.getBoundingRect(true);
}
function getCenter(obj) {
  const c = obj.getCenterPoint();
  return { x: c.x, y: c.y };
}

// returns intersection point of ray from (cx,cy) -> (px,py) with rect boundary
function lineRectIntersection(cx, cy, px, py, rect) {
  const dx = px - cx;
  const dy = py - cy;
  const candidates = [];

  // vertical edges
  if (dx !== 0) {
    const tLeft = (rect.left - cx) / dx;
    const yLeft = cy + tLeft * dy;
    if (tLeft >= 0 && yLeft >= rect.top - 0.0001 && yLeft <= rect.top + rect.height + 0.0001) {
      candidates.push({ t: tLeft, x: rect.left, y: yLeft });
    }
    const tRight = (rect.left + rect.width - cx) / dx;
    const yRight = cy + tRight * dy;
    if (tRight >= 0 && yRight >= rect.top - 0.0001 && yRight <= rect.top + rect.height + 0.0001) {
      candidates.push({ t: tRight, x: rect.left + rect.width, y: yRight });
    }
  }

  // horizontal edges
  if (dy !== 0) {
    const tTop = (rect.top - cy) / dy;
    const xTop = cx + tTop * dx;
    if (tTop >= 0 && xTop >= rect.left - 0.0001 && xTop <= rect.left + rect.width + 0.0001) {
      candidates.push({ t: tTop, x: xTop, y: rect.top });
    }
    const tBottom = (rect.top + rect.height - cy) / dy;
    const xBottom = cx + tBottom * dx;
    if (tBottom >= 0 && xBottom >= rect.left - 0.0001 && xBottom <= rect.left + rect.width + 0.0001) {
      candidates.push({ t: tBottom, x: xBottom, y: rect.top + rect.height });
    }
  }

  if (candidates.length === 0) {
    return { x: cx, y: cy };
  }
  candidates.sort((a, b) => a.t - b.t);
  return { x: candidates[0].x, y: candidates[0].y };
}

/* ----------------- Component ----------------- */
export default function Whiteboard() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const socketRef = useRef(null);
  const myIdRef = useRef(null);

  const [color, setColor] = useState(theme.primary);
  const [brushSize, setBrushSize] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tool, setTool] = useState("draw"); // draw | select | arrow

  // arrow drawing transient state
  const arrowStateRef = useRef({
    drawing: false,
    fromObj: null,
    previewLine: null,
    previewHead: null,
    startPoint: null,
  });

  // serialize with IDs/arrow metadata so remote clients can rehydrate
  const serializeObject = (obj) => {
    if (!obj) return null;
    return obj.toObject([
      "left",
      "top",
      "width",
      "height",
      "radius",
      "scaleX",
      "scaleY",
      "angle",
      "fill",
      "stroke",
      "strokeWidth",
      "fontSize",
      "text",
      "path",
      "type",
      "originX",
      "originY",
      "id",
      "isShape",
      "isArrowPart",
      "arrowId",
      "fromId",
      "toId",
      "part",
    ]);
  };

  const addSerializedObjectToCanvas = (serialized) => {
    if (!serialized || !fabricRef.current) return;
    fabric.util.enlivenObjects([serialized], function (enlivenedObjs) {
      enlivenedObjs.forEach((obj) => {
        // prevent re-emitting
        obj.__fromRemote = true;
        fabricRef.current.add(obj);
        obj.setCoords();
      });
      // rebuild arrow mapping if needed (we'll maintain arrows map on-demand)
      fabricRef.current.requestRenderAll();
    });
  };

  useEffect(() => {
    if (fabricRef.current) return; // guard against re-init

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      myIdRef.current = socket.id;
    });

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: theme.background,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    // drawing brush
    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;

    // --- helpers for arrow bookkeeping on canvas instance ---
    canvas._arrows = {}; // arrowId => { lineId, headId, fromId, toId }

    const registerArrowParts = (lineObj, headObj, arrowId, fromId, toId) => {
      canvas._arrows[arrowId] = { lineId: lineObj.id, headId: headObj.id, fromId, toId };
    };

    const rebuildArrowsMap = () => {
      canvas._arrows = {};
      canvas.getObjects().forEach((o) => {
        if (o && o.isArrowPart && o.arrowId) {
          const a = canvas._arrows[o.arrowId] || { lineId: null, headId: null, fromId: o.fromId || null, toId: o.toId || null };
          if (o.part === "line") a.lineId = o.id;
          if (o.part === "head") a.headId = o.id;
          a.fromId = o.fromId || a.fromId;
          a.toId = o.toId || a.toId;
          canvas._arrows[o.arrowId] = a;
        }
      });
    };

    const findById = (id) => canvas.getObjects().find((o) => o.id === id);

    // update endpoints for a given arrow record
    const updateArrowPositions = (arrowId) => {
      const rec = canvas._arrows[arrowId];
      if (!rec) return;
      const line = findById(rec.lineId);
      const head = findById(rec.headId);
      const fromObj = findById(rec.fromId);
      const toObj = findById(rec.toId);
      if (!line || !head || !fromObj || !toObj) return;
      const fromCenter = getCenter(fromObj);
      const toCenter = getCenter(toObj);
      const fromRect = getBoundingRect(fromObj);
      const toRect = getBoundingRect(toObj);
      const startPoint = lineRectIntersection(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, fromRect);
      const endPoint = lineRectIntersection(toCenter.x, toCenter.y, fromCenter.x, fromCenter.y, toRect);

      line.set({ x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y });
      const angle = (Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180) / Math.PI;
      head.set({ left: endPoint.x, top: endPoint.y, angle: angle + 90 });
      line.setCoords();
      head.setCoords();
    };

    const updateArrowsForShape = (shapeId) => {
      if (!canvas._arrows) return;
      Object.keys(canvas._arrows).forEach((aId) => {
        const rec = canvas._arrows[aId];
        if (rec.fromId === shapeId || rec.toId === shapeId) {
          updateArrowPositions(aId);
        }
      });
      canvas.requestRenderAll();
    };

    // --- local -> server handlers ---
    const onPathCreated = (e) => {
      const path = e.path || e.target;
      if (!path) return;
      const serialized = serializeObject(path);
      socket.emit("object-added", { object: serialized });
    };

    const onObjectModified = (e) => {
      const obj = e.target;
      if (!obj) return;
      // when shapes move, update connected arrows
      if (obj.isShape) {
        updateArrowsForShape(obj.id);
      }
      const serialized = serializeObject(obj);
      socket.emit("object-modified", { object: serialized });
    };

    // Replace the previous object:added handler with skip for preview objects
    canvas.on("object:added", (e) => {
      const obj = e.target;
      if (!obj) return;
      // avoid re-emitting remote objects
      if (obj.__fromRemote) {
        delete obj.__fromRemote;
        // rebuild arrow map if remote created arrow parts
        if (obj.isArrowPart) rebuildArrowsMap();
        return;
      }
      // skip preview objects created during arrow-draw
      if (obj.__isPreview) {
        return;
      }
      // ensure shapes we create have ids/isShape
      if (!obj.id && obj.type !== "path" && obj.type !== "image") {
        // text/shape/line created via toolbar should have been assigned id by toolbar helpers,
        // but in case some path/other object is created, do nothing
      }
      const serialized = serializeObject(obj);
      socket.emit("object-added", { object: serialized });

      // if arrow parts added locally, map them
      if (obj.isArrowPart) rebuildArrowsMap();
    });

    canvas.on("path:created", onPathCreated);
    canvas.on("object:modified", onObjectModified);

    // --- server -> local handlers ---
    socket.on("object-added", (payload) => {
      try {
        if (payload?.senderId && payload.senderId === myIdRef.current) return;
        const serialized = payload.object;
        if (!serialized) return;
        fabric.util.enlivenObjects([serialized], function (objs) {
          objs.forEach((o) => {
            o.__fromRemote = true;
            canvas.add(o);
            o.setCoords();
          });
          rebuildArrowsMap();
          canvas.requestRenderAll();
        });
      } catch (err) {
        console.error("socket.object-added handling error:", err);
      }
    });

    socket.on("object-modified", (payload) => {
      try {
        if (payload?.senderId && payload.senderId === myIdRef.current) return;
        const serialized = payload.object;
        if (!serialized) return;
        fabric.util.enlivenObjects([serialized], function (objs) {
          objs.forEach((o) => {
            o.__fromRemote = true;
            canvas.add(o);
            o.setCoords();
          });
          rebuildArrowsMap();
          canvas.requestRenderAll();
        });
      } catch (err) {
        console.error("socket.object-modified handling error:", err);
      }
    });

    socket.on("canvas-data", (data) => {
      try {
        if (!data) return;
        if (data.objects && Array.isArray(data.objects)) {
          if (canvas.getObjects().length === 0) {
            canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
          } else {
            data.objects.forEach((obj) => addSerializedObjectToCanvas(obj));
          }
        } else {
          canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
        }
      } catch (err) {
        console.error("canvas-data handling err:", err);
      }
    });

    /* ---------------- Arrow interaction ---------------- */
    const onMouseDown = (opt) => {
      if (tool !== "arrow") return;
      const evt = opt.e;
      const pointer = canvas.getPointer(evt, true);
      const target = opt.target;
      // we only start from a "shape"
      if (target && target.isShape) {
        arrowStateRef.current.drawing = true;
        arrowStateRef.current.fromObj = target;
        // compute start point on target edge toward pointer
        const center = getCenter(target);
        const rect = getBoundingRect(target);
        const startP = lineRectIntersection(center.x, center.y, pointer.x, pointer.y, rect);
        arrowStateRef.current.startPoint = startP;

        // preview line + head (do not emit preview objects)
        const pl = new fabric.Line([startP.x, startP.y, startP.x, startP.y], {
          stroke: color,
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });
        pl.__isPreview = true;
        const ph = new fabric.Triangle({
          left: startP.x,
          top: startP.y,
          originX: "center",
          originY: "center",
          width: 12,
          height: 12,
          angle: 0,
          fill: color,
          selectable: false,
          evented: false,
        });
        ph.__isPreview = true;
        arrowStateRef.current.previewLine = pl;
        arrowStateRef.current.previewHead = ph;
        canvas.add(pl);
        canvas.add(ph);
        canvas.requestRenderAll();
      }
    };

    const onMouseMove = (opt) => {
      if (tool !== "arrow") return;
      if (!arrowStateRef.current.drawing) return;
      const evt = opt.e;
      const pointer = canvas.getPointer(evt, true);
      const pl = arrowStateRef.current.previewLine;
      const ph = arrowStateRef.current.previewHead;
      if (!pl || !ph) return;
      pl.set({ x2: pointer.x, y2: pointer.y });
      const angle = Math.atan2(pointer.y - pl.y1, pointer.x - pl.x1) * (180 / Math.PI);
      ph.set({ left: pointer.x, top: pointer.y, angle: angle + 90 });
      pl.setCoords();
      ph.setCoords();
      canvas.requestRenderAll();
    };

    const onMouseUp = (opt) => {
      if (tool !== "arrow") return;
      if (!arrowStateRef.current.drawing) return;
      const evt = opt.e;
      const pointer = canvas.getPointer(evt, true);
      const target = opt.target;
      const fromObj = arrowStateRef.current.fromObj;

      // remove preview
      const pl = arrowStateRef.current.previewLine;
      const ph = arrowStateRef.current.previewHead;
      if (pl && canvas.contains(pl)) canvas.remove(pl);
      if (ph && canvas.contains(ph)) canvas.remove(ph);

      // success: released on a different shape
      if (target && target.isShape && fromObj && target !== fromObj) {
        const fromCenter = getCenter(fromObj);
        const toCenter = getCenter(target);
        const fromRect = getBoundingRect(fromObj);
        const toRect = getBoundingRect(target);
        const startPoint = lineRectIntersection(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, fromRect);
        const endPoint = lineRectIntersection(toCenter.x, toCenter.y, fromCenter.x, fromCenter.y, toRect);

        // create arrow parts with ids & metadata
        const arrowId = generateId("arrow");
        const lineId = generateId("o");
        const headId = generateId("o");
        const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
          stroke: color,
          strokeWidth: 2,
          selectable: true,
          hasControls: false,
          id: lineId,
          isArrowPart: true,
          arrowId,
          fromId: fromObj.id,
          toId: target.id,
          part: "line",
        });
        const angle = (Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180) / Math.PI;
        const head = new fabric.Triangle({
          left: endPoint.x,
          top: endPoint.y,
          originX: "center",
          originY: "center",
          width: 12,
          height: 12,
          angle: angle + 90,
          fill: color,
          selectable: true,
          id: headId,
          isArrowPart: true,
          arrowId,
          fromId: fromObj.id,
          toId: target.id,
          part: "head",
        });

        // add and register
        canvas.add(line);
        canvas.add(head);
        registerArrowParts(line, head, arrowId, fromObj.id, target.id);

        // emit both parts (object:added handler will emit each)
      }

      // reset arrow state
      arrowStateRef.current = { drawing: false, fromObj: null, previewLine: null, previewHead: null, startPoint: null };
      canvas.requestRenderAll();
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    // update arrows as shapes move/rotate/scale
    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (obj && obj.isShape) {
        updateArrowsForShape(obj.id);
      }
    });
    canvas.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj && obj.isShape) {
        updateArrowsForShape(obj.id);
      }
    });
    canvas.on("object:rotating", (e) => {
      const obj = e.target;
      if (obj && obj.isShape) {
        updateArrowsForShape(obj.id);
      }
    });
    canvas.on("object:removed", () => rebuildArrowsMap());

    // keyboard escape to cancel arrow preview
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (tool === "arrow") setTool("select");
        const st = arrowStateRef.current;
        if (st.previewLine && canvas.contains(st.previewLine)) canvas.remove(st.previewLine);
        if (st.previewHead && canvas.contains(st.previewHead)) canvas.remove(st.previewHead);
        arrowStateRef.current = { drawing: false, fromObj: null, previewLine: null, previewHead: null, startPoint: null };
        canvas.requestRenderAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // cleanup on unmount
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      try {
        socket.off("object-added");
        socket.off("object-modified");
        socket.off("canvas-data");
        socket.disconnect();
      } catch (e) {}
      try {
        canvas.off("mouse:down", onMouseDown);
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        canvas.off("path:created", onPathCreated);
        canvas.off("object:modified", onObjectModified);
        canvas.dispose();
      } catch (e) {}
      fabricRef.current = null;
      socketRef.current = null;
    };
  }, []); // run once

  // keep brush in sync
  useEffect(() => {
    if (!fabricRef.current) return;
    const c = fabricRef.current;
    if (!c.freeDrawingBrush) c.freeDrawingBrush = new fabric.PencilBrush(c);
    c.freeDrawingBrush.color = color;
    c.freeDrawingBrush.width = brushSize;
  }, [color, brushSize]);

  /* ----------------- Tool helpers & shape creators ----------------- */

  const setDrawingMode = () => {
    if (!fabricRef.current) return;
    fabricRef.current.isDrawingMode = true;
    setTool("draw");
  };

  const setSelectMode = () => {
    if (!fabricRef.current) return;
    fabricRef.current.isDrawingMode = false;
    setTool("select");
  };

  const toggleArrowMode = () => {
    if (!fabricRef.current) return;
    fabricRef.current.isDrawingMode = false;
    setTool((t) => (t === "arrow" ? "select" : "arrow"));
  };

  // Add shapes with id and isShape flag so connectors can reference them
  const addShapeWithId = (obj) => {
    obj.id = generateId("o");
    obj.isShape = true;
    obj.hasControls = true;
    // outline mode by default for shapes
    if (obj.type === "rect" || obj.type === "circle" || obj.type === "triangle" || obj.type === "ellipse") {
      obj.fill = obj.fill || "transparent";
      obj.stroke = obj.stroke || color;
      if (!obj.strokeWidth) obj.strokeWidth = 2;
    }
    fabricRef.current.add(obj);
    obj.setCoords();
    fabricRef.current.requestRenderAll();
  };

  const addRectangle = () =>
    addShapeWithId(new fabric.Rect({ left: 120, top: 80, fill: "transparent", stroke: color, strokeWidth: 2, width: 120, height: 80 }));
  const addCircle = () =>
    addShapeWithId(new fabric.Circle({ left: 160, top: 140, fill: "transparent", stroke: color, strokeWidth: 2, radius: 50 }));
  const addTriangle = () =>
    addShapeWithId(new fabric.Triangle({ left: 200, top: 100, fill: "transparent", stroke: color, strokeWidth: 2, width: 100, height: 100 }));
  const addEllipse = () =>
    addShapeWithId(new fabric.Ellipse({ left: 250, top: 150, rx: 80, ry: 40, fill: "transparent", stroke: color, strokeWidth: 2 }));
  const addLine = () => addShapeWithId(new fabric.Line([50, 100, 200, 100], { stroke: color, strokeWidth: 2 }));

  const addText = () =>
    addShapeWithId(new fabric.Textbox("Your text here", { left: 200, top: 200, fontSize: 16, fill: color, backgroundColor: "transparent" }));

  const addStickyNote = () =>
    addShapeWithId(new fabric.Textbox("Note", { left: 200, top: 200, width: 140, fontSize: 16, fill: "#000000", backgroundColor: "#FFF2A7", padding: 8 }));

  const clearCanvas = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.setBackgroundColor(theme.background, () => {
      fabricRef.current.requestRenderAll();
    });
    if (socketRef.current) {
      socketRef.current.emit("canvas-cleared");
    }
  };

  const savePNG = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = data;
    a.download = "whiteboard.png";
    a.click();
  };

  const share = () => {
    alert("Share link copied (implement backend share link generation).");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: theme.background,
        color: theme.text,
        overflow: "hidden",
        fontFamily: "Inter, Roboto, system-ui, sans-serif",
      }}
    >
      {/* LEFT TOOLBAR */}
      <div
        style={{
          width: 72,
          background: theme.card,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ marginBottom: 6, color: theme.mutedText, fontSize: 12 }}>TOOLS</div>

        <button title="Draw" onClick={setDrawingMode} style={iconBtnStyle(tool === "draw")}>
          <FaPen size={18} />
        </button>

        <button title="Select/Move" onClick={setSelectMode} style={iconBtnStyle(tool === "select")}>
          <FaMousePointer size={18} />
        </button>

        <div style={{ height: 8 }} />

        <button title="Rectangle" onClick={addRectangle} style={iconBtnStyle(false)}>
          <FaSquare size={16} />
        </button>

        <button title="Circle" onClick={addCircle} style={iconBtnStyle(false)}>
          <FaCircle size={16} />
        </button>

        <button title="Triangle" onClick={addTriangle} style={iconBtnStyle(false)}>
          <FaPlay size={16} />
        </button>

        <button title="Ellipse" onClick={addEllipse} style={iconBtnStyle(false)}>
          <FaDrawPolygon size={16} />
        </button>

        <button title="Line" onClick={addLine} style={iconBtnStyle(false)}>
          /
        </button>

        <button title="Arrow (click shape -> drag -> release on another shape)" onClick={toggleArrowMode} style={iconBtnStyle(tool === "arrow")}>
          <FaLongArrowAltRight size={16} />
        </button>

        <button title="Text" onClick={addText} style={iconBtnStyle(false)}>
          <FaFont size={16} />
        </button>

        <button title="Sticky note" onClick={addStickyNote} style={iconBtnStyle(false)}>
          <FaStickyNote size={16} />
        </button>

        <div style={{ height: 8 }} />

        <button title="Clear board" onClick={clearCanvas} style={iconBtnStyle(false, theme.danger)}>
          <FaTrash size={16} />
        </button>

        <button title="Save PNG" onClick={savePNG} style={iconBtnStyle(false)}>
          <FaSave size={16} />
        </button>

        <button title="Share" onClick={share} style={iconBtnStyle(false)}>
          <FaShareAlt size={16} />
        </button>

        {/* Color preview */}
        <div
          title="Brush color"
          onClick={() => setShowColorPicker((v) => !v)}
          style={{
            marginTop: 8,
            width: 34,
            height: 34,
            borderRadius: 8,
            background: color,
            border: `2px solid ${theme.text}`,
            cursor: "pointer",
          }}
        />

        {/* Brush size */}
        <input
          title="Brush size"
          style={{ width: 40, marginTop: 6 }}
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>

      {/* COLOR PICKER (floating) */}
      {showColorPicker && (
        <div style={{ position: "absolute", left: 86, top: 80, zIndex: 40 }}>
          <SketchPicker
            color={color}
            onChange={(c) => {
              setColor(c.hex);
            }}
          />
        </div>
      )}

      {/* CANVAS AREA */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar (minimal) */}
        <div
          style={{
            height: 56,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 12,
          }}
        >
          <div style={{ color: theme.text, fontWeight: 600, fontSize: 16 }}>Collaborative Whiteboard</div>
          <div style={{ color: theme.mutedText, fontSize: 13 }}>Real-time · Team</div>
          <div style={{ marginLeft: "auto", color: theme.mutedText, fontSize: 13 }}>
            Brush: <strong style={{ color }}>{brushSize}px</strong>
          </div>
        </div>

        {/* Canvas wrapper to allow responsive resizing */}
        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={Math.max(window.innerWidth - 72, 800)}
            height={Math.max(window.innerHeight - 56, 600)}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              cursor: tool === "draw" ? "crosshair" : tool === "arrow" ? "crosshair" : "default",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* small helper for toolbar button styling */
function iconBtnStyle(active = false, color = null) {
  const base = {
    width: 44,
    height: 44,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: active ? "linear-gradient(180deg, rgba(162,89,255,0.18), rgba(124,58,237,0.08))" : "transparent",
    color: color || "#FFFFFF",
    cursor: "pointer",
  };
  return base;
}
