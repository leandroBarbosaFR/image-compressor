"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { track } from "@vercel/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { SiLemonsqueezy } from "react-icons/si";
import {
  PiDownloadSimple,
  PiTrash,
  PiArchive,
  PiArrowDown,
} from "react-icons/pi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiDownload, FiShare } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";
import Image from "next/image";

type ImageFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "gif"
  | "tiff"
  | "bmp"
  | "heic";

interface CompressedFile {
  url: string;
  size: number;
  originalSize: number;
  filename: string;
}

/** Types for PWA event */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Utility for mobile-safe downloads
const downloadBase64File = (base64Data: string, filename: string) => {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/jpeg" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [sourceFormat, setSourceFormat] = useState<ImageFormat>("jpeg");
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("webp");

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(window as any).MSStream;
    setIsIOS(iOS);

    // Handle beforeinstallprompt (for Chrome/Android/Desktop)
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallButton(true);
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
    setShowInstallButton(false);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void handleUpload(acceptedFiles);
    },
    [sourceFormat, targetFormat]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      [`image/${sourceFormat}`]: [`.${sourceFormat}`],
    },
  });

  const handleDownloadAll = async () => {
    if (compressedFiles.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("squeezit-images");

    for (const file of compressedFiles) {
      const base64Data = file.url.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j);
      }

      const byteArray = new Uint8Array(byteNumbers);
      folder?.file(file.filename, byteArray);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "squeezit-images.zip");
  };

  const handleUpload = async (files: File[]) => {
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("format", targetFormat);

    const res = await fetch("/api/compress", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filesWithNames = data.files.map((f: any, i: number) => ({
        ...f,
        filename: `squeezit-${i + 1}.${targetFormat}`,
      }));

      setCompressedFiles(filesWithNames);
    }

    setLoading(false);
  };

  const handleClearAll = () => setCompressedFiles([]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col items-center justify-center min-h-dvh bg-background p-4 sm:p-8 text-foreground overflow-hidden"
    >
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000",
        }}
      />

      {/* BADGE */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 sm:mb-11"
      >
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20">
          Squeezit • Free Image Tool
        </span>
      </motion.div>

      {/* TITLE */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center gap-3 relative mb-6 sm:mb-10 z-10 text-center px-4"
      >
        <SiLemonsqueezy className="text-primary text-4xl sm:text-5xl" />
        <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight max-w-4xl">
          Compress & Convert Images in Seconds
        </h1>
      </motion.div>

      {/* DESCRIPTION */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative text-base sm:text-lg text-gray-400 max-w-xl text-center mb-6 sm:mb-8 z-10 px-4"
      >
        With <span className="text-white font-semibold">Squeezit</span>, reduce
        image sizes instantly without losing quality. Convert between JPEG, PNG,
        WebP, AVIF and more – all for free.
      </motion.p>

      {/* iOS Install Instructions */}
      {isIOS && (
        <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg mb-4 text-sm max-w-md text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiShare size={16} /> Tap <strong>Share</strong>
          </div>
          <div className="flex items-center justify-center gap-2">
            <AiOutlineHome size={16} /> Then <strong>Add to Home Screen</strong>
          </div>
        </div>
      )}

      {/* Format Selection */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8 relative z-10 w-full sm:w-auto justify-center px-4 sm:px-0"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Select
          value={sourceFormat}
          onValueChange={(val: ImageFormat) => setSourceFormat(val)}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-[150px] bg-muted border rounded-md px-3 py-3 hover:border-primary transition touch-manipulation">
            <SelectValue placeholder="From" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10">
            {["jpeg", "png", "webp", "avif", "gif", "tiff", "bmp", "heic"].map(
              (val) => (
                <SelectItem
                  key={val}
                  value={val as ImageFormat}
                  className="cursor-pointer px-4 py-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation"
                >
                  {val.toUpperCase()}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <PiArrowDown className="text-2xl text-gray-400 self-center block sm:hidden" />
        <span className="text-2xl font-bold self-center hidden sm:block">
          →
        </span>

        <Select
          value={targetFormat}
          onValueChange={(val: ImageFormat) => setTargetFormat(val)}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-[150px] bg-muted border rounded-md px-3 py-3 hover:border-primary transition touch-manipulation">
            <SelectValue placeholder="To" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10">
            {["jpeg", "png", "webp", "avif", "gif", "tiff", "bmp", "heic"].map(
              (val) => (
                <SelectItem
                  key={val}
                  value={val as ImageFormat}
                  className="cursor-pointer px-4 py-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation"
                >
                  {val.toUpperCase()}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Dropzone */}
      <div {...getRootProps()} className="relative z-10 w-full max-w-lg px-4">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className={`w-full p-8 sm:p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition touch-manipulation
          ${
            isDragActive
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-base sm:text-lg font-medium">
            {isDragActive
              ? "Drop your images here..."
              : "Drag & drop or tap to select images"}
          </p>
        </motion.div>
      </div>

      {loading && (
        <div className="w-full max-w-lg mt-6 relative z-10 px-4">
          <Progress value={60} className="w-full" />
          <div className="flex justify-center items-center mt-4 gap-2 text-gray-300">
            <AiOutlineLoading3Quarters className="animate-spin text-lg text-primary" />
            <span className="text-sm sm:text-base">Processing your images</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-6 mb-6 relative z-10 w-full max-w-lg px-4">
        {showInstallButton && !isIOS && (
          <button
            onClick={handleInstall}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-black text-white rounded-md hover:bg-gray-800 transition cursor-pointer touch-manipulation"
          >
            <FiDownload className="text-lg" />
            Install Squeezit App
          </button>
        )}

        {compressedFiles.length > 0 && (
          <>
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-white text-black rounded-md hover:bg-gray-100 transition cursor-pointer touch-manipulation"
            >
              <PiTrash className="text-lg" />
              Clear All
            </button>

            {compressedFiles.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-primary text-white rounded-md hover:bg-primary/80 cursor-pointer transition touch-manipulation"
              >
                <PiArchive className="text-lg" />
                Download All as ZIP
              </button>
            )}
          </>
        )}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 relative z-10 w-full max-w-4xl px-4">
        {compressedFiles.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 text-center">
              <Image
                src={file.url}
                alt="compressed"
                width={200}
                height={200}
                className="w-full max-w-[200px] max-h-[200px] mx-auto mb-2 rounded object-contain"
              />
              <p className="text-sm text-gray-400 mb-3">
                {file.size} KB (
                {Math.round(
                  ((file.originalSize - file.size) / file.originalSize) * 100
                )}
                % saved)
              </p>

              <button
                onClick={() => {
                  downloadBase64File(file.url, file.filename);
                  track("Download");
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full text-sm font-medium text-primary border border-primary rounded-md transition-all hover:bg-primary hover:text-white touch-manipulation"
              >
                <PiDownloadSimple className="text-lg" />
                Download
              </button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
