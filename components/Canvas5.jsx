import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs.js';
import { useCanvasContext } from '@/contextAPI/context';
import {
  adjustElementCoord,
  adjustmentReqiured,
  createShape,
  cursorForPosition,
  drawElement,
  getElementAtPosition,
  resizedCoords,
  updateElement,
} from '@/utils/elementUtilities';

const generator = rough.generator();

export default function Canvas({ elementRef }) {
  const [action, setAction] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const { tool, elements, setElements, radius } = useCanvasContext();
  const { canvasRef } = useCanvasContext();
  const isShiftPressed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    //  Initialize RoughJS Canvas
    const roughCanvas = rough.canvas(canvas);
    elements.forEach((element) => drawElement(roughCanvas, ctx, element));

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
    if (action === 'writing') return;

    const { offsetX: x, offsetY: y } = e.nativeEvent;
    if (tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        if (element.type === 'pen') {
          const xOffsets = element.points.map((point) => x - point.x);
          const yOffsets = element.points.map((point) => y - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = x - element.x1;
          const offsetY = y - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prev) => prev);

        if (element.position === 'inside') {
          setAction('moving');
        } else {
          setAction('resizing');
        }
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
      setSelectedElement(element);
      setAction(tool === 'text' ? 'writing' : 'draw');
    }
  };

  // ==========================================================================
  // =============<<< MouseMove >>>============================================
  // ==========================================================================
  const handleMouseMove = (e) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;

    // Set cursor to 'move' when hovering over movable element
    if (tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      e.target.style.cursor = element
        ? cursorForPosition(element.position)
        : 'default';
    }

    if (action === 'draw') {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      // When isShiftPressed, rectangles and ellipses will be restricted to 1:1 ratio
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
      if (selectedElement.type === 'pen') {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: x - selectedElement.xOffsets[index],
          y: y - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
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
    } else if (action === 'resizing') {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoords(x, y, position, coordinates);
      updateElement(
        elements,
        setElements,
        id,
        x1,
        y1,
        x2,
        y2,
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
    if (!selectedElement) return;
    const index = selectedElement.id;
    console.log('Elements-index', elements[index]);

    const { id, type, roughShape } = elements[index];
    if (
      (action === 'draw' || action === 'resizing') &&
      adjustmentReqiured(type)
    ) {
      const { x1, y1, x2, y2 } = adjustElementCoord(elements[index]);
      updateElement(
        elements,
        setElements,
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        roughShape.options.strokeWidth,
        isShiftPressed.current
      );
    }
    setAction('none');
    setSelectedElement(null);
  };

  // =============================================================================
  // =============<<< Touch Events >>>===========================================
  // =============================================================================
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent iOS magnifying glass from popping up while drawing
    const { touches } = e;
    const { clientX, clientY } = touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        const offsetX = x - element.x1;
        const offsetY = y - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setElements((prev) => prev);
        if (element.position === 'inside') {
          setAction('moving');
        } else {
          setAction('resizing');
        }
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
      setSelectedElement(element);
      setAction('draw');
    }
  };

  const handleTouchMove = (e) => {
    // Prevent default touch behavior to avoid conflicts
    e.preventDefault();

    const { clientX, clientY } = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Set cursor to 'move' when hovering over movable element
    if (tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      e.target.style.cursor = element
        ? cursorForPosition(element.position)
        : 'default';
    }

    if (action === 'draw') {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];

      // When isShiftPressed, rectangles and ellipses will be restricted to 1:1 ratio
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
    } else if (action === 'resizing') {
      console.log('Resizing', selectedElement);
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoords(x, y, position, coordinates);
      updateElement(
        elements,
        setElements,
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        elements[id].roughShape.options.strokeWidth,
        isShiftPressed.current
      );
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      // onMouseOut={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className='bg-white h-full w-full rounded-xl select-none touch-none cursor-crosshair'
    />
  );
}
