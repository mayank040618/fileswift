import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { WorkspaceCore } from '@/components/workspace/WorkspaceCore';

export default async function WorkspacePage() {
    const { userId } = auth();
    let firstName = 'there';

    if (userId) {
        const dbUser = await db.user.findUnique({ where: { id: userId } });
        
        // Prioritize custom set name
        const rawName = dbUser?.full_name;
        
        if (rawName && rawName.trim().length > 0) {
            // Extract just the first word
            firstName = rawName.trim().split(' ')[0] || 'there';
        }
    }

    return (
        <div className="w-full h-full bg-white dark:bg-black">
            <WorkspaceCore firstName={firstName} />
        </div>
    );
}
