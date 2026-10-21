import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|webp|txt|zip|docx|xlsx|pptx)$/i;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Please sign in before uploading files." }, { status: 401 });
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Only freelancers can upload submission files." }, { status: 403 });
    }

    const formData = await req.formData();
    const entry = formData.get("file");

    if (!(entry instanceof File) || entry.size === 0) {
      return NextResponse.json({ message: "Choose a file to upload." }, { status: 400 });
    }

    if (entry.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Each file must be 10 MB or smaller." }, { status: 413 });
    }

    if (!ALLOWED_EXTENSIONS.test(entry.name)) {
      return NextResponse.json(
        { message: "Unsupported file type. Upload PDF, JPG, PNG, WEBP, TXT, ZIP, DOCX, XLSX or PPTX." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "freelance-marketplace/submissions",
            resource_type: "raw",
            use_filename: false,
            unique_filename: true,
            filename_override: entry.name,
          },
          (error, result) => {
            if (error) reject(error);
            else if (!result?.secure_url) reject(new Error("Cloudinary returned no file URL"));
            else resolve({ secure_url: result.secure_url });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ success: true, url: uploadResult.secure_url, fileName: entry.name });
  } catch (error) {
    console.error("Submission file upload error:", error);
    return NextResponse.json({ message: "Upload failed. Please try again." }, { status: 500 });
  }
}
