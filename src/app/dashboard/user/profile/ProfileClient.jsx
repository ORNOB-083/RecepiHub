"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Camera, Loader2, Crown, Upload, X } from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const SYNCED_KEY = 'recipehub_user_synced';
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY;

async function syncUser(email, name, image) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, image: image || 'https://placehold.co/100' }),
        });
        if (res.ok) { localStorage.setItem(SYNCED_KEY, 'true'); return true; }
        return false;
    } catch { return false; }
}

async function uploadToImgbb(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error('Image upload failed');
}

export default function ProfileClient({ user: initialUser }) {
    const { data: session } = useSession();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(initialUser);
    const [name, setName] = useState(initialUser?.name || '');
    const [imageUrl, setImageUrl] = useState(initialUser?.image || '');
    const [previewImage, setPreviewImage] = useState(initialUser?.image || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=F5726B&color=fff&size=120&bold=true`;

    useEffect(() => {
        if (user?.email) {
            const synced = localStorage.getItem(SYNCED_KEY);
            if (!synced) syncUser(user.email, user.name, user.image);
        }
    }, [user?.email]);

    // Handle file upload to imgbb
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!allowed.includes(file.type)) {
            toast.error('Only JPG, PNG, GIF, WEBP, BMP files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB');
            return;
        }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewImage(localUrl);

        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToImgbb(file);
            setImageUrl(uploadedUrl);
            setPreviewImage(uploadedUrl);
            toast.success('Image uploaded! Click Save Changes to apply.');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload image. Try a URL instead.');
            setPreviewImage(imageUrl || fallbackImage);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle manual URL input
    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setPreviewImage(url);
    };

    // Clear image
    const handleClearImage = () => {
        setImageUrl('');
        setPreviewImage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Save profile
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name is required'); return; }

        setIsLoading(true);
        try {
            const email = session?.user?.email || user?.email;
            if (!email) { toast.error('Please sign in'); return; }

            const body = { name: name.trim() };
            if (imageUrl.trim()) body.image = imageUrl.trim();

            const res = await fetch(`${BASE_URL}/api/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok && data.email) {
                setUser(data);
                setPreviewImage(data.image || '');
                setImageUrl(data.image || '');
                // Show toast BEFORE reload
                toast.success('Profile updated successfully!', { duration: 2000 });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 pt-8 max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your personal information</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-md">
                                {isUploading ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    </div>
                                ) : (
                                    <img
                                        src={previewImage || fallbackImage}
                                        alt={user?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = fallbackImage; }}
                                    />
                                )}
                            </div>

                            {/* Click to upload overlay */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            >
                                <Upload className="w-6 h-6 text-white" />
                            </button>

                            <div className="absolute -bottom-1 -right-1 bg-[#F5726B] p-2 rounded-full shadow-lg border-2 border-white dark:border-[#1a1d24]">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                            {user?.isPremium && (
                                <div className="absolute -top-1 -left-1 bg-gradient-to-r from-yellow-400 to-yellow-600 p-1 rounded-full shadow-md border-2 border-white dark:border-[#1a1d24]">
                                    <Crown className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Upload button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload className="w-4 h-4" /> Upload from device</>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${user?.role === 'admin' ? 'from-zinc-700 to-zinc-900' : 'from-amber-500 to-orange-500'
                                } text-white`}>
                                {user?.role || 'user'}
                            </span>
                            {user?.isPremium && (
                                <span className="inline-block ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Profile Image URL
                                <span className="ml-1 text-xs font-normal text-gray-400">(or upload above)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={handleImageUrlChange}
                                    placeholder="https://example.com/photo.jpg"
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                />
                                {imageUrl && (
                                    <button
                                        type="button"
                                        onClick={handleClearImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                Paste an image URL or upload from your device above
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="w-full py-3.5 rounded-xl bg-[#F5726B] hover:bg-[#e85f58] text-white font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                                ) : isUploading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading image...</>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}