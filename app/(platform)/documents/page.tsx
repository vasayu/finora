"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Upload, FileText, File, CheckCircle, Clock } from "lucide-react";

export default function DocumentsPage() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api("/documents", { token });
      const docs = res.data?.documents || res.data || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api("/documents/upload", {
        method: "POST",
        token,
        body: formData,
        isFormData: true,
      });
      fetchDocuments();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const statusIcon = (status: string) => {
    if (status === "PROCESSED")
      return <CheckCircle size={14} className="text-emerald-400" />;
    return <Clock size={14} className="text-amber-400" />;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Upload and manage financial documents
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-8 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-white/[0.08] hover:border-white/[0.15] bg-[#0a0a0a]"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploading
                ? "Uploading..."
                : "Drop files here or click to upload"}
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              PDF, Excel, CSV, Word — max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground">
            Uploaded Documents
          </h2>
        </div>
        {loading ? (
          <div className="py-12 text-center text-foreground/40 text-sm">
            Loading...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={40} className="text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/40 text-sm">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <File size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(doc.status)}
                  <span className="text-xs text-foreground/50">
                    {doc.status || "PENDING"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
