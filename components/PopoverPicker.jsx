import useClickOutside from '@/hooks/useClickOutside';
import React, { useCallback, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function PopoverPicker({ color, onChange }) {
  const [isOpen, toggle] = useState(false);
  const popover = useRef();

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <div className='relative flex justify-center'>
      <div
        className='h-8 w-8 rounded-full border-[3px] border-white  drop-shadow-md cursor-pointer'
        style={{ backgroundColor: color }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div className='absolute -top-60 -left-10 rounded-lg' ref={popover}>
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
