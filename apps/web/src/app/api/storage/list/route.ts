import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan_type: true }
    });

    const documents = await db.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      documents,
      planType: user?.plan_type || 'FREE'
    });
  } catch (error) {
    console.error("[STORAGE_LIST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
