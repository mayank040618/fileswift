'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Trash2, Search, Filter, Loader2, HardDrive, AlertCircle, Sparkles, Plus, UploadCloud, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_key: string;
  createdAt: string;
}

export default function StoragePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [planType, setPlanType] = useState<string>('FREE');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/storage/list');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents);
      setPlanType(data.planType);
    } catch (error) {
      console.error(error);
      toast.error('Could not load your files.');
    } finally {
      setLoading(false);
    }
  };

  const [fileToDelete, setFileToDelete] = useState<{ id: string, name: string } | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setFileToDelete(null); // Close modal
    try {
      const res = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Delete failed');
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('File removed from cloud.');
    } catch (error) {
      console.error(error);
      toast.error('Could not delete file.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    setFileToDelete({ id, name });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedCount = files.length;
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorMsg = await res.text();
          throw new Error(`Upload failed for ${file.name}: ${errorMsg}`);
        }
      }
      
      toast.success(`${uploadedCount} file(s) uploaded to cloud.`);
      fetchDocuments(); // Refresh the list
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0A0A0A] overflow-hidden pt-20">
      <div className="max-w-6xl w-full mx-auto px-6 pb-12">
        
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/workspace')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium group"
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-all">
              <ChevronLeft size={16} />
            </div>
            Back to Workspace
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <HardDrive className="text-blue-600 dark:text-blue-500 shrink-0" /> Cloud Storage
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all your uploaded documents and AI analysis files.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-full sm:w-64"
              />
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              <span>Upload to Cloud</span>
            </button>
            <input 
              type="file" 
              multiple 
              hidden 
              ref={fileInputRef} 
              onChange={handleUpload}
              accept=".pdf,.txt,.csv,.json,.md,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
            />
          </div>
        </div>

        {/* Storage State */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 animate-pulse">Retrieving your files...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/[0.05] rounded-3xl flex items-center justify-center mb-6">
              {searchQuery ? <Search size={32} className="text-slate-400" /> : <FileText size={32} className="text-slate-400" />}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No matching files' : 'No files in the cloud'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center mb-8">
              {searchQuery ? `We couldn't find any documents matching "${searchQuery}"` : 'Upload documents in the workspace to see them here and access them from anywhere.'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => router.push('/workspace')}
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                Go to Workspace <Sparkles size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-[#111111] p-5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText size={24} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`/api/storage/download/${doc.id}`} 
                        download={doc.name}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-all"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                      <button 
                        onClick={() => confirmDelete(doc.id, doc.name)}
                        disabled={deletingId === doc.id}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate pr-2" title={doc.name}>
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatSize(doc.size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="mt-6 w-full py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
                  >
                    Ask AI Assistant
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quota Banner */}
        {!loading && (
          <div className={`mt-12 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group ${
            planType === 'PRO_ACTIVE' 
              ? 'bg-blue-600 shadow-blue-500/20' 
              : 'bg-indigo-600 shadow-indigo-500/20'
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <HardDrive className="text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-base sm:text-lg text-white">
                    {planType === 'PRO_ACTIVE' ? 'Pro Cloud Storage' : 'Cloud Storage Quota'}
                  </h4>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {planType === 'PRO_ACTIVE' 
                      ? `You are using ${formatSize(documents.reduce((acc, d) => acc + d.size, 0))} of your 5GB encrypted storage.`
                      : planType === 'STUDENT'
                        ? `You are using ${formatSize(documents.reduce((acc, d) => acc + d.size, 0))} of your 1.5GB encrypted storage.`
                        : 'Need more space? Upgrade to Pro for 5GB of encrypted storage.'
                    }
                  </p>
                </div>
              </div>
              
              {planType === 'FREE' ? (
                <button 
                  onClick={() => router.push('/pricing')}
                  className="relative z-10 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all"
                >
                  Upgrade Now
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/account/billing')}
                  className="relative z-10 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm"
                >
                  Manage Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Refined Modern Delete Confirmation Modal (Apple-style) */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToDelete(null)}
              className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="relative w-full max-w-[340px] bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-[2.25rem] border border-slate-200/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100/50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
                  <AlertCircle size={28} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Delete this file?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-2 leading-snug">
                  &quot;{fileToDelete.name}&quot; will be permanently removed from your cloud storage.
                </p>
                
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => handleDelete(fileToDelete.id)}
                    className="w-full py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-[0.98] transition-all shadow-md shadow-red-500/10"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => setFileToDelete(null)}
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
