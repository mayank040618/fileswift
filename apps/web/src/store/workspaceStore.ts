import { create } from 'zustand';

export type ToolId = 'compress-pdf' | 'image-convert' | 'ai-chat' | null;
export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

interface WorkspaceState {
    currentFile: File | null;
    activeTool: ToolId;
    processingStatus: ProcessingStatus;
    resultUrl: string | null;
    errorMessage: string | null;
    
    // Actions
    setFile: (file: File | null) => void;
    setActiveTool: (toolId: ToolId) => void;
    setProcessingStatus: (status: ProcessingStatus) => void;
    setResultUrl: (url: string | null) => void;
    setErrorMessage: (msg: string | null) => void;
    resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    currentFile: null,
    activeTool: null,
    processingStatus: 'idle',
    resultUrl: null,
    errorMessage: null,

    setFile: (file) => set({ 
        currentFile: file, 
        processingStatus: 'idle', 
        resultUrl: null, 
        errorMessage: null 
    }),
    
    setActiveTool: (toolId) => set({ 
        activeTool: toolId,
        // Optional: Do we want to reset status when switching tools? 
        // For a seamless experience, maybe keep the file but clear errors.
        errorMessage: null 
    }),
    
    setProcessingStatus: (status) => set({ processingStatus: status }),
    
    setResultUrl: (url) => set({ resultUrl: url }),
    
    setErrorMessage: (msg) => set({ 
        errorMessage: msg, 
        processingStatus: msg ? 'error' : 'idle' 
    }),

    resetWorkspace: () => set({
        currentFile: null,
        activeTool: null,
        processingStatus: 'idle',
        resultUrl: null,
        errorMessage: null
    })
}));
