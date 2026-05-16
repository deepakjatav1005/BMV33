import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Video, Loader, Image as ImageIcon, Trash2 } from 'lucide-react';
import { db, resolveUrl } from '../services/dataService';
import { cn } from '../lib/utils';

export const VideoUpload = ({ 
  onUpload, 
  label = "Upload Video", 
  currentVideo = "",
  multiple = false
}: { 
  onUpload: (url: string) => void | Promise<any>, 
  label?: string,
  currentVideo?: string,
  multiple?: boolean
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('video/')) {
            toast.error(`File ${file.name} is not a video`);
            continue;
          }

          // Check duration
          const video = document.createElement('video');
          video.preload = 'metadata';
          try {
            await new Promise<void>((resolve, reject) => {
              video.onloadedmetadata = function() {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 60) { 
                  toast.error(`Video ${file.name} is too long (max 60 seconds)`);
                  reject('duration');
                } else {
                  resolve();
                }
              };
              video.onerror = () => reject('metadata');
              video.src = URL.createObjectURL(file);
            });
            await uploadFile(file);
          } catch (err) {
            if (err === 'metadata') toast.error(`Could not load video metadata for ${file.name}`);
          }
      }
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const filePath = `uploads/videos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error } = await db.storage
        .from('images') 
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Explicitly set content type for videos
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      await onUpload(publicUrl);
      toast.success(`Video ${file.name} uploaded`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group">
          {currentVideo ? (
            <video src={resolveUrl(currentVideo)} className="w-full h-full object-cover" />
          ) : (
            <Video className="text-gray-300" size={32} />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader className="animate-spin text-orange-600" size={20} />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-all shadow-sm">
          <Upload size={16} />
          <span>{isUploading ? 'Uploading...' : 'Select Video'}</span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="video/*" 
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-[10px] text-gray-400 italic">Max duration: 60 seconds. Suggested: High quality 1080p.</p>
    </div>
  );
};

export const ImageUpload = ({ 
  onUpload, 
  label = "Upload Image", 
  currentImage = "",
  multiple = false,
  isCircle = false
}: { 
  onUpload: (url: string | string[]) => void | Promise<any>, 
  label?: string,
  currentImage?: string,
  multiple?: boolean,
  isCircle?: boolean
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid image`);
        }

        if (file.size > 20 * 1024 * 1024) { 
          throw new Error(`File ${file.name} is too large (max 20MB)`);
        }

        if (file.type === 'image/gif') {
          return await uploadRawFile(file);
        } else {
          return await processAndUpload(file);
        }
      });

      const urls = await Promise.all(uploadPromises);
      const filteredUrls = urls.filter(u => u) as string[];
      
      if (filteredUrls.length > 0) {
        if (multiple) {
          await onUpload(filteredUrls);
        } else {
          await onUpload(filteredUrls[0]);
        }
      }
    } catch (err: any) {
      console.error('Final upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processAndUpload = async (file: File): Promise<string | null> => {
    try {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const SIZE = 1200; // Increased size slightly
      canvas.width = SIZE;
      canvas.height = SIZE;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Fit image into square frame while maintaining aspect ratio (object-contain behavior)
      const scale = Math.min(SIZE / img.width, SIZE / img.height);
      const x = (SIZE / 2) - (img.width / 2) * scale;
      const y = (SIZE / 2) - (img.height / 2) * scale;
      const width = img.width * scale;
      const height = img.height * scale;

      ctx.drawImage(img, x, y, width, height);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
      );

      if (!blob) throw new Error('Failed to process image');

      const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${file.name.replace(/\s+/g, '_')}.jpg`;
      
      const { error } = await db.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      URL.revokeObjectURL(img.src);
      return publicUrl;
    } catch (err) {
      console.error('Process error:', err);
      throw err;
    }
  };

  const uploadRawFile = async (file: File): Promise<string | null> => {
    try {
      const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error } = await db.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Raw upload error:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className={cn(
          "relative w-24 h-24 overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group",
          isCircle ? "rounded-full" : "rounded-2xl"
        )}>
          {currentImage ? (
            <div className="relative w-full h-full group">
              <img src={resolveUrl(currentImage)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpload('');
                }}
                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
                title="Remove Photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <ImageIcon className="text-gray-300" size={32} />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader className="animate-spin text-orange-600" size={20} />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-all shadow-sm">
          <Upload size={16} />
          <span>{isUploading ? 'Uploading...' : 'Select File'}</span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};
