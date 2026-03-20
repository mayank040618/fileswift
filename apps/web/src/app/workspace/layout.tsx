import React from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
// Triggering rebuild for Prisma Client update
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { Sidebar } from '@/components/workspace/sidebar';

export default async function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Fetch user plan and usage from db
    let dbUser = await db.user.findUnique({
        where: { id: userId },
        include: { documents: true }
    });

    // Create user if they don't exist in our DB yet
    if (!dbUser) {
        const user = await currentUser();
        if (!user) {
            redirect('/sign-in');
        }

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const isAdmin = ['mayankrajjha07@gmail.com', 'mehandibhaskar26@gmail.com'].includes(userEmail);

        dbUser = await db.user.create({
            data: {
                id: userId,
                email: userEmail,
                plan_type: isAdmin ? 'PRO_ACTIVE' : 'FREE',
                ...(isAdmin && { subscription_status: 'LIFETIME' })
            },
            include: { documents: true }
        });
    }

    const storageUsedBytes = dbUser.documents.reduce((acc, doc) => acc + doc.size, 0);
    const storageUsedMB = Math.round(storageUsedBytes / (1024 * 1024));

    return (
        <div className="flex h-screen w-full bg-white dark:bg-[#0A0A0A] overflow-hidden">
            <Sidebar 
                planType={dbUser.plan_type} 
                requestsUsed={dbUser.ai_requests_today} 
                requestsLimit={dbUser.plan_type === 'PRO_ACTIVE' ? 500 : dbUser.plan_type === 'STUDENT' ? 50 : 5}
                storageUsed={storageUsedMB} 
            />
            
            <div className="flex flex-col flex-1 h-screen relative overflow-hidden transition-all duration-300">
                {/* Top Navigation */}
                <WorkspaceHeader 
                    userEmail={dbUser.email}
                    planType={dbUser.plan_type}
                    fullName={dbUser.full_name || ''}
                />

                {/* Main Center Content */}
                <main className="flex-1 h-full w-full pt-14 relative z-10 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

