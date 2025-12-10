import { ToolProcessor } from './types';
import { documentProcessors } from './document';
import { imageProcessors } from './image';
import { fileProcessors } from './file';

const registry = new Map<string, ToolProcessor>();

[...documentProcessors, ...imageProcessors, ...fileProcessors].forEach(p => {
    registry.set(p.id, p);
});

export const getProcessor = (id: string): ToolProcessor | undefined => {
    return registry.get(id);
};

export * from './types';
