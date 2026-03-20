import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const prismaOptions = {
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
};

export const db = globalThis.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}
