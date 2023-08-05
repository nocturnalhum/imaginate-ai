import rough from 'roughjs/bundled/rough.cjs.js';

const generator = rough.generator();

export function createShape(x1, y1, x2, y2, type, radius, isShiftPressed) {
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
      : generator.ellipse(
          x1,
          y1,
          (x2Adjusted - x1) * Math.PI,
          (y2Adjusted - y1) * Math.PI,
          {
            strokeWidth: radius,
          }
        );

  return { x1, y1, x2: x2Adjusted, y2: y2Adjusted, roughShape };
}

export function getElementAtPosition(x, y, elements) {
  return elements.find((element) => isWithinElement(x, y, element));
}
