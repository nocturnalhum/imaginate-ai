import { createContext, useContext, useState } from 'react';

const CanvasContext = createContext();

export default function AppStore({ children }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <CanvasContext.Provider value={{ isFlipped, setIsFlipped }}>
      {children}
    </CanvasContext.Provider>
  );
}

// Make useUserContext Hook to easily use our context throughout the application
export function useCanvasContext() {
  return useContext(CanvasContext);
}
