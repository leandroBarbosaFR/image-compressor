"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [sourceFormat, setSourceFormat] = useState<ImageFormat>("jpeg");
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("webp");

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
      const response = await fetch(file.url);
      const blob = await response.blob();
      folder?.file(file.url.split("/").pop() || "image.jpg", blob);
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
      setCompressedFiles(data.files);
    }

    setLoading(false);
  };

  const handleClearAll = () => setCompressedFiles([]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col items-center justify-center min-h-dvh bg-background p-8 text-foreground overflow-hidden"
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
        className="relative z-10 mb-11"
      >
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20">
          Squeezit • Free Image Tool
        </span>
      </motion.div>

      {/* TITLE WITH ICON */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row items-center gap-2 relative mb-10 z-10 text-center"
      >
        <SiLemonsqueezy className="text-primary text-5xl sm:text-4xl mb-2 sm:mb-0" />
        <h1 className="text-4xl font-extrabold leading-tight">
          Compress & Convert Images in Seconds
        </h1>
      </motion.div>

      {/* DESCRIPTION */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative text-lg text-gray-400 max-w-xl text-center mb-8 z-10"
      >
        With <span className="text-white font-semibold">Squeezit</span>, reduce
        image sizes instantly without losing quality. Convert between JPEG, PNG,
        WebP, AVIF and more – all for free.
      </motion.p>

      {/* Animated dropdowns */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-8 relative z-10 w-full sm:w-auto justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Select
          value={sourceFormat}
          onValueChange={(val: ImageFormat) => setSourceFormat(val)}
        >
          <SelectTrigger className="w-full sm:w-[150px] bg-muted border rounded-md px-3 py-2 hover:border-primary transition">
            <SelectValue placeholder="From" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10">
            {["jpeg", "png", "webp", "avif", "gif", "tiff", "bmp", "heic"].map(
              (val) => (
                <SelectItem
                  key={val}
                  value={val as ImageFormat}
                  className="cursor-pointer px-4 py-2 hover:bg-white/10 rounded-md transition-colors"
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
          <SelectTrigger className="w-full sm:w-[150px] bg-muted border rounded-md px-3 py-2 hover:border-primary transition">
            <SelectValue placeholder="To" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10">
            {["jpeg", "png", "webp", "avif", "gif", "tiff", "bmp", "heic"].map(
              (val) => (
                <SelectItem
                  key={val}
                  value={val as ImageFormat}
                  className="cursor-pointer px-4 py-2 hover:bg-white/10 rounded-md transition-colors"
                >
                  {val.toUpperCase()}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Dropzone */}
      <div {...getRootProps()} className="relative z-10 w-full sm:w-auto">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className={`w-full max-w-lg p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition 
          ${
            isDragActive
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop your images here..."
              : "Drag & drop or click to select images"}
          </p>
        </motion.div>
      </div>

      {loading && (
        <div className="w-full max-w-lg mt-6 relative z-10">
          <Progress value={60} className="w-full" />
          <div className="flex justify-center items-center mt-4 gap-2 text-gray-300">
            <AiOutlineLoading3Quarters className="animate-spin text-lg text-primary" />
            <span>Processing your images</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {compressedFiles.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 mb-6 relative z-10 w-full sm:w-auto">
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-white text-black rounded-md cursor-pointer hover:bg-white-700 transition"
          >
            <PiTrash className="text-lg" />
            Clear All
          </button>

          {compressedFiles.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-primary text-white rounded-md cursor-pointer hover:bg-primary/80 transition"
            >
              <PiArchive className="text-lg" />
              Download All as ZIP
            </button>
          )}
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
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
                className="max-w-[200px] max-h-[200px] mx-auto mb-2 rounded object-contain"
              />
              <p className="text-sm text-gray-400">
                {file.size} KB (
                {Math.round(
                  ((file.originalSize - file.size) / file.originalSize) * 100
                )}
                % saved)
              </p>
              <a
                href={file.url}
                download
                className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-primary border border-primary rounded-md transition-all hover:bg-primary hover:text-white"
              >
                <PiDownloadSimple className="text-lg" />
                Download
              </a>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
