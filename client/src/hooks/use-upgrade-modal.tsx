import { createContext, useContext, useState } from "react";

interface UpgradeModalContextValue {
  open: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue>({
  open: false,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
});

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <UpgradeModalContext.Provider
      value={{
        open,
        openUpgradeModal: () => setOpen(true),
        closeUpgradeModal: () => setOpen(false),
      }}
    >
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  return useContext(UpgradeModalContext);
}
