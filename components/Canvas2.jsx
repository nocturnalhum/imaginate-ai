import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs.js';
import { useCanvasContext } from '@/contextAPI/context';
import { createShape, getElementAtPosition } from '@/utils/createShape';

const generator = rough.generator();

export default function Canvas({ elementRef }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const { tool, elements, setElements, radius } = useCanvasContext();
  const { canvasRef } = useCanvasContext();
  const contextRef = useRef();
  const isShiftPressed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    contextRef.current = ctx;

    // ============================================================================
    // =========<<< RoughJS Canvas >>>=============================================
    // ============================================================================
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughShape }) => roughCanvas.draw(roughShape));
    // ============================================================================

    const resize = () => {
      ctx.canvas.width = elementRef.current.clientWidth;
      ctx.canvas.height = elementRef.current.clientHeight;
      ctx.canvas.style.width = `${elementRef.current.clientWidth}px`;
      ctx.canvas.style.height = `${elementRef.current.clientHeight}px`;
      elements.forEach(({ roughShape }) => roughCanvas.draw(roughShape));
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef, elementRef, elements]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        isShiftPressed.current = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        isShiftPressed.current = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ============================================================================
  // =============<<< Mouse Events >>>===========================================
  // ============================================================================
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    const element = createShape(x, y, x, y, tool, radius);
    setElements((prev) => [...prev, element]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];

    const updatedShape = createShape(
      x1,
      y1,
      x,
      y,
      tool,
      radius,
      isShiftPressed.current
    );
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedShape;
    setElements(elementsCopy);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseOut = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  // ============================================================================
  // =============<<< Touch Events >>>===========================================
  // ============================================================================
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent iOS magnifying glass from popping up while drawing
    const { touches } = e;
    const { clientX, clientY } = touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const element = createShape(x, y, x, y, tool, radius);
    setElements((prev) => [...prev, element]);
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    const { touches } = e;
    const { clientX, clientY } = touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedShape = createShape(x1, y1, x, y, tool, radius);
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedShape;
    setElements(elementsCopy);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className='bg-white h-full w-full rounded-xl select-none touch-none'
    />
  );
}
