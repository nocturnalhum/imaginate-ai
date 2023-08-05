export default function restoreCanvasState(ctx) {
  const savedDrawing = localStorage.getItem('drawing');
  if (savedDrawing) {
    const img = new Image();
    img.src = savedDrawing;
    img.onload = () => {
      const scale =
        img.naturalWidth > img.naturalHeight
          ? ctx.canvas.width / img.naturalWidth
          : ctx.canvas.height / img.naturalHeight;
      const imageWidth = img.naturalWidth * 1;
      const imageHeight = img.naturalHeight * 1;
      const startX = (ctx.canvas.width - imageWidth) / 2;
      const startY = (ctx.canvas.height - imageHeight) / 2;
      ctx.drawImage(img, startX, startY, imageWidth, imageHeight);
    };
  }
}
