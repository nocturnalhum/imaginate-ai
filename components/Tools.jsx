import React, { useRef } from 'react';
import { BsImages } from 'react-icons/bs';
import { AiOutlineEdit, AiOutlineLine } from 'react-icons/ai';
import { PiCircle, PiRectangle } from 'react-icons/pi';
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
    shape,
    setShape,
  } = useCanvasContext();
  const inputRef = useRef();

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
    <div className='w-full h-20 my-2 text-gray-100 bg-gray-400/50 rounded-full'>
      <div className='flex justify-between items-center w-full h-full p-3 '>
        <div className='flex flex-col items-center  justify-center mr-3 p-3 rounded-xl drop-shadow-md shadow-lg'>
          <h1 className='font-medium text-gray-100'>Brush Color</h1>
          <PopoverPicker color={color} onChange={setColor} />
        </div>
        <div className='pl-3'>
          <button
            onClick={() => setShape('rectangle')}
            className={`bg-black p-3 rounded-l-md border-r  border-r-gray-400 ${
              shape === 'rectangle' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiRectangle size={25} />
          </button>
          <button
            onClick={() => setShape('circle')}
            className={`bg-black p-3 rounded-l-md border-r  border-r-gray-400 ${
              shape === 'circle' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <PiCircle size={25} />
          </button>
          <button
            onClick={() => setShape('line')}
            className={`bg-black p-3 rounded-r-md ${
              shape === 'line' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <AiOutlineLine size={25} />
          </button>
        </div>
        <div className='flex flex-col items-start h-full'>
          <h2 className='mb-2'>Thickness: {radius}</h2>
          <Slider
            currentValue={radius}
            setCurrentValue={setRadius}
            minVal={1}
            maxVal={100}
          />
        </div>
        <div className='bg-black p-3 rounded-full'>
          <a
            onClick={savePNG}
            href='download_link'
            className='rounded-xl px-2 py-3.5 select-none'
          >
            Save
          </a>
        </div>
        <form
          onClick={handleClick}
          className='flex items-center justify-center h-12 w-12 rounded-full bg-sky-500 text-white select-none cursor-pointer'
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
        <button className='bg-black p-3 rounded-full'>Undo</button>
        <button className='bg-black p-3 rounded-full'>Redo</button>
        <button onClick={clearCanvas} className='bg-black p-3 rounded-full'>
          Clear
        </button>
      </div>
    </div>
  );
}
