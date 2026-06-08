"use client";

import { useEffect, useState } from "react";
import AuthProvider from "./providers/AuthProvider";
import SoundProvider from "./providers/SoundProvider";
import ReactQueryProvider from "./providers/QueryClientProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }, []);

  return (
    <AuthProvider>
      <SoundProvider>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </SoundProvider>
    </AuthProvider>
  );
}