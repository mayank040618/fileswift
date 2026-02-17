
import { ProcessorResult } from './index';

export interface RemoveBackgroundConfig {
    progress?: (key: string, current: number, total: number) => void;
    debug?: boolean;
    proxyToWorker?: boolean;
    model?: 'small' | 'medium';
    publicPath?: string; // Path to assets
}

declare module '@imgly/background-removal' {
    export function removeBackground(
        image: File | Blob | string,
        config?: RemoveBackgroundConfig
    ): Promise<Blob>;
}
