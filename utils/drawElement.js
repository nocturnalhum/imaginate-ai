import rough from 'roughjs/bundled/rough.cjs.js';

const generator = rough.generator();

export function createShape(x1, y1, x2, y2, type) {
  const roughShape =
    type === 'line'
      ? generator.line(x1, y1, x2, y2)
      : type === 'rectangle'
      ? generator.rectangle(x1, y1, x2 - x1, y2 - y1)
      : generator.circle(x1, y1, x2 - x1);

  return { x1, y1, x2, y2, roughShape };
}
