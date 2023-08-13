import React, { useEffect, useRef } from 'react';
import { BsImages } from 'react-icons/bs';
import { TfiSave } from 'react-icons/tfi';
import { AiOutlineLine } from 'react-icons/ai';
import { LuUndo2, LuRedo2 } from 'react-icons/lu';
import {
  PiCircle,
  PiRectangle,
  PiSelectionBackgroundDuotone,
  PiPaintBrush,
  PiTrash,
  PiEraserFill,
} from 'react-icons/pi';
import Slider from './Slider';
import PopoverPicker from './PopoverPicker';
import { useCanvasContext } from '@/contextAPI/context';

export default function Tools() {
  const {
    color,
    setColor,
    radius,
    setRadius,
    setIsModalOpen,
    canvasRef,
    setActions,
    currentPosition,
    setCurrentPosition,
    tool,
    setTool,
    undo,
    redo,
  } = useCanvasContext();
  const inputRef = useRef();

  useEffect(() => {
    const undoRedoFunction = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', undoRedoFunction);
    return () => {
      document.removeEventListener('keydown', undoRedoFunction);
    };
  }, [undo, redo]);

  const savePNG = (e) => {
    let link = e.currentTarget;
    link.setAttribute('download', 'canvas.png');
    let image = canvasRef.current.toDataURL('image/png');
    link.setAttribute('href', image);
  };

  const handleClick = (e) => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const scale =
        image.naturalWidth > image.naturalHeight
          ? canvas.width / image.naturalWidth
          : canvas.height / image.naturalHeight;
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      const startX = (canvas.width - imageWidth) / 2;
      const startY = (canvas.height - imageHeight) / 2;

      // Create a new canvas to hold the scaled-down image
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = imageWidth;
      scaledCanvas.height = imageHeight;
      const scaledContext = scaledCanvas.getContext('2d');

      // Draw the image on the scaled canvas
      scaledContext.drawImage(image, 0, 0, imageWidth, imageHeight);

      // Get the data URL of the scaled image
      const drawing = scaledCanvas.toDataURL('image/png');

      // context.clearRect(0, 0, canvas.width, canvas.height);
      // context.drawImage(image, startX, startY, imageWidth, imageHeight);
      // const drawing = canvasRef.current.toDataURL('image/png');
      localStorage.setItem('drawing', drawing);
      // The addAction function in Canvas.jsx:
      /** Possibly refactor and add function to utils to reduce repetition */
      setActions((prevActions) => {
        const newActions = prevActions.slice(0, currentPosition + 1);
        return [...newActions, drawing];
      });
      setCurrentPosition((prevPosition) => prevPosition + 1);
    };
  };

  const clearCanvas = () => {
    setIsModalOpen(true);
  };

  return (
    <div className='w-screen h-[92dvh] my-6 max-w-sm glass-border text-gray-100 bg-gray-500/20 p-3 m-3 rounded-xl'>
      <div className='flex flex-col justify-between items-start w-full h-full p-3 '>
        <div className='flex flex-col items-center justify-center mr-3 p-3 rounded-xl drop-shadow-md shadow-lg select-none'>
          <h1 className='font-medium text-sm text-gray-100'>Color</h1>
          <PopoverPicker color={color} onChange={setColor} />
        </div>
        <button
          onClick={() => setTool('pen')}
          className={`bg-black p-3 rounded-t-md border-b-2 border-b-gray-400 hover:opacity-80 ${
            tool === 'pen' ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <PiPaintBrush size={25} />
        </button>
        <div className='flex flex-col'>
          <button
            onClick={() => setTool('rectangle')}
            className={`bg-black p-3 border-b-2 border-b-gray-400 hover:opacity-80 ${
              tool === 'rectangle' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiRectangle size={25} />
          </button>
          <button
            onClick={() => setTool('ellipse')}
            className={`bg-black p-3 border-b-2 border-b-gray-400 hover:opacity-80 ${
              tool === 'ellipse' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiCircle size={25} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`bg-black p-3 border-b-2 border-b-gray-400 hover:opacity-80 ${
              tool === 'line' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <AiOutlineLine size={25} />
          </button>
          <button
            onClick={() => setTool('selection')}
            className={`bg-black p-3 border-b-2 border-b-gray-400 hover:opacity-80 ${
              tool === 'selection' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiSelectionBackgroundDuotone size={25} />
          </button>
          <button
            onClick={() => setTool('delete')}
            className={`bg-black p-3 rounded-b-md border-b-2 border-b-gray-400 hover:opacity-80 ${
              tool === 'delete' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiEraserFill size={25} />
          </button>
        </div>
        <div className='flex flex-col items-start h-full select-none'>
          <h2 className='mb-2'>Width: {radius}</h2>
          <Slider
            currentValue={radius}
            setCurrentValue={setRadius}
            minVal={1}
            maxVal={100}
          />
        </div>
        <div className='bg-black p-3 rounded-full hover:opacity-70'>
          <a
            onClick={savePNG}
            href='download_link'
            className='rounded-full select-none'
          >
            <TfiSave size={25} />
          </a>
        </div>
        <form
          onClick={handleClick}
          className='rounded-full bg-black p-3 cursor-pointer hover:opacity-70'
        >
          <BsImages size={25} />
          <input
            type='file'
            ref={inputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />
        </form>
        <button
          onClick={undo}
          className='bg-black p-3 rounded-full hover:opacity-70'
        >
          <LuUndo2 size={25} />
        </button>
        <button
          onClick={redo}
          className='bg-black p-3 rounded-full hover:opacity-70'
        >
          <LuRedo2 size={25} />
        </button>
        <button
          onClick={clearCanvas}
          className='bg-black p-3 rounded-full hover:opacity-70'
        >
          <PiTrash size={25} />
        </button>
      </div>
    </div>
  );
}
