import React, { createContext, useContext, useState, useCallback } from "react";

type MockupTemplate = "landing" | "dashboard" | "portfolio";

interface MockupTemplateContextType {
  template: MockupTemplate;
  setTemplate: (t: MockupTemplate) => void;
}

const MockupTemplateContext = createContext<MockupTemplateContextType | undefined>(undefined);

export function MockupTemplateProvider({ children }: { children: React.ReactNode }) {
  const [template, setTemplate] = useState<MockupTemplate>("landing");
  return (
    <MockupTemplateContext.Provider value={{ template, setTemplate }}>
      {children}
    </MockupTemplateContext.Provider>
  );
}

export function useMockupTemplate() {
  const ctx = useContext(MockupTemplateContext);
  if (!ctx) throw new Error("useMockupTemplate must be used within MockupTemplateProvider");
  return ctx;
}