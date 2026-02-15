"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const RamadanContext = createContext<{ isRamadan: boolean }>({
  isRamadan: false,
});

export const useRamadan = () => useContext(RamadanContext);

export const RamadanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    const isRamadanMode = process.env.NEXT_PUBLIC_RAMADAN_MODE === "true";
    setIsRamadan(isRamadanMode);

    if (isRamadanMode) {
      document.documentElement.classList.add("ramadan");
    } else {
      document.documentElement.classList.remove("ramadan");
    }
  }, []);

  return (
    <RamadanContext.Provider value={{ isRamadan }}>
      {children}
    </RamadanContext.Provider>
  );
};
