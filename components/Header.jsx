import React from 'react';
import { useCanvasContext } from '@/contextAPI/context';

export default function Header() {
  const { isFlipped, setIsFlipped, showTools, setShowTools } =
    useCanvasContext();

  const handleTools = () => {
    setShowTools(!showTools);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className='flex h-16 w-full text-gray-100'>
      <div className='flex justify-start items-center flex-1 gap-3'>
        <button
          onClick={handleTools}
          className='px-10 py-1 bg-slate-900 rounded-full'
        >
          Tools
        </button>
        <button
          // onClick={handleTools}
          className='px-4 py-1 bg-slate-900 rounded-full'
        >
          Stable Diffusion
        </button>
      </div>
      <div className='flex justify-center items-center font-medium text-xl  flex-1 '>
        <h1>Sketch AI 2</h1>
      </div>
      <div className='flex justify-end items-center flex-1'>
        <button
          onClick={handleFlip}
          className='px-10 py-1 bg-slate-900 rounded-full'
        >
          Flip
        </button>
      </div>
    </div>
  );
}
