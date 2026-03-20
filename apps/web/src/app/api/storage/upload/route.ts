import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkStorageLimit } from "@/lib/storage-limits";
import { storageService } from "@/lib/storage-service";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const limitCheck = await checkStorageLimit(file.size);
    if (!limitCheck.allowed) {
      return new NextResponse(limitCheck.error, { status: 429 });
    }

    const result = await storageService.upload({
      userId,
      file,
      prefix: 'uploads'
    });

    // Save to database
    const document = await db.document.create({
      data: {
        name: result.fileName,
        size: file.size,
        type: file.type,
        storage_key: result.storageKey,
        userId: userId,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[STORAGE_UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
