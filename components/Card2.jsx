import { useCanvasContext, useDiffusionContext } from '@/contextAPI/context';
import Image from 'next/image';
import React from 'react';

export default function Card2() {
  const { prediction, message, error } = useDiffusionContext();
  const { canvasRef } = useCanvasContext();
  return (
    <div className='relative h-full w-full bg-gray-300 rounded-2xl'>
      {!prediction?.output && (
        <Image
          src='https://sketch-canvas-images.s3.ca-central-1.amazonaws.com/Archive/canvas-65fb4414-5403-4191-a184-1036b911cb89.png'
          alt='output'
          fill
          className='object-cover rounded-xl'
        />
      )}

      {error && <p className='py-3 text-lg text-orange-500'>Status: {error}</p>}
      {message && (
        <p className='py-3 text-lg text-orange-500'>Status: {message}</p>
      )}
    </div>
  );
}
