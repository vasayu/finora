"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, FileImage, Download, RefreshCw, ZoomIn, X, Clock, HardDrive, Trash2 } from "lucide-react";
import Image from "next/image";

interface TelegramImage {
  fileName: string;
  path: string;
  size: number;
  createdAt: string;
}

export default function TelegramPage() {
  const [images, setImages] = useState<TelegramImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<TelegramImage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Store blob URLs for images so we can pass custom headers to ngrok
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const fetchImageBlob = async (fileName: string) => {
    // If we're on ngrok, we need this header to bypass the HTML warning screen
    const url = `https://unspaded-kenda-verbosely.ngrok-free.dev/api/v1/telegram/images/${fileName}`;
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrls(prev => ({ ...prev, [fileName]: objectUrl }));
      }
    } catch (error) {
      console.error(`Failed to load image blob for ${fileName}`, error);
    }
  };

  const fetchImages = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await fetch(`https://unspaded-kenda-verbosely.ngrok-free.dev/api/v1/telegram/images`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch Telegram dataset");
      const data = await res.json();
      
      const fetchedImages = data.data.images || [];
      setImages(fetchedImages);
      
      // Load blobs for new images
      fetchedImages.forEach((img: TelegramImage) => {
        if (!imageUrls[img.fileName]) {
          fetchImageBlob(img.fileName);
        }
      });
      
      setError(null);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (fileName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Simple confirmation
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;

    try {
      setDeleting(fileName);
      const res = await fetch(`https://unspaded-kenda-verbosely.ngrok-free.dev/api/v1/telegram/images/${fileName}`, {
        method: "DELETE",
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete image");
      
      // Remove from state
      setImages(prev => prev.filter(img => img.fileName !== fileName));
      if (selectedImage?.fileName === fileName) {
        setSelectedImage(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchImages();
    // Poll every 30 seconds for new images
    const interval = setInterval(() => fetchImages(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageUrl = (fileName: string) => {
    // Return the fetched blob URL if available, fallback to direct ngrok URL
    return imageUrls[fileName] || `https://unspaded-kenda-verbosely.ngrok-free.dev/api/v1/telegram/images/${fileName}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex sm:items-center justify-between gap-4 mb-10 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <MessageCircle size={20} />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Telegram Receipts
            </h1>
          </div>
          <p className="text-foreground/50 max-w-2xl text-sm leading-relaxed">
            Images received from your connected Telegram bot. These receipts are automatically 
            synced and can be processed into transactions.
          </p>
        </div>

        <button
          onClick={() => fetchImages(true)}
          disabled={loading || refreshing}
          className="h-10 px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-sm font-medium text-foreground transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} className={`text-blue-400 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#0f0f13] border border-white/[0.06] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-[20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {error ? (
            <div className="text-center py-20">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 items-center justify-center mb-4">
                <FileImage size={24} />
              </div>
              <p className="text-red-400 font-medium mb-1">Failed to load images</p>
              <p className="text-foreground/40 text-sm max-w-md mx-auto">{error}</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 border border-white/[0.05] rounded-xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl bg-[#0a0a0c]">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 items-center justify-center mb-4 border border-blue-500/20">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Receipts Received</h3>
              <p className="text-foreground/50 text-sm max-w-md mx-auto">
                Send an image to your Finora Telegram Bot to see it appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {images.map((img) => (
                <div 
                  key={img.fileName}
                  className="group relative bg-[#141419] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg transition-all hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="aspect-[3/4] relative bg-black/50 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(img.fileName)}
                      alt={img.fileName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ZoomIn size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/[0.06] bg-[#0f0f13]/80 backdrop-blur-sm relative z-10">
                    <div className="flex items-center gap-2 text-xs text-foreground/40 mb-2">
                      <Clock size={12} className="text-blue-400/70" />
                      {formatDate(img.createdAt)}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-400 transition-colors">
                      {img.fileName}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] font-medium px-2 py-1 bg-white/5 rounded-md text-foreground/50 flex items-center gap-1">
                        <HardDrive size={10} />
                        {formatSize(img.size)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDelete(img.fileName, e)}
                          disabled={deleting === img.fileName}
                          className={`p-1.5 rounded-md transition-colors ${deleting === img.fileName ? 'text-red-500 opacity-50' : 'text-foreground/40 hover:text-red-400 hover:bg-red-500/10'}`}
                          title="Delete Receipt"
                        >
                          <Trash2 size={14} />
                        </button>
                        <a
                          href={getImageUrl(img.fileName)}
                          download={img.fileName}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-foreground/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity"
            onClick={() => setSelectedImage(null)}
          />
          
          <div className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:-right-12 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-10"
            >
              <X size={20} />
            </button>
            
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl w-full max-h-[85vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(selectedImage.fileName)}
                alt={selectedImage.fileName}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between w-full px-2">
              <div>
                <p className="text-white font-medium">{selectedImage.fileName}</p>
                <p className="text-white/50 text-sm mt-1">{formatDate(selectedImage.createdAt)} • {formatSize(selectedImage.size)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(selectedImage.fileName)}
                  disabled={deleting === selectedImage.fileName}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors border border-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <a
                  href={getImageUrl(selectedImage.fileName)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
