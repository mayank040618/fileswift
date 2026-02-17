import { ToolProcessor } from './types';
import { documentProcessors } from './document';
import { imageProcessors } from './image';
import { fileProcessors } from './file';

const registry = new Map<string, ToolProcessor>();

[...documentProcessors, ...imageProcessors, ...fileProcessors].forEach(p => {
    registry.set(p.id, p);
});

// Alias specialized tools to parent processors
const alias = (specialId: string, parentId: string) => {
    const parent = registry.get(parentId);
    if (parent) registry.set(specialId, parent);
};

alias('resize-image-for-youtube-thumbnail', 'image-resizer');
alias('resize-photo-for-resume', 'image-resizer');
alias('compress-pdf-for-bank-statement', 'compress-pdf');
alias('compress-pdf-for-email', 'compress-pdf');
alias('compress-pdf-to-1mb', 'compress-pdf');
alias('compress-pdf-under-200kb', 'compress-pdf');
alias('resize-image-for-instagram', 'image-resizer');
alias('resize-image-for-linkedin', 'image-resizer');
alias('resize-image-for-facebook', 'image-resizer');
alias('convert-scanned-pdf-to-word', 'pdf-to-word');
alias('convert-pdf-to-word-online', 'pdf-to-word');

export const getProcessor = (id: string): ToolProcessor | undefined => {
    return registry.get(id);
};

export * from './types';
