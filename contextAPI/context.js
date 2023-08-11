import { useHistory } from '@/hooks/useHistory';
import { createContext, useContext, useRef, useState } from 'react';

const CanvasContext = createContext();
const DiffusionContext = createContext();

export default function AppStore({ children }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('Errors');
  const [color, setColor] = useState('#000');
  const [radius, setRadius] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actions, setActions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [showTools, setShowTools] = useState(true);
  const [elements, setElements, undo, redo] = useHistory([]);
  const [tool, setTool] = useState('pen');

  const canvasRef = useRef();

  return (
    <DiffusionContext.Provider
      value={{
        prediction,
        setPrediction,
        loading,
        setLoading,
        message,
        setMessage,
        error,
        setError,
      }}
    >
      <CanvasContext.Provider
        value={{
          canvasRef,
          isFlipped,
          setIsFlipped,
          color,
          setColor,
          radius,
          setRadius,
          isModalOpen,
          setIsModalOpen,
          actions,
          setActions,
          currentPosition,
          setCurrentPosition,
          tool,
          setTool,
          elements,
          setElements,
          showTools,
          setShowTools,
          undo,
          redo,
        }}
      >
        {children}
      </CanvasContext.Provider>
    </DiffusionContext.Provider>
  );
}

// Make useUserContext Hook to easily use our context throughout the application
export function useCanvasContext() {
  return useContext(CanvasContext);
}

export function useDiffusionContext() {
  return useContext(DiffusionContext);
}
