import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storageService } from "@/lib/storage-service";
import fs from "fs/promises";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await db.document.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!document) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const filePath = storageService.getDownloadPath(document.storage_key);

    if (!filePath) {
      // In R2 case, this might return a redirect to a signed URL
      return new NextResponse("Download path not available", { status: 400 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${document.name}"`,
      },
    });
  } catch (error) {
    console.error("[STORAGE_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
