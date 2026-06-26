"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Loader2,
    Search,
    Pencil,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Upload,
    X,
    CheckCircle,
    XCircle,
    Star,
    RefreshCw,
    Filter,
} from "lucide-react";

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

export default function AdminRecipesClient({ user }) {
    const { data: session } = useSession();
    const adminUser = session?.user || user;

    const [recipes, setRecipes] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Edit modal state ──
    const [editModal, setEditModal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingEdit, setIsUploadingEdit] = useState(false);
    const fileInputRef = useRef(null);

    const [editRecipeName, setEditRecipeName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editCuisineType, setEditCuisineType] = useState('');
    const [editDifficultyLevel, setEditDifficultyLevel] = useState('');
    const [editPreparationTime, setEditPreparationTime] = useState('');
    const [editIngredients, setEditIngredients] = useState('');
    const [editInstructions, setEditInstructions] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [editImagePreview, setEditImagePreview] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);

    // ── Delete modal ──
    const [deleteModal, setDeleteModal] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Feature/unfeature ──
    const [featureLoading, setFeatureLoading] = useState(null);

    // ── Status update ──
    const [statusLoading, setStatusLoading] = useState(null);

    // ── Fetch recipes ──
    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                perPage,
            });
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const url = `${BASE_URL}/api/admin/recipes?${params.toString()}`;
            console.log('Fetching admin recipes from:', url);
            console.log('Using user-email:', adminUser.email);

            const res = await fetch(url, {
                headers: { 'user-email': adminUser.email },
            });

            console.log('Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                setRecipes(data.recipes || []);
                setTotal(data.total || 0);
            } else {
                const text = await res.text();
                console.error('Server error:', res.status, text);
                toast.error(`Server error ${res.status}: ${text}`);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Network error – check console for details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRecipes();
    }, [page, search, statusFilter]);

    // ── Delete ──
    const handleDelete = async () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/recipes/${deleteModal}`, {
                method: 'DELETE',
                headers: { 'user-email': adminUser.email },
            });
            if (res.ok) {
                toast.success('Recipe deleted');
                setDeleteModal(null);
                fetchRecipes();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Delete failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Feature toggle ──
    const handleFeature = async (recipeId, currentFeatured) => {
        setFeatureLoading(recipeId);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}/feature`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': adminUser.email,
                },
                body: JSON.stringify({ isFeatured: !currentFeatured }),
            });
            if (res.ok) {
                toast.success(currentFeatured ? 'Unfeatured' : 'Featured');
                fetchRecipes();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Feature toggle failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setFeatureLoading(null);
        }
    };

    // ── Status update (uses /verify) ──
    const handleStatus = async (recipeId, newStatus) => {
        setStatusLoading(recipeId);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': adminUser.email,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                fetchRecipes();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Status update failed');
            }
        } catch (err) {
            console.error('Status update error:', err);
            toast.error('Something went wrong');
        } finally {
            setStatusLoading(null);
        }
    };

    // ── Edit modal handlers ──
    const openEditModal = (recipe) => {
        setEditModal(recipe);
        setEditRecipeName(recipe.recipeName || '');
        setEditCategory(recipe.category || '');
        setEditCuisineType(recipe.cuisineType || '');
        setEditDifficultyLevel(recipe.difficultyLevel || '');
        setEditPreparationTime(recipe.preparationTime || '');
        setEditIngredients((recipe.ingredients || []).join('\n'));
        setEditInstructions((recipe.instructions || []).join('\n'));
        setEditImageUrl(recipe.recipeImage || '');
        setEditImagePreview(recipe.recipeImage || '');
        setEditImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditImageChange = async (e) => {
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
        setEditImageFile(file);
        const localUrl = URL.createObjectURL(file);
        setEditImagePreview(localUrl);
        setIsUploadingEdit(true);
        try {
            const uploadedUrl = await uploadToImgbb(file);
            setEditImageUrl(uploadedUrl);
            toast.success('Image uploaded!');
        } catch {
            toast.error('Failed to upload image');
            setEditImagePreview(editImageUrl || '');
            setEditImageFile(null);
        } finally {
            setIsUploadingEdit(false);
        }
    };

    const removeEditImage = () => {
        setEditImageFile(null);
        setEditImagePreview('');
        setEditImageUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editModal) return;
        if (!editRecipeName.trim()) { toast.error('Recipe name is required'); return; }
        if (!editImageUrl && !editImageFile) { toast.error('Please provide a recipe image'); return; }
        if (!editCategory) { toast.error('Category is required'); return; }
        if (!editCuisineType) { toast.error('Cuisine type is required'); return; }
        if (!editDifficultyLevel) { toast.error('Difficulty level is required'); return; }
        if (!editPreparationTime) { toast.error('Preparation time is required'); return; }
        if (!editIngredients.trim()) { toast.error('Ingredients are required'); return; }
        if (!editInstructions.trim()) { toast.error('Instructions are required'); return; }

        setIsEditing(true);
        try {
            const payload = {
                recipeName: editRecipeName.trim(),
                recipeImage: editImageUrl || editImagePreview,
                category: editCategory,
                cuisineType: editCuisineType,
                difficultyLevel: editDifficultyLevel,
                preparationTime: parseInt(editPreparationTime),
                ingredients: editIngredients.split('\n').filter(s => s.trim()),
                instructions: editInstructions.split('\n').filter(s => s.trim()),
            };
            const res = await fetch(`${BASE_URL}/api/admin/recipes/${editModal._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': adminUser.email,
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast.success('Recipe updated');
                setEditModal(null);
                fetchRecipes();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsEditing(false);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    const statusOptions = ['all', 'pending', 'approved', 'rejected'];

    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Beverage', 'Other'];
    const cuisines = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French', 'American', 'Thai', 'Other'];
    const difficultyLevels = ['Easy', 'Medium', 'Hard'];

    // ── Status badge helper ──
    const getStatusBadge = (status) => {
        const configs = {
            approved: {
                bg: 'bg-green-50 dark:bg-green-900/30',
                border: 'border-green-200 dark:border-green-700',
                text: 'text-green-700 dark:text-green-400',
                icon: <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />,
            },
            rejected: {
                bg: 'bg-red-50 dark:bg-red-900/30',
                border: 'border-red-200 dark:border-red-700',
                text: 'text-red-700 dark:text-red-400',
                icon: <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
            },
            pending: {
                bg: 'bg-yellow-50 dark:bg-yellow-900/30',
                border: 'border-yellow-200 dark:border-yellow-700',
                text: 'text-yellow-700 dark:text-yellow-400',
                icon: null,
            },
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text}`}>
                {config.icon}
                {status || 'pending'}
            </span>
        );
    };

    // ── Status dropdown helper ──
    const getStatusDropdownStyles = (status) => {
        const configs = {
            approved: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400',
            rejected: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400',
            pending: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400',
        };
        return configs[status] || configs.pending;
    };

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Recipes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Review, edit, feature, and moderate all recipes.
                    </p>
                </motion.div>
                <button
                    onClick={fetchRecipes}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-[#1a1d24] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search recipes by name, author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 transition-all w-full sm:w-auto"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Recipe</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Author</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Category</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Featured</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map((recipe) => (
                            <tr key={recipe._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                            alt={recipe.recipeName}
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{recipe.recipeName}</p>
                                            <p className="text-xs text-gray-400">{recipe.cuisineType || 'Various'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{recipe.authorName || 'Unknown'}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{recipe.category || 'General'}</td>
                                <td className="px-4 py-3">
                                    {getStatusBadge(recipe.status)}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleFeature(recipe._id, recipe.isFeatured)}
                                        disabled={featureLoading === recipe._id}
                                        className="flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
                                    >
                                        {featureLoading === recipe._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Star className={`w-4 h-4 ${recipe.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                        )}
                                        {recipe.isFeatured ? 'Featured' : 'Feature'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1 flex-wrap">
                                        <select
                                            value={recipe.status || 'pending'}
                                            onChange={(e) => handleStatus(recipe._id, e.target.value)}
                                            disabled={statusLoading === recipe._id}
                                            className={`text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#F5726B] border ${getStatusDropdownStyles(recipe.status)}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                        </select>
                                        <a
                                            href={`/recipes/${recipe._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </a>
                                        <button
                                            onClick={() => openEditModal(recipe)}
                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal(recipe._id)}
                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-4">
                {recipes.map((recipe) => (
                    <div key={recipe._id} className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <img
                                src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                alt={recipe.recipeName}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white truncate">{recipe.recipeName}</p>
                                <p className="text-xs text-gray-400">{recipe.cuisineType || 'Various'}</p>
                                <p className="text-xs text-gray-400">By {recipe.authorName || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{recipe.category || 'General'}</span>
                            <span className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                            {getStatusBadge(recipe.status)}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleFeature(recipe._id, recipe.isFeatured)}
                                    disabled={featureLoading === recipe._id}
                                    className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
                                >
                                    {featureLoading === recipe._id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Star className={`w-3.5 h-3.5 ${recipe.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                    )}
                                    {recipe.isFeatured ? 'Featured' : 'Feature'}
                                </button>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                                <select
                                    value={recipe.status || 'pending'}
                                    onChange={(e) => handleStatus(recipe._id, e.target.value)}
                                    disabled={statusLoading === recipe._id}
                                    className={`text-xs rounded-lg px-2 py-1 border ${getStatusDropdownStyles(recipe.status)}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                </select>
                                <a
                                    href={`/recipes/${recipe._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                                </a>
                                <button
                                    onClick={() => openEditModal(recipe)}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                </button>
                                <button
                                    onClick={() => setDeleteModal(recipe._id)}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#F5726B] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1
                                ? 'bg-[#F5726B] text-white shadow-md'
                                : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#F5726B]'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#F5726B] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Delete Modal ── */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-red-500">
                                    <AlertCircle className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Recipe</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete this recipe? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setDeleteModal(null)}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Edit Modal ── */}
            <AnimatePresence>
                {editModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm overflow-y-auto py-8"
                        onClick={() => setEditModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white dark:bg-[#1a1d24] border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Recipe</h2>
                                <button
                                    onClick={() => setEditModal(null)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                                {/* Recipe Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Recipe Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editRecipeName}
                                        onChange={(e) => setEditRecipeName(e.target.value)}
                                        placeholder="e.g., Classic Margherita Pizza"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Recipe Image <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl transition-all hover:border-[#F5726B]">
                                        {editImagePreview ? (
                                            <div className="relative w-full max-w-xs">
                                                <img
                                                    src={editImagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeEditImage}
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
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                                            onChange={handleEditImageChange}
                                            className="hidden"
                                        />
                                        {!editImagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 rounded-xl bg-[#F5726B] text-white text-sm font-semibold hover:bg-[#e85f58] transition-all"
                                            >
                                                Choose Image
                                            </button>
                                        )}
                                        {isUploadingEdit && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Category & Cuisine */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
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
                                            value={editCuisineType}
                                            onChange={(e) => setEditCuisineType(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                        >
                                            <option value="">Select cuisine</option>
                                            {cuisines.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Difficulty & Prep Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Difficulty Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editDifficultyLevel}
                                            onChange={(e) => setEditDifficultyLevel(e.target.value)}
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
                                            value={editPreparationTime}
                                            onChange={(e) => setEditPreparationTime(e.target.value)}
                                            placeholder="e.g., 30"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Ingredients <span className="text-red-500">*</span>
                                        <span className="ml-1 text-xs font-normal text-gray-400">(one per line)</span>
                                    </label>
                                    <textarea
                                        value={editIngredients}
                                        onChange={(e) => setEditIngredients(e.target.value)}
                                        rows="5"
                                        placeholder="2 cups all-purpose flour&#10;1 tsp yeast&#10;1/2 cup water&#10;..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                    />
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Instructions <span className="text-red-500">*</span>
                                        <span className="ml-1 text-xs font-normal text-gray-400">(one step per line)</span>
                                    </label>
                                    <textarea
                                        value={editInstructions}
                                        onChange={(e) => setEditInstructions(e.target.value)}
                                        rows="6"
                                        placeholder="1. Preheat oven to 475°F.&#10;2. Mix flour, yeast, water...&#10;3. ..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                                    />
                                </div>

                                {/* Submit */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isEditing || isUploadingEdit}
                                        className="w-full py-3.5 rounded-xl bg-[#F5726B] hover:bg-[#e85f58] text-white font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isEditing ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                                        ) : (
                                            'Update Recipe'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}