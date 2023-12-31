import React, { useState } from 'react';
import Card1 from '@/components/Card1';
import Card2 from '@/components/Card2';
import Header from '@/components/Header';
import { useCanvasContext } from '@/contextAPI/context';
import Tools from '@/components/Tools';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function Home() {
  const {
    canvasRef,
    isFlipped,
    isModalOpen,
    setIsModalOpen,
    setElements,
    showTools,
  } = useCanvasContext();

  const handleConfirmClear = () => {
    let canvas = canvasRef.current;
    let context = canvas.getContext('2d');
    context.fillStyle = '#FFF'; // Set the background color to white
    context.fillRect(0, 0, canvas.width, canvas.height);
    setElements([]);
    setIsModalOpen(false);
  };

  const handleCancelClear = () => {
    setIsModalOpen(false);
  };

  return (
    <main
      className={
        'min-h-screen flex-col items-center bg-desk bg-cover text-gray-100 overflow-hidden'
      }
    >
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
      <div className='h-[92dvh] w-[95dvw] max-w-7xl mx-auto group perspective'>
        <Header />
        <div
          className={`relative flex h-full w-full glass-border duration-500 preserve-3d touch-none ${
            isFlipped ? 'rotate-y-180 ' : ''
          }`}
        >
          <div className='absolute inset-0 p-2'>
            <Card1 />
          </div>
          <div className='absolute inset-0 h-full w-full rounded-xl rotate-y-180 backface-hidden p-4'>
            <Card2 />
          </div>
        </div>
        <div
          className={`absolute top-10 duration-300 ${
            !showTools ? '-translate-x-[100%]' : 'translate-x-[0%]'
          } `}
        >
          <Tools />
        </div>
        <div
          className={`absolute top-0 duration-300 ${
            showTools ? 'translate-y-[100%]' : 'translate-y-0'
          } `}
        >
          {/* <StableDiffusion
              canvasRef={canvasRef}
              setFlip={setFlip}
              message={message}
              setMessage={setMessage}
              loading={loading}
              setLoading={setLoading}
              setPrediction={setPrediction}
              error={error}
              setError={setError}
            /> */}
        </div>
      </div>
    </main>
  );
}
