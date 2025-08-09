// src/Whiteboard.jsx
import React, { useRef, useState, useEffect } from "react";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 150;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctxRef.current.closePath();
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-center text-3xl font-bold mb-4 text-purple-400">
        Collaborative Whiteboard (Local Demo)
      </h1>

      {/* Controls */}
      <div className="flex gap-4 mb-4 justify-center">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            ctxRef.current.strokeStyle = e.target.value;
          }}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => {
            setLineWidth(e.target.value);
            ctxRef.current.lineWidth = e.target.value;
          }}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="bg-gray-800 border border-gray-600 rounded-lg"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
    </div>
  );
};

export default Whiteboard;
