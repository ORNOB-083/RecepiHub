"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, Upload, X, Crown, AlertCircle } from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY;

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

export default function AddRecipeClient({ user: initialUser }) {
    const router = useRouter();
    const { data: session } = useSession();
    // const user = session?.user || initialUser;
    const sessionUser = session?.user;
    const user = initialUser ? { ...sessionUser, ...initialUser } : sessionUser;

    const [recipeName, setRecipeName] = useState('');
    const [category, setCategory] = useState('');
    const [cuisineType, setCuisineType] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [preparationTime, setPreparationTime] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recipeCount, setRecipeCount] = useState(0);

    // ── Fetch user's recipe count ──
    useEffect(() => {
        if (user?.email) {
            // ✅ Use authorEmail, not creatorEmail
            fetch(`${BASE_URL}/api/recipes?authorEmail=${user.email}&perPage=1`, {
                headers: { 'user-email': user.email }
            })
                .then(res => res.json())
                .then(data => {
                    console.log('Recipe count response:', data); // debug
                    if (data.total !== undefined) setRecipeCount(data.total);
                })
                .catch(console.error);
        }
    }, [user]);

    const isPremium = user?.isPremium || false;
    const maxRecipes = isPremium ? Infinity : 2;
    const remaining = maxRecipes === Infinity ? 'Unlimited' : Math.max(0, maxRecipes - recipeCount);
    const canAdd = isPremium || recipeCount < 2;

    // ── Handlers (unchanged) ──
    const handleImageChange = async (e) => {
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

        setImageFile(file);
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToImgbb(file);
            setImageUrl(uploadedUrl);
            toast.success('Image uploaded!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload image. Please try again.');
            setImagePreview('');
            setImageFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setImageUrl('');
        document.getElementById('image-input').value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canAdd) {
            toast.error(`You've reached the limit of ${maxRecipes} recipes. Upgrade to premium for unlimited.`);
            return;
        }

        if (!recipeName.trim()) { toast.error('Recipe name is required'); return; }
        if (!imageUrl) { toast.error('Please upload a recipe image'); return; }
        if (!category) { toast.error('Category is required'); return; }
        if (!cuisineType) { toast.error('Cuisine type is required'); return; }
        if (!difficultyLevel) { toast.error('Difficulty level is required'); return; }
        if (!preparationTime) { toast.error('Preparation time is required'); return; }
        if (!ingredients.trim()) { toast.error('Ingredients are required'); return; }
        if (!instructions.trim()) { toast.error('Instructions are required'); return; }

        setIsSubmitting(true);

        try {
            const payload = {
                recipeName: recipeName.trim(),
                recipeImage: imageUrl,
                category,
                cuisineType,
                difficultyLevel,
                preparationTime: parseInt(preparationTime),
                ingredients: ingredients.split('\n').filter(s => s.trim()),
                instructions: instructions.split('\n').filter(s => s.trim()),
            };

            const res = await fetch(`${BASE_URL}/api/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': user.email,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Recipe added successfully!');
                router.push('/dashboard/user/my-recipes');
                router.refresh();
            } else {
                toast.error(data.message || 'Failed to add recipe');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Beverage', 'Other'];
    const cuisines = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French', 'American', 'Thai', 'Other'];
    const difficultyLevels = ['Easy', 'Medium', 'Hard'];

    return (
        <div className="p-6 pt-8 max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Recipe</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Share your culinary creation with the community.
                </p>
            </motion.div>

            {/* Limit info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`p-4 rounded-xl border ${isPremium
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}
            >
                <div className="flex items-start gap-3">
                    {isPremium ? (
                        <Crown className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {isPremium
                                ? '🎉 Premium Member – You can add unlimited recipes!'
                                : `You've added ${recipeCount} of ${maxRecipes} recipes.`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {isPremium
                                ? 'Enjoy unlimited recipe sharing.'
                                : `You can add ${remaining === 'Unlimited' ? 'unlimited' : remaining} more recipe${remaining !== 1 ? 's' : ''}.`}
                        </p>
                        {!isPremium && (
                            <Link
                                href="/dashboard/user/upgrade"
                                className="inline-block mt-2 text-xs font-semibold text-[#F5726B] hover:underline"
                            >
                                Upgrade to Premium →
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* ── Recipe Name ── */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Recipe Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            placeholder="e.g., Classic Margherita Pizza"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                        />
                    </div>

                    {/* ── Image Upload ── */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Recipe Image <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl transition-all hover:border-[#F5726B]">
                            {imagePreview ? (
                                <div className="relative w-full max-w-xs">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Click to upload or drag & drop
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        JPG, PNG, GIF, WEBP (max 5MB)
                                    </p>
                                </>
                            )}
                            <input
                                id="image-input"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            {!imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('image-input').click()}
                                    className="px-4 py-2 rounded-xl bg-[#F5726B] text-white text-sm font-semibold hover:bg-[#e85f58] transition-all"
                                >
                                    Choose Image
                                </button>
                            )}
                            {isUploading && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Category & Cuisine ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Cuisine Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={cuisineType}
                                onChange={(e) => setCuisineType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                            >
                                <option value="">Select cuisine</option>
                                {cuisines.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Difficulty & Prep Time ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Difficulty Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={difficultyLevel}
                                onChange={(e) => setDifficultyLevel(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                            >
                                <option value="">Select difficulty</option>
                                {difficultyLevels.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Preparation Time (minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={preparationTime}
                                onChange={(e) => setPreparationTime(e.target.value)}
                                placeholder="e.g., 30"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                            />
                        </div>
                    </div>

                    {/* ── Ingredients ── */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Ingredients <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs font-normal text-gray-400">(one per line)</span>
                        </label>
                        <textarea
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            rows="5"
                            placeholder="2 cups all-purpose flour&#10;1 tsp yeast&#10;1/2 cup water&#10;..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                        />
                    </div>

                    {/* ── Instructions ── */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Instructions <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs font-normal text-gray-400">(one step per line)</span>
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows="6"
                            placeholder="1. Preheat oven to 475°F.&#10;2. Mix flour, yeast, water...&#10;3. ..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                        />
                    </div>

                    {/* ── Submit ── */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading || !canAdd}
                            className="w-full py-3.5 rounded-xl bg-[#F5726B] hover:bg-[#e85f58] text-white font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Adding Recipe...</>
                            ) : (
                                'Add Recipe'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}