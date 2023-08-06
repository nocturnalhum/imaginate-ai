import rough from 'roughjs/bundled/rough.cjs.js';

const generator = rough.generator();

// ==========================================================================
// =============<<< CreateShape >>>==========================================
// ==========================================================================
export function createShape(id, x1, y1, x2, y2, type, radius, isShiftPressed) {
  let x2Adjusted = x2;
  let y2Adjusted = y2;

  if (isShiftPressed) {
    // Adjust x2 and y2 to ensure it draws a square or circle
    const width = x2 - x1;
    const height = y2 - y1;
    const maxDimension = Math.max(Math.abs(width), Math.abs(height));
    x2Adjusted = x1 + (width >= 0 ? maxDimension : -maxDimension);
    y2Adjusted = y1 + (height >= 0 ? maxDimension : -maxDimension);
  }

  const roughShape =
    type === 'line'
      ? generator.line(x1, y1, x2Adjusted, y2Adjusted, { strokeWidth: radius })
      : type === 'rectangle'
      ? generator.rectangle(x1, y1, x2Adjusted - x1, y2Adjusted - y1, {
          strokeWidth: radius,
        })
      : generator.ellipse(x1, y1, (x2 - x1) * 3, (y2 - y1) * 3, {
          strokeWidth: radius,
        });

  return { id, x1, y1, x2: x2Adjusted, y2: y2Adjusted, type, roughShape };
}

// ==========================================================================
// =============<<< GetElementAtPosition >>>=================================
// ==========================================================================
export function getElementAtPosition(x, y, elements) {
  return elements.find((element) => isWithinElement(x, y, element));
}

// ==========================================================================
// =============<<< IsWithinElement >>>======================================
// ==========================================================================
const isWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === 'rectangle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else if (type === 'line') {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1;
  } else if (type === 'ellipse') {
    // Calculate the horizontal and vertical radii of the ellipse
    const rx = Math.abs(x2 - x1);
    const ry = Math.abs(y2 - y1);

    // Calculate the center of the ellipse (which is x1, y1)
    const cx = x1;
    const cy = y1;

    // Check if the point (x, y) is within the ellipse using the ellipse equation
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }
};

// ==========================================================================
// =============<<< Distance >>>=============================================
// ==========================================================================
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// ==========================================================================
// =============<<< UpdateElement >>>========================================
// ==========================================================================
export const updateElement = (
  elements,
  setElements,
  id,
  x1,
  y1,
  x2,
  y2,
  type,
  radius,
  isShiftPressed
) => {
  const updateElement = createShape(
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    radius,
    isShiftPressed
  );
  const elementsCopy = [...elements];
  elementsCopy[id] = updateElement;
  setElements(elementsCopy);
};
