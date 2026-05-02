import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kika-mockup-content";

interface MockupContent {
  landing: {
    heading: string;
    subheading: string;
    cta1: string;
    cta2: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
  };
  dashboard: {
    pageTitle: string;
    subtitle: string;
    stat1Label: string;
    stat1Value: string;
    stat1Change: string;
    stat2Label: string;
    stat2Value: string;
    stat2Change: string;
    stat3Label: string;
    stat3Value: string;
    stat3Change: string;
    stat4Label: string;
    stat4Value: string;
    stat4Change: string;
    project1Name: string;
    project1Status: string;
    project2Name: string;
    project2Status: string;
    project3Name: string;
    project3Status: string;
  };
  portfolio: {
    headingLine1: string;
    headingLine2: string;
    headingLine3: string;
    description: string;
    project1Title: string;
    project1Tag: string;
    project2Title: string;
    project2Tag: string;
    project3Title: string;
    project3Tag: string;
    project4Title: string;
    project4Tag: string;
  };
}

const defaults: MockupContent = {
  landing: {
    heading: "Build something\nextraordinary.",
    subheading: "We craft digital experiences that push boundaries. Minimal design, maximum impact.",
    cta1: "Start Project",
    cta2: "View Work",
    card1Title: "Design Systems",
    card1Desc: "Scalable component libraries built for consistency.",
    card2Title: "Brand Identity",
    card2Desc: "Visual language that speaks before words do.",
    card3Title: "Development",
    card3Desc: "Clean code, fast delivery, zero compromise.",
  },
  dashboard: {
    pageTitle: "Dashboard",
    subtitle: "Last updated: 2 min ago",
    stat1Label: "Revenue",
    stat1Value: "$48.2K",
    stat1Change: "+12.5%",
    stat2Label: "Users",
    stat2Value: "2,847",
    stat2Change: "+8.1%",
    stat3Label: "Sessions",
    stat3Value: "14.3K",
    stat3Change: "+3.2%",
    stat4Label: "Bounce",
    stat4Value: "24.8%",
    stat4Change: "-2.1%",
    project1Name: "Brand Refresh",
    project1Status: "Active",
    project2Name: "App Redesign",
    project2Status: "Review",
    project3Name: "API v2",
    project3Status: "Active",
  },
  portfolio: {
    headingLine1: "Creative",
    headingLine2: "Developer &",
    headingLine3: "Designer",
    description: "Crafting digital experiences at the intersection of code and design.",
    project1Title: "E-Commerce Platform",
    project1Tag: "Development",
    project2Title: "Brand System",
    project2Tag: "Design",
    project3Title: "Mobile App",
    project3Tag: "UI/UX",
    project4Title: "Data Dashboard",
    project4Tag: "Full Stack",
  },
};

interface MockupContentContextType {
  content: MockupContent;
  editing: boolean;
  toggleEditing: () => void;
  updateField: <K extends keyof MockupContent, F extends keyof MockupContent[K]>(
    template: K,
    field: F,
    value: string
  ) => void;
  reset: () => void;
}

const MockupContentContext = createContext<MockupContentContextType | undefined>(undefined);

export function MockupContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<MockupContent>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch {}
    return defaults;
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const toggleEditing = useCallback(() => setEditing((e) => !e), []);

  const updateField = useCallback(
    <K extends keyof MockupContent, F extends keyof MockupContent[K]>(template: K, field: F, value: string) => {
      setContent((prev) => ({
        ...prev,
        [template]: { ...prev[template], [field]: value },
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setContent(defaults);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <MockupContentContext.Provider value={{ content, editing, toggleEditing, updateField, reset }}>
      {children}
    </MockupContentContext.Provider>
  );
}

export function useMockupContent() {
  const ctx = useContext(MockupContentContext);
  if (!ctx) throw new Error("useMockupContent must be used within MockupContentProvider");
  return ctx;
}

export { defaults };
export type { MockupContent };