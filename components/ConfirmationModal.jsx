import React from 'react';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75'>
      <div className='bg-white rounded-lg p-4'>
        <p className='text-gray-700'>
          Are you sure you want to clear the canvas?
        </p>
        <div className='mt-4 flex justify-end'>
          <button
            className='px-4 py-2 mr-2 bg-red-600 text-white rounded'
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className='px-4 py-2 bg-gray-400 text-white rounded'
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
