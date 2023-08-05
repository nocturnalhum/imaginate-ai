import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs.js';
import { useCanvasContext } from '@/contextAPI/context';
import restoreCanvasState from '@/utils/restoreCanvasState';
import { createShape } from '@/utils/drawElement';

const generator = rough.generator();

export default function Canvas({ elementRef }) {
  const [isDrawing, setIsDrawing] = useState(false);

  const { canvasRef } = useCanvasContext();
  const contextRef = useRef();

  const {
    color,
    radius,
    setActions,
    currentPosition,
    setCurrentPosition,
    shape,
    setShape,
    elements,
    setElements,
  } = useCanvasContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;

    const ctx = canvas.getContext('2d');

    // ============================================================================
    // =========<<< RoughJS Canvas >>>=============================================
    // ============================================================================
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughShape }) => roughCanvas.draw(roughShape));
    // ============================================================================

    contextRef.current = ctx;

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
    const element = createShape(x, y, x, y, shape);
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
    const updatedShape = createShape(x1, y1, x, y, shape);

    const elementsCopy = [...elements];
    elementsCopy[index] = updatedShape;
    setElements(elementsCopy);
  };

  // ============================================================================
  // =============<<< Mouse Events >>>===========================================
  // ============================================================================
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;

    const element = createShape(offsetX, offsetY, offsetX, offsetY, shape);
    setElements((prev) => [...prev, element]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    // ctx.lineTo(x, y);
    // ctx.stroke();
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedShape = createShape(x1, y1, x, y, shape);

    const elementsCopy = [...elements];
    elementsCopy[index] = updatedShape;
    setElements(elementsCopy);
  };

  const handleMouseUp = () => {
    // const drawing = canvas.toDataURL('image/png');
    // localStorage.setItem('drawing', drawing);
    // ctx.closePath();
    setIsDrawing(false);
  };

  const handleMouseOut = () => {
    if (isDrawing) {
      // const drawing = canvas.toDataURL('image/png');
      // localStorage.setItem('drawing', drawing);
      // ctx.closePath();
      setIsDrawing(false);
    }
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
