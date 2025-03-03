import { createContext, useState } from "react";

export const ClipboardContext = createContext();

export const ClipboardProvider = ({ children }) => {
  const [retrievedData, setRetrievedData] = useState(null);

  return (
    <ClipboardContext.Provider value={{ retrievedData, setRetrievedData }}>
      {children}
    </ClipboardContext.Provider>
  );
};
