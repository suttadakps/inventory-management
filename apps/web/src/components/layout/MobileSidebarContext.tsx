"use client";

import { createContext, useContext, useState } from "react";

type MobileSidebarCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileSidebarContext = createContext<MobileSidebarCtx | null>(null);

/** Shares the mobile drawer's open/closed state between the hamburger
 * button (in the top bar) and the sidebar itself (which renders the drawer). */
export function MobileSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar(): MobileSidebarCtx {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) {
    throw new Error(
      "useMobileSidebar must be used within a MobileSidebarProvider"
    );
  }
  return ctx;
}
