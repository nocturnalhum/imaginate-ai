import React, { useState } from 'react';
import Card1 from '@/components/Card1';
import Card2 from '@/components/Card2';
import Header from '@/components/Header';
import { useCanvasContext } from '@/contextAPI/context';

export default function Home() {
  const { isFlipped, setIsFlipped } = useCanvasContext();

  return (
    <main className={'flex flex-col items-center min-h-screen bg-desk'}>
      <div className='h-[80vh] w-full  max-w-5xl mx-auto group perspective'>
        <Header />
        <div
          className={`relative h-full w-full glass-border duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180 ' : ''
          }`}
        >
          <div className='absolute inset-0 p-4'>
            <Card1 />
          </div>
          <div className='absolute inset-0 h-full w-full rounded-xl rotate-y-180 backface-hidden p-4'>
            <Card2 />
          </div>
        </div>
      </div>
    </main>
  );
}
