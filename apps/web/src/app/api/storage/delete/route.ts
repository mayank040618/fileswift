import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storageService } from "@/lib/storage-service";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Document ID is required", { status: 400 });
    }

    const document = await db.document.findUnique({
      where: { id, userId },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Delete from storage (handles local/R2)
    await storageService.delete(document.storage_key, 'uploads');

    // Delete from database
    await db.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STORAGE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
