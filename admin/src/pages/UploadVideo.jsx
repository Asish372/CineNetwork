import React, { useState } from 'react';
import Layout from '../components/Layout';
import { UploadCloud, FileVideo, X } from 'lucide-react';
import axios from 'axios';

export default function UploadVideo() {
  const [file, setFile] = useState(null);
  const [contentId, setContentId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !contentId) return alert("Please select a file and enter Content ID");

    const formData = new FormData();
    formData.append('video', file);
    formData.append('contentId', contentId);

    setUploading(true);
    setProgress(0);

    try {
        const token = sessionStorage.getItem('admin_token');
        await axios.post('http://localhost:5000/api/video/upload', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            }
        });
        
        alert("Upload Successful! Transcoding started in background.");
        setFile(null);
        setContentId('');
        setProgress(0);
    } catch (error) {
        console.error(error);
        alert("Upload Failed: " + (error.response?.data?.message || error.message));
    } finally {
        setUploading(false);
    }
  };

  return (
    <Layout title="Upload New Video">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold mb-6">Video Details</h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
                
                {/* Content ID Input */}
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Content ID (Database ID)</label>
                    <input 
                        type="text" 
                        className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-primary border border-transparent"
                        placeholder="e.g. 101"
                        value={contentId}
                        onChange={(e) => setContentId(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Found in 'All Videos' section (or create new content first).</p>
                </div>

                {/* File Drop Area */}
                <div className="border-2 border-dashed border-[#444] rounded-lg p-8 text-center hover:border-primary transition cursor-pointer relative">
                    <input 
                        type="file" 
                        accept="video/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                    
                    {!file ? (
                        <div className="flex flex-col items-center">
                            <UploadCloud size={48} className="text-gray-500 mb-4" />
                            <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                            <p className="text-gray-500 text-sm mt-1">MP4, MKV, MOV (Max 2GB)</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-[#333] p-4 rounded text-left z-10 relative">
                            <div className="flex items-center gap-4">
                                <FileVideo size={32} className="text-primary" />
                                <div>
                                    <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-gray-500 text-xs">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {uploading && (
                    <div className="w-full bg-[#333] rounded-full h-2.5">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                        <p className="text-right text-xs text-gray-400 mt-1">{progress}% Uploaded</p>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button 
                        disabled={uploading || !file || !contentId}
                        className={`px-6 py-3 rounded font-bold text-white transition ${
                            (uploading || !file || !contentId) ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                        }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </Layout>
  );
}
