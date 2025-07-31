// import { NextResponse } from "next/server";
// import sharp from "sharp";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const images = formData.getAll("images") as File[];
//   const targetFormat = (formData.get("format") as string) || "jpeg";

//   const supportedFormats = [
//     "jpeg",
//     "png",
//     "webp",
//     "avif",
//     "gif",
//     "tiff",
//     "bmp",
//     "heic",
//   ] as const;

//   type SupportedFormat = (typeof supportedFormats)[number];

//   if (!supportedFormats.includes(targetFormat as SupportedFormat)) {
//     return NextResponse.json(
//       { error: "Unsupported format" },
//       { status: 400 }
//     );
//   }

//   const compressedFiles: string[] = [];
//   const uploadDir = path.join(process.cwd(), "public", "compressed");
//   await mkdir(uploadDir, { recursive: true });

//   for (const image of images) {
//     const buffer = Buffer.from(await image.arrayBuffer());
//     let sharpInstance = sharp(buffer);

//     switch (targetFormat as SupportedFormat) {
//       case "jpeg":
//         sharpInstance = sharpInstance.jpeg({ quality: 80 });
//         break;
//       case "png":
//         sharpInstance = sharpInstance.png({ quality: 80 });
//         break;
//       case "webp":
//         sharpInstance = sharpInstance.webp({ quality: 80 });
//         break;
//       case "avif":
//         sharpInstance = sharpInstance.avif({ quality: 50 });
//         break;
//       case "gif":
//       case "tiff":
//       case "bmp":
//         // Using as any only inside this line to bypass Sharp's incorrect type inference
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         sharpInstance = sharpInstance.toFormat(targetFormat as any);
//         break;
//       case "heic":
//         sharpInstance = sharpInstance.heif({ quality: 80 });
//         break;
//     }

//     const outputBuffer = await sharpInstance.toBuffer();
//     const filename = `converted-${Date.now()}.${targetFormat}`;
//     const outputPath = path.join(uploadDir, filename);

//     await writeFile(outputPath, outputBuffer);
//     compressedFiles.push(`/compressed/${filename}`);
//   }

//   return NextResponse.json({ files: compressedFiles });
// }
import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    return NextResponse.json(
      { error: "Unsupported format" },
      { status: 400 }
    );
  }

  const compressedFiles: {
    url: string;
    size: number;
    originalSize: number;
  }[] = [];

  const uploadDir = path.join(process.cwd(), "public", "compressed");
  await mkdir(uploadDir, { recursive: true });

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

    const filename = `squeezit-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}.${targetFormat}`;
    const outputPath = path.join(uploadDir, filename);

    await writeFile(outputPath, outputBuffer);
    compressedFiles.push({
      url: `/compressed/${filename}`,
      size,
      originalSize,
    });
  }

  return NextResponse.json({ files: compressedFiles });
}
