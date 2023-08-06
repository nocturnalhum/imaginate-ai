import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs.js';
import { useCanvasContext } from '@/contextAPI/context';
import restoreCanvasState from '@/utils/restoreCanvasState';
import { createElement } from '@/utils/elementUtilities';

const generator = rough.generator();

export default function Canvas({ elementRef }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const { canvasRef } = useCanvasContext();
  const contextRef = useRef();

  const { color, radius, setActions, currentPosition, setCurrentPosition } =
    useCanvasContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;

    const ctx = canvas.getContext('2d');
    // Set the background color to white
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = radius;

    // ============================================================================
    // =========<<< RoughJS Canvas >>>=============================================
    // ============================================================================
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
    // const rect = generator.rectangle(10, 10, 100, 500);
    // const line = generator.line(10, 10, 110, 100);
    // roughCanvas.draw(rect);
    // roughCanvas.draw(line);
    // ============================================================================

    contextRef.current = ctx;
    restoreCanvasState(ctx);

    const resize = () => {
      ctx.canvas.width = elementRef.current.clientWidth;
      ctx.canvas.height = elementRef.current.clientHeight;
      ctx.canvas.style.width = `${elementRef.current.clientWidth}px`;
      ctx.canvas.style.height = `${elementRef.current.clientHeight}px`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = radius;
      restoreCanvasState(ctx);
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef, elementRef, color, radius, elements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    // ============================================================================
    // =============<<< Touch Events >>>===========================================
    // ============================================================================
    const handleTouchStart = (e) => {
      e.preventDefault(); // Prevent iOS magnifying glass from popping up while drawing
      const { touches } = e;
      const { pageX, pageY } = touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = pageX - rect.left;
      const y = pageY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;
      const { touches } = e;
      const { pageX, pageY } = touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = pageX - rect.left;
      const y = pageY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    // ============================================================================
    // =============<<< Mouse Events >>>===========================================
    // ============================================================================
    const handleMouseDown = (e) => {
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      const element = createElement(clientX, clientY, clientX, clientY);
      setElements((prevState) => [...prevState, element]);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      const updatedElement = createElement(x1, y1, clientX, clientY);
      const elementsCopy = [...elements];
      elementsCopy[index] = updatedElement;
      setElements(elementsCopy);
    };

    const handleMouseUp = () => {
      const drawing = canvas.toDataURL('image/png');
      localStorage.setItem('drawing', drawing);
      ctx.closePath();
      setIsDrawing(false);
    };

    const handleMouseOut = () => {
      if (isDrawing) {
        const drawing = canvas.toDataURL('image/png');
        localStorage.setItem('drawing', drawing);
        ctx.closePath();
        setIsDrawing(false);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleMouseUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUp);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseOut);
    };
  }, [canvasRef, isDrawing, currentPosition, elements]);

  return (
    <canvas
      ref={canvasRef}
      className='bg-gray-100 h-full w-full rounded-xl select-none'
    />
  );
}
