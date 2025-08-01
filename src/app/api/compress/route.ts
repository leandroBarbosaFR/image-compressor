import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  const formData = await req.formData();
  const images = formData.getAll("images") as File[];
  const targetFormat = (formData.get("format") as string) || "jpeg";

  const supportedFormats = [
    "jpeg",
    "png",
    "webp",
    "avif",
    "gif",
    "tiff",
    "bmp",
    "heic",
  ] as const;

  type SupportedFormat = (typeof supportedFormats)[number];

  if (!supportedFormats.includes(targetFormat as SupportedFormat)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const compressedFiles: {
    url: string;
    size: number;
    originalSize: number;
  }[] = [];

  for (const image of images) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const originalSize = Math.round(buffer.length / 1024);

    let sharpInstance = sharp(buffer);

    switch (targetFormat as SupportedFormat) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality: 80 });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality: 80 });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality: 80 });
        break;
      case "avif":
        sharpInstance = sharpInstance.avif({ quality: 50 });
        break;
      case "gif":
      case "tiff":
      case "bmp":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sharpInstance = sharpInstance.toFormat(targetFormat as any);
        break;
      case "heic":
        sharpInstance = sharpInstance.heif({ quality: 80 });
        break;
    }

    const outputBuffer = await sharpInstance.toBuffer();
    const size = Math.round(outputBuffer.length / 1024);

    // Return as base64 data URI (no saving to disk)
    compressedFiles.push({
      url: `data:image/${targetFormat};base64,${outputBuffer.toString(
        "base64"
      )}`,
      size,
      originalSize,
    });
  }

  return NextResponse.json({ files: compressedFiles });
}
