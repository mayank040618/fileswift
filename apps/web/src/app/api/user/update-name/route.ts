import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        if (name.trim().length > 50) {
            return NextResponse.json({ error: 'Name must be 50 characters or less' }, { status: 400 });
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { full_name: name.trim() },
        });

        return NextResponse.json({ 
            success: true, 
            name: updatedUser.full_name 
        });
    } catch (error) {
        console.error('Error updating user name:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
