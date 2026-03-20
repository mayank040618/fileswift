import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    attachments?: string[]; // file names
    timestamp: number;
}

interface WorkspaceState {
    // Files
    files: File[];
    addFiles: (newFiles: File[]) => void;
    removeFile: (fileName: string) => void;
    clearFiles: () => void;

    // Chat
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    clearChat: () => void;

    // Processing
    processing: boolean;
    setProcessing: (value: boolean) => void;

    // Errors
    error: string | null;
    setError: (error: string | null) => void;

    // Sidebar
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

let _counter = 0;
export function generateMessageId(): string {
    _counter++;
    return `msg_${Date.now()}_${_counter}`;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    // Files
    files: [],
    addFiles: (newFiles) => set((state) => ({
        files: [...state.files, ...newFiles]
    })),
    removeFile: (fileName) => set((state) => ({
        files: state.files.filter((f) => f.name !== fileName)
    })),
    clearFiles: () => set({ files: [] }),

    // Chat
    messages: [],
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),
    clearChat: () => set({ messages: [], files: [], error: null }),

    // Processing
    processing: false,
    setProcessing: (value) => set({ processing: value }),

    // Errors
    error: null,
    setError: (error) => set({ error }),

    // Sidebar
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
