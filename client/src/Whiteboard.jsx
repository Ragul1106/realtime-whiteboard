import React, { useRef, useEffect, useState } from "react";
import socket from "./socket";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socket.on("draw", ({ x0, y0, x1, y1 }) => {
      drawLine(x0, y0, x1, y1, ctx);
    });

    return () => socket.off("draw");
  }, []);

  const drawLine = (x0, y0, x1, y1, ctx, emit = false) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    if (emit) {
      socket.emit("draw", { x0, y0, x1, y1 });
    }
  };

  const getMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  let last = useRef({ x: 0, y: 0 });

  const startDrawing = (e) => {
    setDrawing(true);
    last.current = getMouse(e);
  };

  const stopDrawing = () => setDrawing(false);

  const draw = (e) => {
    if (!drawing) return;
    const current = getMouse(e);
    const ctx = canvasRef.current.getContext("2d");
    drawLine(last.current.x, last.current.y, current.x, current.y, ctx, true);
    last.current = current;
  };

  return (
    <canvas
      ref={canvasRef}
      width={1600}
      height={600}
      style={{ border: "2px solid black" }}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onMouseMove={draw}
    />
  );
};

export default Whiteboard;
