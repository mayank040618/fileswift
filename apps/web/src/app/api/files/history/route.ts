import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(_request: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            history: [
                { id: '1', name: 'Q3_Financial_Report.pdf', action: 'Summary', date: new Date().toISOString() },
                { id: '2', name: 'Invoice_2023.pdf', action: 'Table Extraction', date: new Date(Date.now() - 86400000).toISOString() },
            ]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
