import React, { useEffect, useRef, useState } from 'react';
import { useCanvasContext } from '@/contextAPI/context';

export default function Canvas() {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef();
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

    contextRef.current = ctx;
  }, [color, radius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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

      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;

      const { touches } = e;
      const { pageX, pageY } = touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = pageX - rect.left;
      const y = pageY - rect.top;
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    };

    const handleTouchEnd = () => {
      const drawing = canvasRef.current.toDataURL('image/png');
      localStorage.setItem('drawing', drawing);
      contextRef.current.closePath();
      setIsDrawing(false);
      addAction(drawing);
      console.log('Current Position Set:', currentPosition);
    };

    // ============================================================================
    // =============<<< Mouse Events >>>===========================================
    // ============================================================================
    const handleMouseDown = (e) => {
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    };

    const handleMouseUp = () => {
      const drawing = canvasRef.current.toDataURL('image/png');
      localStorage.setItem('drawing', drawing);
      contextRef.current.closePath();
      setIsDrawing(false);
    };

    const handleMouseOut = () => {
      if (isDrawing) {
        const drawing = canvasRef.current.toDataURL('image/png');
        localStorage.setItem('drawing', drawing);
        contextRef.current.closePath();
        setIsDrawing(false);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isDrawing, currentPosition]);

  return (
    <canvas
      ref={canvasRef}
      className='bg-gray-100 h-full w-full rounded-xl select-none'
    />
  );
}
