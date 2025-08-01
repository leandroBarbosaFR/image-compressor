"use client";

import { useEffect, useState } from "react";
import { FiDownload, FiShare } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS without MSStream error
    const iOS =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(window as any).MSStream;
    setIsIOS(iOS);

    // Handle beforeinstallprompt (for Chrome/Android)
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("✅ User accepted the install prompt");
    } else {
      console.log("❌ User dismissed the install prompt");
    }
    setDeferredPrompt(null);
    setShowButton(false);
  };

  // iOS message (always visible for iOS)
  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-[280px]">
        <p className="flex flex-col gap-1">
          <span className="flex items-center gap-1">
            <FiShare size={16} /> Tap <strong>Share</strong>
          </span>
          <span className="flex items-center gap-1">
            <AiOutlineHome size={16} /> Then <strong>Add to Home Screen</strong>
          </span>
        </p>
      </div>
    );
  }

  // Chrome/Android button
  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <FiDownload size={18} />
        Install Squeezy
      </button>
    </div>
  );
}

/** Types for BeforeInstallPromptEvent */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
