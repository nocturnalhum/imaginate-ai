import getStroke from 'perfect-freehand';
import rough from 'roughjs/bundled/rough.cjs.js';

const generator = rough.generator();

export const adjustmentReqiured = (type) =>
  ['line', 'rectangle', 'ellipse'].includes(type);

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

  switch (type) {
    case 'line':
    case 'rectangle':
    case 'ellipse':
      const roughShape =
        type === 'line'
          ? generator.line(x1, y1, x2Adjusted, y2Adjusted, {
              strokeWidth: radius,
            })
          : type === 'rectangle'
          ? generator.rectangle(x1, y1, x2Adjusted - x1, y2Adjusted - y1, {
              strokeWidth: radius,
            })
          : generator.ellipse(
              x1,
              y1,
              (x2Adjusted - x1) * 3,
              (y2Adjusted - y1) * 3,
              {
                strokeWidth: radius,
              }
            );
      return { id, x1, y1, x2: x2Adjusted, y2: y2Adjusted, type, roughShape };
    case 'pen':
      return { id, type, points: [{ x: x1, y: y1 }], radius };
    default:
      throw new Error(`Tool not recognised: ${type}`);
  }
}

// ==========================================================================
// =============<<< DrawElement >>>==========================================
// ==========================================================================
export function drawElement(roughCanvas, context, element) {
  switch (element.type) {
    case 'line':
    case 'rectangle':
    case 'ellipse':
      roughCanvas.draw(element.roughShape);
      break;
    case 'pen':
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, {
          size: element.radius,
        })
      );
      context.fill(new Path2D(stroke));
      break;
    default:
      throw new Error(`Tool not recognised: ${element.type}`);
  }
}

const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
};

// ==========================================================================
// =============<<< GetElementAtPosition >>>=================================
// ==========================================================================
export function getElementAtPosition(x, y, elements) {
  let smallestAreaElement = null;
  let smallestArea = Number.MAX_SAFE_INTEGER;
  const withinElements = elements.map((element) => ({
    ...element,
    position: positionWithinElement(x, y, element),
  }));
  withinElements.map((element) => {
    if (element.position !== null) {
      const area = calculateElementArea(element);
      if (area < smallestArea) {
        smallestArea = area;
        smallestAreaElement = element;
      }
    }
  });
  return smallestAreaElement;
}

// ==========================================================================
// =============<<< CalculateElementArea >>>=================================
// ==========================================================================
const calculateElementArea = (element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === 'rectangle') {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return width * height;
  } else if (type === 'line' || type === 'pen') {
    return 0; // Lines have no area
  } else if (type === 'ellipse') {
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    return Math.PI * rx * ry;
  }
};

// ==========================================================================
// =============<<< PositionWithinElement >>>================================
// ==========================================================================
const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;

  switch (type) {
    case 'line':
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, 'start');
      const end = nearPoint(x, y, x2, y2, 'end');
      return start || end || on;
    case 'rectangle':
      const topLeft = nearPoint(x, y, x1, y1, 'tl');
      const topRight = nearPoint(x, y, x2, y1, 'tr');
      const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
      const bottomRight = nearPoint(x, y, x2, y2, 'br');
      const insideRect =
        x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;
      return topLeft || topRight || bottomLeft || bottomRight || insideRect;
    case 'ellipse':
      // Calculate the horizontal and vertical radii of the ellipse
      const rx = Math.abs(x2 - x1);
      const ry = Math.abs(y2 - y1);
      // The center of the ellipse (which is x1, y1)
      const cx = x1;
      const cy = y1;
      // Check if the point (x, y) is within the ellipse using the ellipse equation
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const insideEllipse = dx * dx + dy * dy <= 1.5 ? 'inside' : null;
      const onEllipse =
        dx * dx + dy * dy > 1.5 && dx * dx + dy * dy <= 2.5
          ? 'onEllipse'
          : null;
      return onEllipse || insideEllipse;
    case 'pen':
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return (
          onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
        );
      });
      return betweenAnyPoint ? 'inside' : null;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

// ==========================================================================
// =============<<< OnLine >>>===============================================
// ==========================================================================
const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? 'inside' : null;
};

// ==========================================================================
// =============<<< NearPoint >>>============================================
// ==========================================================================
const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

// ==========================================================================
// =============<<< Distance >>>=============================================
// ==========================================================================
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// ==========================================================================
// =============<<< CursorForPosition >>>====================================
// ==========================================================================
export const cursorForPosition = (position) => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    case 'onEllipse':
      return 'move';
    default:
      return 'grab';
  }
};

// ==========================================================================
// =============<<< AdjustElementCoord >>>===================================
// ==========================================================================
export const adjustElementCoord = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === 'rectangle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else if (type === 'line') {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  } else {
    return { x1, y1, x2, y2 };
  }
};

// ==========================================================================
// =============<<< ResizedCoords >>>========================================
// ==========================================================================
export const resizedCoords = (x, y, position, coordinates) => {
  console.log('coordinates', coordinates);

  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case 'tl':
    case 'start':
      return { x1: x, y1: y, x2, y2 };
    case 'tr':
      return { x1, y1: y, x2: x, y2 };
    case 'bl':
      return { x1: x, y1, x2, y2: y };
    case 'br':
    case 'end':
      return { x1, y1, x2: x, y2: y };
    case 'onEllipse':
      return { x1, y1, x2: x, y2: y };
    default:
      return null; //should not really get here...
  }
};

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
  const elementsCopy = [...elements];
  switch (type) {
    case 'line':
    case 'rectangle':
    case 'ellipse':
      elementsCopy[id] = createShape(
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        radius,
        isShiftPressed
      );
      break;
    case 'pen':
      elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
      break;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }

  setElements(elementsCopy, true);
};
