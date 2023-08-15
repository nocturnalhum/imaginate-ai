import React, { useRef } from 'react';
import Canvas from './Canvas6';

export default function Card1() {
  const elementRef = useRef();
  return (
    <div ref={elementRef} className='h-full w-full touch-none'>
      <Canvas elementRef={elementRef} />
    </div>
  );
}
