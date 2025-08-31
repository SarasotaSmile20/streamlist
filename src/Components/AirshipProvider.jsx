import React, { createContext, useContext, useRef } from "react";
import AirshipFlyby from "./AirshipFlyby";

const AirshipCtx = createContext({ launch: (_msg) => {} });

export function AirshipProvider({ children }) {
  const shipRef = useRef(null);
  const api = { launch: (msg) => shipRef.current?.launch(msg) };

  return (
    <AirshipCtx.Provider value={api}>
      <AirshipFlyby ref={shipRef} />
      {children}
    </AirshipCtx.Provider>
  );
}

export function useAirship() {
  return useContext(AirshipCtx);
}
