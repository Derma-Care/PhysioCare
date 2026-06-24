import { Delete, Edit2, Pencil, Trash, Trash2 } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
} from '@coreui/react'
import { COLORS } from "../../Constant/Themes";
import { uploadFile } from '../widgets/S3UploadServiceDoctor';
import { BASE_URL } from '../../baseUrl';
import { http } from '../../Utils/Interceptors';
import ConfirmationModal from '../../components/ConfirmationModal';
import { showCustomToast } from '../../Utils/Toaster';
import LoadingIndicator from '../../Utils/loader';
// ─── Config ───────────────────────────────────────────────────────────────────



const CATEGORIES = ['support', 'mobility', 'therapy', 'diagnostic', 'other'];

const EMPTY_FORM = { name: '', description: '', image: '', category: '', imageType: 'upload', imagePreview: '' };


// ─── Badge colors per category ────────────────────────────────────────────────

const BADGE_COLORS = {
    support: { background: '#E6F1FB', color: '#0C447C' },
    mobility: { background: '#E1F5EE', color: '#085041' },
    therapy: { background: '#FBEAF0', color: '#72243E' },
    diagnostic: { background: '#FAEEDA', color: '#633806' },
    other: { background: '#F1EFE8', color: '#444441' },
};

const getBadgeStyle = (category) => ({
    ...styles.badge,
    ...(BADGE_COLORS[category] || BADGE_COLORS.other),
});

// ─── Toast hook ───────────────────────────────────────────────────────────────

const useToast = () => {
    const [toast, setToast] = useState({ msg: '', type: '', visible: false });
    const timerRef = useRef(null);

    const show = (msg, type = 'success') => {
        clearTimeout(timerRef.current);
        setToast({ msg, type, visible: true });
        timerRef.current = setTimeout(
            () => setToast((t) => ({ ...t, visible: false })),
            2800
        );
    };

    return { toast, show };
};

// ─── Image Preview ────────────────────────────────────────────────────────────

const ImagePreview = ({ url }) => {
    const [broken, setBroken] = useState(false);
    useEffect(() => setBroken(false), [url]);
    const isValid = !!url;

    return (
        <div style={styles.imgPreview}>
            {isValid && !broken ? (
                <img
                    src={url}
                    alt="Preview"
                    onError={() => setBroken(true)}
                    style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 8 }}
                />
            ) : (
                <div style={styles.imgPlaceholder}>
                    <span style={{ fontSize: 28, marginBottom: 4 }}>🖼️</span>
                    <span style={{ fontSize: 12, color: '#888780' }}>
                        {broken ? 'Cannot load image' : 'No image provided'}
                    </span>
                </div>
            )}
        </div>
    );
};

// ─── Equipment Card ───────────────────────────────────────────────────────────

