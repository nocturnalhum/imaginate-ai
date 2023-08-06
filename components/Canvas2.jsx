import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs.js';
import { useCanvasContext } from '@/contextAPI/context';
import {
  createShape,
  getElementAtPosition,
  updateElement,
} from '@/utils/createShape';

const generator = rough.generator();

export default function Canvas({ elementRef }) {
  const [action, setAction] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
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
    //  RoughJS Canvas
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughShape }) => roughCanvas.draw(roughShape));

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

  // ==========================================================================
  // =============<<< MouseDown >>>============================================
  // ==========================================================================
  const handleMouseDown = (e) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    console.log('OffsetX, offsetY', x, y);
    if (tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        const offsetX = x - element.x1;
        const offsetY = y - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction('moving');
      }
    } else {
      const id = elements.length;
      const element = createShape(
        id,
        x,
        y,
        x,
        y,
        tool,
        radius,
        isShiftPressed.current
      );
      setElements((prev) => [...prev, element]);
      setAction('draw');
    }
  };

  // ==========================================================================
  // =============<<< MouseMove >>>============================================
  // ==========================================================================
  const handleMouseMove = (e) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;

    // Set cursor to 'move' when hovering over movable element
    if (tool === 'selection') {
      e.target.style.cursor = getElementAtPosition(x, y, elements)
        ? 'move'
        : 'default';
    }

    if (action === 'draw') {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      console.log('OffsetX-2, offsetY-2', x, y);
      console.log('x1, y1', x1, y1);
      // When isShiftPressed, rectangles and ellipses will be restricted to 1:1 ratio
      const id = elements.length;
      const updatedShape = createShape(
        id,
        x1,
        y1,
        x,
        y,
        tool,
        radius,
        isShiftPressed.current
      );
      updateElement(
        elements,
        setElements,
        index,
        x1,
        y1,
        x,
        y,
        tool,
        radius,
        isShiftPressed.current
      );
    } else if (action === 'moving') {
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      console.log('x1, x2, y1, y2', x1, x2, y1, y2);
      console.log('x, y', x, y);
      console.log('width, height', width, height);
      const updateX = x - offsetX;
      const updateY = y - offsetY;
      updateElement(
        elements,
        setElements,
        id,
        updateX,
        updateY,
        updateX + width,
        updateY + height,
        type,
        elements[id].roughShape.options.strokeWidth,
        isShiftPressed.current
      );
    }
  };

  // ==========================================================================
  // =============<<< MouseUp and MouseOut >>>=================================
  // ==========================================================================
  const handleMouseUp = () => {
    setAction('none');
    setSelectedElement(null);
  };

  const handleMouseOut = () => {
    if (action) {
      setAction('none');
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
    setAction(true);
  };

  const handleTouchMove = (e) => {
    if (!action) return;
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