const EquipmentCard = ({ item, onEdit, onDelete }) => {
    const [imgBroken, setImgBroken] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    return (
        <>
            <div style={styles.card}>
                <div
                    style={{
                        ...styles.cardImg,
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                    onClick={() => setShowViewModal(true)}
                    title="Click to view"
                >
                    {/* Category Badge */}
                    <span
                        style={{
                            ...getBadgeStyle(item.category),
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            marginBottom: 0,
                            zIndex: 1,
                        }}
                    >
                        {item.category}
                    </span>

                    {item.image && !imgBroken ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            onError={() => setImgBroken(true)}
                            style={{
                                width: '100%',
                                height: 140,
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div style={styles.cardImgPlaceholder}>🖼️</div>
                    )}
                </div>

                <div style={styles.cardBody}>
                    <div>
                        <div style={styles.cardName}>{item.name}</div>
                    </div>
                </div>
            </div >

            {/* View Modal - opens when image is clicked */}
            < CModal
                visible={showViewModal}
                onClose={() => setShowViewModal(false)}
                size="md"
                className="custom-modal"
                alignment="center"
            >
                <CModalHeader>
                    <CModalTitle style={{ fontSize: 16, fontWeight: 600 }}>
                        {item.name}
                    </CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <div style={styles.viewImgWrap}>
                        {item.image && !imgBroken ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: 220, objectFit: 'contain', borderRadius: 8 }}
                            />
                        ) : (
                            <div style={styles.cardImgPlaceholder}>🖼️</div>
                        )}
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <span style={getBadgeStyle(item.category)}>{item.category}</span>
                    </div>

                    <div style={styles.viewDescLabel}>Description</div>
                    <div style={styles.viewDescText}>
                        {item.description || 'No description'}
                    </div>
                </CModalBody>

                <CModalFooter>

                    <button
                        className="cm-action-btn edit"
                        title="Edit"
                        onClick={() => {
                            setShowViewModal(false);
                            onEdit(item);
                        }}
                    >
                        <Edit2 size={15} />
                    </button>

                    <button
                        className="cm-action-btn delete"
                        title="Delete"
                        onClick={() => {
                            setShowViewModal(false);
                            onDelete(item);
                        }}
                    >
                        <Trash2 size={15} />
                    </button>

                    {/* <button
                        className="cm-action-btn delete"
                        title="Delete"
                        onClick={() => {
                            setShowViewModal(false);
                            onDelete(item);
                        }}
                        style={styles.viewFooterBtnDelete}
                    >
                        <Trash2 size={15} style={{ marginRight: 6 }} />
                        Delete
                    </button>

                    <button
                        className="cm-action-btn edit"
                        title="Edit"
                        onClick={() => {
                            setShowViewModal(false);
                            onEdit(item);
                        }}
                        style={styles.viewFooterBtnEdit}
                    >
                        <Edit2 size={15} style={{ marginRight: 6 }} />
                        Edit
                    </button> */}
                </CModalFooter>
            </CModal >
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EquipmentManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { toast, show: showToast } = useToast();
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageChanged, setImageChanged] = useState(false);
    // ── GET all ──
    const loadRecoverySupports = async () => {
        const clinicId = localStorage.getItem("HospitalId")
        try {
            setLoading(true);

            const { data } = await http.get(
                `/getAllRecoverySupportsByClinicId/${clinicId}`
            );

            if (data.success) {
                setItems(data.data || []);
            }
        } catch (error) {
            console.error(error);
            showCustomToast("Failed to load recovery supports", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecoverySupports();
    }, []);



    const openEdit = (item) => {
        setEditingItem(item);
        setImageChanged(false);
        setForm({
            name: item.name,
            description: item.description,
            image: item.image, // store key
            imagePreview: item.image,           // store url for preview
            category: item.category,
            imageType: 'upload'
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setImageChanged(false); // ADD THIS
        setForm(EMPTY_FORM);
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg") {
                showCustomToast("Only JPG and PNG images are allowed", "error");
                return;
            }

            if (file.size > 250 * 1024) { // Max 250KB
                showCustomToast("Image size should be less than 250KB", "error");
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            setForm((prev) => ({ ...prev, imagePreview: objectUrl }));
            setUploading(true);

            const fileKey = await uploadFile(
                "recoverySupportImage",
                file
            );
            setImageChanged(true);
            setForm((prev) => ({
                ...prev,
                image: fileKey,
            }));

            showCustomToast("Image uploaded successfully");
        } catch (error) {
            console.error(error);
            showCustomToast("Image upload failed", "error");
        } finally {
            setUploading(false);
        }
    };
    const createRecoverySupport = async () => {
        try {
            const payload = {
                name: form.name,
                description: form.description,
                image: form.image,
                category: form.category,
                clinicId: localStorage.getItem("HospitalId")
            };

            const res = await http.post(
                "/saveRecoverySupport",
                payload
            );

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            showCustomToast("Recovery support added successfully");

            closeForm();
            loadRecoverySupports();
        } catch (error) {
            showCustomToast(error.message, "error");
        }
    };
    const getImageKey = (url) => {
        if (!url) return null;

        // already a key
        if (!url.startsWith("http")) return url;

        const match = url.match(/recovery-support-images\/[^?]+/);

        return match ? match[0] : url;
    };
    const updateRecoverySupport = async () => {
        try {
            const payload = {
                clinicId: localStorage.getItem("HospitalId"),
                name: form.name,
                description: form.description,
                category: form.category,
                image: getImageKey(form.image),
            };
            if (imageChanged) {
                payload.image = form.image;
            }

            const res = await http.put(
                `/updateRecoverySupportById/${editingItem.id}`,
                payload
            );

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            showCustomToast(res.data.message || "Recovery support updated successfully", "success");

            closeForm();
            loadRecoverySupports();
        } catch (error) {
            showCustomToast(error.message, "error");
        }
    };

    // ── POST / PUT ──
    const handleSubmit = async () => {

        if (!form.name?.trim()) {
            showCustomToast("Name is required", "error");
            return;
        }

        if (!form.category) {
            showCustomToast("Category is required", "error");
            return;
        }

        if (!form.description?.trim()) {
            showCustomToast("Description is required", "error");
            return;
        }

        if (!form.image) {
            showCustomToast("Please upload image", "error");
            return;
        }

        try {
            setSubmitting(true);

            if (editingItem) {
                await updateRecoverySupport();
            } else {
                await createRecoverySupport();
            }
        } finally {
            setSubmitting(false);
        }
    };



    // ── DELETE ──
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);

            const res = await http.delete(
                `/deleteRecoverySupportById/${deleteTarget.id}`
            );

            if (!res.data.success) {
                throw new Error(res.data.message || "Delete failed");
            }

            showCustomToast(res.data?.message || 'Recovery support deleted successfully!', "success")

            setDeleteTarget(null);
            setIsDeleteModalVisible(false);

            loadRecoverySupports();
        } catch (error) {
            showCustomToast(error.message || "Delete failed", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Render ──
    return (
        <div style={styles.root}>

            {/* Toast */}
            {toast.visible && (
                <div
                    style={{
                        ...styles.toast,
                        ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess),
                    }}
                >
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.pageTitle}>Recovery Support</h1>
                    <p style={styles.pageSub}>
                        {items.length} item{items.length !== 1 ? 's' : ''} in inventory
                    </p>
                </div>
                <CButton
                    style={styles.commonBtn}
                    // style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                    onClick={() => {
                        setEditingItem(null)
                        setShowForm(true)
                    }}
                >
                    Add Equipment
                </CButton>
            </div>

            {/* Add / Edit Form */}
            <CModal
                visible={showForm}
                onClose={closeForm}
                size="lg"
                className='custom-modal'
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle>
                        {editingItem ? '✏️ Edit Equipment' : '➕ Add Equipment'}
                    </CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <div style={styles.formGrid}>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Neck Belt"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Category *</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Usage instructions or details..."
                                rows={3}
                                style={{ ...styles.input, resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Equipment Image <span style={{ color: 'red' }}>*</span></label>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '8px', padding: '10px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input
                                        type="radio"
                                        name="imageType"
                                        value="upload"
                                        checked={form.imageType === 'upload'}
                                        onChange={() => setForm({ ...form, imageType: 'upload', image: '', imagePreview: '' })}
                                    />
                                    Upload File
                                </label>
                                {/* <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input 
                                        type="radio" 
                                        name="imageType" 
                                        value="url" 
                                        checked={form.imageType === 'url'} 
                                        onChange={() => setForm({ ...form, imageType: 'url', image: '', imagePreview: '' })} 
                                    />
                                    Provide Image URL
                                </label> */}
                            </div>

                            {form.imageType === 'upload' ? (
                                <div style={{ position: 'relative', overflow: 'hidden', display: 'block', width: '100%', marginBottom: '10px' }}>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleImageChange}
                                        style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                    />
                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px 12px', textAlign: 'center', background: '#f8fafc', color: '#64748b' }}>
                                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>☁️</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#185fa5' }}>Click or drag image to upload</div>
                                        <div style={{ fontSize: '12px', marginTop: '6px' }}>Supports JPG, PNG (Max 250KB)</div>
                                    </div>
                                </div>
                            ) : (
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value, imagePreview: e.target.value })}
                                    style={styles.input}
                                />
                            )}

                            <ImagePreview url={form.imagePreview || form.image} />
                        </div>
                    </div>
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={closeForm}>
                        Cancel
                    </CButton>

                    <CButton
                        style={{ backgroundColor: COLORS.primary, color: "white" }}
                        onClick={handleSubmit}
                        disabled={submitting || uploading}
                    >
                        {uploading
                            ? "Uploading Image..."
                            : submitting
                                ? "Saving..."
                                : editingItem
                                    ? "Update Item"
                                    : "Save Item"}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Delete confirm */}
            {/* {deleteTarget && (
                <div style={styles.deleteConfirm}>
                    <p style={{ fontSize: 13, color: '#A32D2D', marginBottom: 12 }}>
                        ⚠️ Delete &quot;<strong>{deleteTarget.name}</strong>&quot;? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ ...styles.btnSm, ...styles.btnDanger }}
                            onClick={confirmDelete}
                        >
                            Yes, delete
                        </button>
                        <button style={styles.btnSm} onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )} */}

            {/* Loading */}
            {loading && (

                <LoadingIndicator message='Loading equipment…' />

            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
                <div style={styles.empty}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                    No equipment found. Add your first item above.
                </div>
            )}

            {/* Grid */}
            {!loading && items.length > 0 && (
                <div style={styles.grid}>
                    {items.map((item) => (
                        <EquipmentCard
                            key={item.id}
                            item={item}
                            onEdit={openEdit}
                            onDelete={(item) => {
                                setDeleteTarget(item);
                                setIsDeleteModalVisible(true);
                            }}
                        />
                    ))}
                </div>
            )}

            <ConfirmationModal
                isVisible={isDeleteModalVisible}
                title="Delete Recovery Support"
                message="Are you sure you want to delete this recovery support? This action cannot be undone."
                isLoading={isDeleting}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                confirmColor="danger"
                cancelColor="secondary"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setDeleteTarget(null);
                }}
            />

        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
    root: {


        margin: '0 auto',
        padding: '24px 16px',
        color: '#2C2C2A',
        position: 'relative',
    },
    commonBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        background: '#185fa5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '9px 18px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(24, 95, 165, 0.2)',
        transition: 'all 0.15s ease',
    },


    // Header
    header: {

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    pageTitle: { fontSize: 22, fontWeight: 600, color: '#2C2C2A', margin: 0 },
    pageSub: { fontSize: 13, color: '#888780', marginTop: 2 },

    // Buttons
    btn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid #D3D1C7',
        background: 'transparent',
        fontSize: 13,
        cursor: 'pointer',
        color: '#2C2C2A',

    },
    btnPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 18px',
        borderRadius: 8,
        border: '1px solid #2d4da0',
        background: '#3a5bbf',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',

    },


    btnSm: {
        padding: '5px 12px',
        borderRadius: 6,
        border: '1px solid #D3D1C7',
        background: 'transparent',
        fontSize: 12,
        cursor: 'pointer',
        color: '#2C2C2A',

    },
    btnDanger: {
        borderColor: '#F09595',
        color: '#A32D2D',
        background: '#FCEBEB',
    },

    // Form
    formPanel: {
        background: '#fff',
        border: '1px solid #D3D1C7',
        borderRadius: 12,
        padding: '20px',
        marginBottom: 20,
    },
    formTitle: { fontSize: 15, fontWeight: 600, color: '#2C2C2A', marginBottom: 16 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    field: { display: 'flex', flexDirection: 'column', gap: 5 },
    fieldLabel: { fontSize: 12, color: '#888780' },
    input: {
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid #D3D1C7',
        background: '#fff',
        color: '#2C2C2A',
        fontSize: 13,

        outline: 'none',
    },
    formActions: { display: 'flex', gap: 8, marginTop: 16 },

    // Image preview
    imgPreview: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        border: '1px dashed #D3D1C7',
        background: '#F1EFE8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: 6,
    },
    imgPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },

    // Cards
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
    },
    card: {
        background: '#fff',
        border: '1px solid #D3D1C7',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    cardImg: {
        width: '100%',
        height: 140,
        background: '#F1EFE8',
        overflow: 'hidden',
    },
    cardImgPlaceholder: {
        width: '100%',
        height: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        background: '#F1EFE8',
    },
    cardBody: { padding: '12px 14px' },
    cardName: { fontSize: 14, fontWeight: 600, color: '#2C2C2A', marginBottom: 4 },
    badge: {
        display: 'inline-block',
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 20,
        marginBottom: 8,
        fontWeight: 500,
    },
    cardDesc: {
        fontSize: 12,
        color: '#888780',
        marginBottom: 10,
        lineHeight: 1.5,
        minHeight: 34,
    },
    cardActions: { display: 'flex', gap: 6 },

    // View modal
    viewImgWrap: {
        width: '100%',
        height: 220,
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        background: '#F1EFE8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    viewDescLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#888780',
        marginTop: 16,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    viewDescText: {
        fontSize: 13,
        color: '#2C2C2A',
        lineHeight: 1.6,
    },
    viewFooterBtnDelete: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid #F09595',
        background: '#FCEBEB',
        color: '#A32D2D',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },
    viewFooterBtnEdit: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        background: '#185fa5',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },

    // Delete confirm
    deleteConfirm: {
        background: '#FCEBEB',
        border: '1px solid #F09595',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },

    // Toast
    toast: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 50,
    },
    toastSuccess: { background: '#E1F5EE', color: '#085041', border: '1px solid #5DCAA5' },
    toastError: { background: '#FCEBEB', color: '#791F1F', border: '1px solid #F09595' },

    // Loading / empty
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
    },
    spinner: {
        width: 28,
        height: 28,
        border: '3px solid #D3D1C7',
        borderTopColor: '#3a5bbf',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#888780',
        fontSize: 13,
    },

    cardBody: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        padding: '12px',
    },



    cardActions: {
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        borderTop: '1px solid #eee',
        paddingTop: '10px',
    },
};

export default EquipmentManager;