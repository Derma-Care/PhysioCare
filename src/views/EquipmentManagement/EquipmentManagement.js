import React, { useState, useEffect, useMemo } from 'react';
import {
  CRow, CCol, CModal, CModalHeader, CModalTitle,
  CModalBody, CButton, CSpinner, CModalFooter,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faEye, faClipboard,
  faBell, faBuilding, faCheckCircle, faExclamationTriangle,
  faCog, faBoxOpen, faWrench, faTimes,

} from '@fortawesome/free-solid-svg-icons';
import { showCustomToast } from '../../Utils/Toaster';
import './EquipmentManagement.css';
import { Edit, Edit2, Eye, Trash2 } from 'lucide-react';
import { uploadFile } from '../widgets/S3UploadServiceDoctor';
import { getAllEquipment, addEquipment, updateEquipment, deleteEquipment } from './EquipmentAPI';
import { wifiUrl } from '../../baseUrl';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilImage } from '@coreui/icons';
import ConfirmationModal from "../../components/ConfirmationModal";
import Pagination from '../../Utils/Pagination';
import { useHospital } from '../Usecontext/HospitalContext';
import { GetClinicBranches } from '../Doctors/DoctorAPI';
import { CFormSelect } from '@coreui/react';


// ─── Dropdown Constants ─────────────────────────────────────────────────────
const EQUIPMENT_CATEGORIES = ['Physiotherapy', 'Diagnostic', 'Rehabilitation', 'Surgical', 'Monitoring', 'Other'];
const EQUIPMENT_TYPES = ['Machine', 'Device', 'Instrument', 'Furniture', 'Software', 'Other'];
const DEPARTMENTS = ['Physiotherapy', 'Orthopedics', 'Neurology', 'Cardiology', 'General', 'ICU'];
const STATUS_OPTIONS = ['Active', 'Under Maintenance', 'Out of Service', 'Scrapped', 'In Warranty', 'AMC Active'];

// ─── Mock Dummy Data ─────────────────────────────────────────────────────────


const EMPTY_FORM = {
  name: '', category: '', type: '', brand: '', model: '',
  serialNo: '', status: 'Active', department: '', purchaseDate: '',
  warrantyExpiry: '', amcStartDate: '', amcEndDate: '',
  purchaseCost: '', currentValue: '', nextServiceDate: '',
  lastServiceDate: '', assignedStaff: '', notes: '', image: '',
  vendorDetails: {
    vendorName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    supportContractDetails: ''
  }
};

const EquipmentManagement = () => {
  const { setNotifications, setNotificationCount, globalBranchId } = useHospital() || {};
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const clearError = (field) => setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list | add
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // local object URL for preview
  const [imageModal, setImageModal] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState({ url: '', name: '' });
  const [imageChanged, setImageChanged] = useState(false);
  // Delete Modal State
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const role = sessionStorage.getItem('role');

  // ─── Derived Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: equipment.length,
    active: equipment.filter(e => e.status === 'Active').length,
    underService: equipment.filter(e => e.status === 'Under Maintenance').length,
    warranty: equipment.filter(e => e.status === 'In Warranty').length,
    amcActive: equipment.filter(e => e.status === 'AMC Active').length,
  }), [equipment]);

  // ─── Filtered List ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return equipment.filter(e => {
      const matchQ = !q || e.name?.toLowerCase().includes(q) || e.brand?.toLowerCase().includes(q) || e.serialNo?.toLowerCase().includes(q);
      const matchS = !statusFilter || e.status === statusFilter;
      return matchQ && matchS;
    });
  }, [equipment, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ─── Notifications (AMC/Warranty soon) ────────────────────────────────────
  const notifications = useMemo(() => {
    const today = new Date();
    const alerts = [];
    equipment.forEach(e => {
      const equipId = e.id || e._id || e.equipmentId;
      const warranty = e.warrantyExpiry ? new Date(e.warrantyExpiry) : null;
      const amc = e.amcEndDate ? new Date(e.amcEndDate) : null;
      const service = e.nextServiceDate ? new Date(e.nextServiceDate) : null;
      if (warranty) {
        const days = Math.ceil((warranty - today) / (1000 * 60 * 60 * 24));
        if (days <= 15 && days >= 0) alerts.push({ equip: e.name, type: 'Warranty', days, id: equipId });
      }
      if (amc) {
        const days = Math.ceil((amc - today) / (1000 * 60 * 60 * 24));
        if (days <= 7 && days >= 0) alerts.push({ equip: e.name, type: 'AMC', days, id: equipId });
      }
      if (service) {
        const days = Math.ceil((service - today) / (1000 * 60 * 60 * 24));
        if (days <= 2 && days >= 0) alerts.push({ equip: e.name, type: 'Service Due', days, id: equipId });
      }
    });
    return alerts;
  }, [equipment]);

  const activeNotifications = useMemo(() => {
    return notifications.filter(n => !dismissedAlerts.includes(`${n.type}-${n.id}`));
  }, [notifications, dismissedAlerts]);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Equipment name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.status) e.status = 'Status is required';
    if (!form.department) e.department = 'Department is required';
    if (form.purchaseCost && isNaN(form.purchaseCost)) e.purchaseCost = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Fetch Real Data ────────────────────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (globalBranchId) {
      fetchEquipmentData(globalBranchId);
    }
  }, [globalBranchId]);

  // Send consolidated Local Browser Notification
  useEffect(() => {
    if (notifications.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      const serviceCount = notifications.filter(n => n.type === 'Service Due').length;
      const amcCount = notifications.filter(n => n.type === 'AMC').length;
      const warrantyCount = notifications.filter(n => n.type === 'Warranty').length;

      const bodyParts = [];
      if (serviceCount > 0) bodyParts.push(`${serviceCount} service(s) due`);
      if (amcCount > 0) bodyParts.push(`${amcCount} AMC expiring`);
      if (warrantyCount > 0) bodyParts.push(`${warrantyCount} warranty expiring`);

      if (bodyParts.length > 0) {
        new Notification("PhysioCare Equipment Alerts", {
          body: bodyParts.join(', '),
          icon: '/favicon.ico'
        });
      }
    }
  }, [notifications]);

  // Synchronize equipment notifications into global AppHeader notifications panel
  useEffect(() => {
    if (!setNotifications) return;

    setNotifications((prev) => {
      // Clean previous equipment alerts to avoid duplicates
      const cleanPrev = (prev || []).filter(n => n.type !== 'EQUIPMENT_ALERT');

      const newAlerts = activeNotifications.map((n, idx) => ({
        id: `equip-${n.type}-${n.id || idx}`,
        title: `${n.type} Alert: ${n.equip}`,
        message: `${n.equip} is expiring/due in ${n.days} day(s).`,
        type: 'EQUIPMENT_ALERT',
        path: '/equipment-management'
      }));

      const merged = [...newAlerts, ...cleanPrev];

      if (setNotificationCount) {
        setNotificationCount(merged.length);
      }

      return merged;
    });
  }, [activeNotifications, setNotifications, setNotificationCount]);

  const fetchEquipmentData = async (branchIdOverride = globalBranchId) => {
    try {
      const clinicId = sessionStorage.getItem('HospitalId');
      const branchId = branchIdOverride || sessionStorage.getItem('branchId');
      if (!clinicId || !branchId) return;

      const res = await getAllEquipment(clinicId, branchId);
      const data = res?.data?.data || res?.data || [];
      setEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch equipment", error);
      showCustomToast('Failed to load equipment data.', 'error');
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const clinicId = sessionStorage.getItem('HospitalId');
      const branchId = globalBranchId || sessionStorage.getItem('branchId');

      // Preserve image: new upload takes priority, else keep existing imageUrl or image from backend
      const existingImage = form.imageUrl || form.image || form.equipmentImage || '';
      const finalImageUrl = existingImage;

      console.log('[EquipmentMgmt] Submit image debug:', {
        'form.image': form.image,
        'form.imageUrl': form.imageUrl,
        finalImageUrl,
        isEditing,
      });

      const payload = {
        ...form,
        clinicId,
        branchId,
        purchaseCost: Number(form.purchaseCost) || 0,
        currentValue: Number(form.currentValue) || 0,
        imageUrl: finalImageUrl,
        image: finalImageUrl,
      };
      if (!imageChanged) {
        delete payload.image;
        delete payload.imageUrl;
      }

      if (isEditing) {
        await updateEquipment(editingId, payload);
        showCustomToast('Equipment updated successfully.', 'success');
      } else {
        await addEquipment(payload);
        showCustomToast('Equipment added successfully.', 'success');
      }

      await fetchEquipmentData(); // Refresh data

      setIsFormVisible(false);
      setForm(EMPTY_FORM);
      setIsEditing(false);
    } catch (error) {
      console.error("Save equipment error", error);
      showCustomToast('Failed to save equipment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (equip) => {
    // Determine the stored image key from whichever field backend used
    const imgKey = equip.imageUrl || equip.image || equip.equipmentImage || '';

    // Merge with EMPTY_FORM; copy imgKey into BOTH image and imageUrl so it survives onChange spreads
    setForm({ ...EMPTY_FORM, ...equip, image: imgKey, imageUrl: imgKey });
    setImageChanged(false);
    setIsEditing(true);
    setEditingId(equip.equipmentId);
    setIsFormVisible(true);

    // Resolve S3 key → full URL for the preview panel
    if (imgKey) {
      const resolvedUrl = (imgKey.startsWith('http') || imgKey.startsWith('blob:'))
        ? imgKey
        : `${wifiUrl}/${imgKey}`;
      setImagePreview(resolvedUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteEquipment(deleteId);
      showCustomToast('Equipment deleted.', 'info');
      fetchEquipmentData();
    } catch (error) {
      console.error("Delete equipment error", error);
      showCustomToast('Failed to delete equipment.', 'error');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalVisible(false);
      setDeleteId(null);
    }
  };

  // ─── Image Upload Handler ─────────────────────────────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show instant local preview
    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const fileKey = await uploadFile('equipment', file);
      // Store in BOTH fields so imageUrl is never stale
      setForm(prev => ({ ...prev, image: fileKey, imageUrl: fileKey }));
      setImageChanged(true);
      showCustomToast('Image uploaded successfully.', 'success');
    } catch (err) {
      console.error('Image upload failed:', err);
      showCustomToast('Image upload failed. Please try again.', 'error');
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleView = (equip) => {
    setSelectedEquip(equip);
    setViewModal(true);
  };

  const getStatusClass = (status) => {
    const map = {
      'Active': 'em-badge-active',
      'Under Maintenance': 'em-badge-service',
      'Out of Service': 'em-badge-out',
      'Scrapped': 'em-badge-scrapped',
      'In Warranty': 'em-badge-warranty',
      'AMC Active': 'em-badge-amc',
    };
    return map[status] || 'em-badge-active';
  };

  const F = ({ label, val }) => (
    <div className="em-detail-row">
      <span className="em-detail-label">{label}</span>
      <span className="em-detail-val">{val || '—'}</span>
    </div>
  );

  return (
    <div className="em-wrapper">
      {/* ── Stat Cards ── */}
      <div className="em-stat-grid">
        <div className="em-stat-card total"><div className="em-stat-icon"><FontAwesomeIcon icon={faBoxOpen} /></div><div><div className="em-stat-num">{stats.total}</div><div className="em-stat-lbl">Total Equipment</div></div></div>
        <div className="em-stat-card active"><div className="em-stat-icon"><FontAwesomeIcon icon={faCheckCircle} /></div><div><div className="em-stat-num">{stats.active}</div><div className="em-stat-lbl">Active</div></div></div>
        <div className="em-stat-card service"><div className="em-stat-icon"><FontAwesomeIcon icon={faWrench} /></div><div><div className="em-stat-num">{stats.underService}</div><div className="em-stat-lbl">Under Service</div></div></div>
        <div className="em-stat-card warranty"><div className="em-stat-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></div><div><div className="em-stat-num">{stats.warranty}</div><div className="em-stat-lbl">In Warranty</div></div></div>
        <div className="em-stat-card amc"><div className="em-stat-icon"><FontAwesomeIcon icon={faCog} /></div><div><div className="em-stat-num">{stats.amcActive}</div><div className="em-stat-lbl">AMC Active</div></div></div>
      </div>

      {/* ── Notifications Strip ── */}
      {activeNotifications.length > 0 && (
        <div className="em-alerts-container mb-3">
          {activeNotifications.map((n, i) => {
            let icon = faExclamationTriangle;
            let typeClass = 'warranty';
            let title = 'Warranty Expiring';

            if (n.type === 'AMC') {
              icon = faCog;
              typeClass = 'amc';
              title = 'AMC Expiring';
            } else if (n.type === 'Service Due') {
              icon = faWrench;
              typeClass = 'service';
              title = 'Service Due';
            }

            const alertKey = `${n.type}-${n.id}`;

            return (
              <div key={i} className={`em-alert-card ${typeClass}`} style={{ position: 'relative', paddingRight: '36px' }}>
                <div className="em-alert-icon-wrapper">
                  <FontAwesomeIcon icon={icon} />
                </div>
                <div className="em-alert-content">
                  <span className="em-alert-title">{title}</span>
                  <span className="em-alert-desc">
                    <strong>{n.equip}</strong> is expiring/due in <strong>{n.days}</strong> day{n.days !== 1 ? 's' : ''}.
                  </span>
                </div>
                <button
                  onClick={() => setDismissedAlerts(prev => [...prev, alertKey])}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px',
                    color: 'inherit', opacity: 0.6, padding: '4px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                  onMouseOut={e => e.currentTarget.style.opacity = 0.6}
                  title="Dismiss alert"
                >✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Header ── */}
      <div className="em-header">
        <div>
          <h4 className="em-title">Equipment Management ({filtered.length})</h4>
          <p className="em-subtitle">Track, manage, and maintain all clinic equipment</p>
        </div>
        {isFormVisible ? (
          <div className="em-header-actions">
            <button className="em-btn em-btn-ghost" onClick={() => { setIsFormVisible(false); setForm(EMPTY_FORM); setErrors({}); }}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
            <button className="em-btn em-btn-primary" form="equipForm" type="submit">
              <FontAwesomeIcon icon={faCheckCircle} /> {isEditing ? 'Update' : 'Save Equipment'}
            </button>
          </div>
        ) : (
          <button className="em-btn em-btn-primary" onClick={() => { setForm(EMPTY_FORM); setIsEditing(false); setErrors({}); setImagePreview(null); setIsFormVisible(true); }}>
            <FontAwesomeIcon icon={faPlus} /> Add Equipment
          </button>
        )}
      </div>

      {/* ── Main Content ── */}
      {!isFormVisible ? (
        <>
          <div className="em-filters d-flex align-items-center gap-3">

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '340px' }}>
              <input
                className="em-search"
                style={{ width: '100%', paddingRight: searchQuery ? '30px' : '12px' }}
                placeholder="Search by name, brand, serial no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: '8px', background: 'none', border: 'none',
                    cursor: 'pointer', color: '#94a3b8', fontSize: '14px', lineHeight: 1,
                    display: 'flex', alignItems: 'center', padding: '2px',
                    borderRadius: '50%', transition: 'color 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#475569'}
                  onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                  title="Clear search"
                >✕</button>
              )}
            </div>
            <select className="em-select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="em-table-wrapper">
            {filtered.length === 0 ? (
              <div className="em-empty"><FontAwesomeIcon icon={faBoxOpen} size="3x" /><h6>No equipment found</h6><p>Add your first equipment record.</p></div>
            ) : (
              <CTable hover responsive className="em-table mb-0" align="middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Image</CTableHeaderCell>
                    <CTableHeaderCell>Name / Serial</CTableHeaderCell>
                    <CTableHeaderCell>Brand / Model</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Next Service</CTableHeaderCell>
                    <CTableHeaderCell>Warranty Expiry</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedData.map((eq, idx) => {
                    const equipId = eq.id || eq._id || eq.equipmentId || `fallback-${idx}`;
                    const eqImg = eq.imageUrl || eq.image;
                    return (
                      <CTableRow key={equipId}>
                        <CTableDataCell><span className="em-id-badge">{(currentPage - 1) * pageSize + idx + 1}</span></CTableDataCell>

                        {/* Image cell */}
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {eqImg
                            ? <img
                              src={eqImg.startsWith('http') ? eqImg : `${wifiUrl}/${eqImg}`}
                              alt={eq.name}
                              title="Click to enlarge"
                              onClick={() => { setSelectedImageData({ url: eqImg.startsWith('http') ? eqImg : `${wifiUrl}/${eqImg}`, name: eq.name }); setImageModal(true); }}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                              onMouseOver={e => e.target.style.transform = 'scale(1.15)'}
                              onMouseOut={e => e.target.style.transform = 'scale(1)'}
                            />
                            : <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto' }}>🔧</div>
                          }
                        </CTableDataCell>

                        <CTableDataCell><div className="em-name-cell"><strong>{eq.name}</strong><span>{eq.serialNo}</span></div></CTableDataCell>
                        <CTableDataCell><div className="em-name-cell"><strong>{eq.brand}</strong><span>{eq.model}</span></div></CTableDataCell>
                        <CTableDataCell>{eq.department || '—'}</CTableDataCell>
                        <CTableDataCell>{eq.nextServiceDate || '—'}</CTableDataCell>
                        <CTableDataCell>{eq.warrantyExpiry || '—'}</CTableDataCell>
                        <CTableDataCell><span className={`em-badge ${getStatusClass(eq.status)}`}>{eq.status}</span></CTableDataCell>
                        <CTableDataCell>
                          <div className="em-actions">
                            <button className="em-icon-btn view" onClick={() => handleView(eq)} title="View"><Eye /></button>
                            <button className="em-icon-btn edit" onClick={() => openEdit(eq)} title="Edit"><Edit2 /></button>
                            <button className="em-icon-btn delete" onClick={() => handleDelete(equipId)} title="Delete"><Trash2 /></button>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}
            {filtered.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </div>
        </>
      ) : (
        /* ── Add / Edit Form ── */
        <form id="equipForm" onSubmit={handleSubmit} className="em-form">
          {/* Basic Info */}
          <div className="em-form-section">
            <h5 className="em-section-title"><FontAwesomeIcon icon={faBoxOpen} /> Basic Information</h5>
            <CRow>
              <CCol md={4} className="mb-3">
                <label className="em-label">Equipment Name <span className="em-req">*</span></label>
                <input className={`em-input ${errors.name ? 'em-input-err' : ''}`} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); clearError('name'); }} placeholder="e.g. Ultrasound Machine" />
                {errors.name && <span className="em-err">{errors.name}</span>}
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Category <span className="em-req">*</span></label>
                <select className={`em-select ${errors.category ? 'em-input-err' : ''}`} value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); clearError('category'); }}>
                  <option value="">Select Category</option>
                  {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <span className="em-err">{errors.category}</span>}
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Equipment Type</label>
                <select className="em-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="">Select Type</option>
                  {EQUIPMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Brand Name</label>
                <input className="em-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Siemens" />
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Model Number</label>
                <input className="em-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. ACUSON X300" />
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Serial Number</label>
                <input className="em-input" value={form.serialNo} onChange={e => setForm({ ...form, serialNo: e.target.value })} placeholder="e.g. SN-20240101" />
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Department <span className="em-req">*</span></label>
                <select className={`em-select ${errors.department ? 'em-input-err' : ''}`} value={form.department} onChange={e => { setForm({ ...form, department: e.target.value }); clearError('department'); }}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {errors.department && <span className="em-err">{errors.department}</span>}
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Assigned Staff</label>
                <input className="em-input" value={form.assignedStaff} onChange={e => setForm({ ...form, assignedStaff: e.target.value })} placeholder="e.g. Dr. Rajan" />
              </CCol>


              <CCol md={4} className="mb-3">
                <label className="em-label">Status <span className="em-req">*</span></label>
                <select className={`em-select ${errors.status ? 'em-input-err' : ''}`} value={form.status} onChange={e => { setForm({ ...form, status: e.target.value }); clearError('status'); }}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.status && <span className="em-err">{errors.status}</span>}
              </CCol>

              <CCol md={6} className="mb-3">
                <label className="em-label">Equipment Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Upload Button */}
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '8px', cursor: imageUploading ? 'not-allowed' : 'pointer',
                    background: imageUploading ? '#e2e8f0' : '#eff6ff', border: '1.5px dashed #1B4F8A',
                    color: '#1B4F8A', fontWeight: 600, fontSize: '0.875rem', width: 'fit-content',
                    opacity: imageUploading ? 0.7 : 1
                  }}>
                    {imageUploading
                      ? <><CSpinner size="sm" /> Uploading...</>
                      : <><span style={{ fontSize: '1.1rem' }}>📷</span> {imagePreview ? 'Change Image' : 'Upload Image'}</>
                    }
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={imageUploading}
                      onChange={handleImageSelect}
                    />
                  </label>
                  {/* Preview */}
                  {imagePreview && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <img
                        src={imagePreview}
                        alt="Equipment Preview"
                        style={{ height: '90px', width: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => { setImagePreview(null); setForm(prev => ({ ...prev, image: '', imageUrl: '' })); }}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
                      >✕ Remove</button>
                    </div>
                  )}
                  {form.imageUrl && !imagePreview && (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Saved: {form.imageUrl}</span>
                  )}
                </div>
              </CCol>
              {/* <CCol md={4} className="mb-3">
                <label className="em-label">Assigned Staff</label>
                <input className="em-input" value={form.assignedStaff} onChange={e => setForm({ ...form, assignedStaff: e.target.value })} placeholder="e.g. Dr. Rajan" />
              </CCol> */}
            </CRow>
          </div>

          {/* Dates & Costs */}
          <div className="em-form-section">
            <h5 className="em-section-title"><FontAwesomeIcon icon={faClipboard} /> Dates & Financial Details</h5>
            <CRow>
              <CCol md={3} className="mb-3">
                <label className="em-label">Purchase Date</label>
                <input type="date" className="em-input" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Warranty Expiry</label>
                <input type="date" className="em-input" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">AMC Start Date</label>
                <input type="date" className="em-input" value={form.amcStartDate} onChange={e => setForm({ ...form, amcStartDate: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">AMC End Date</label>
                <input type="date" className="em-input" value={form.amcEndDate} onChange={e => setForm({ ...form, amcEndDate: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Last Service Date</label>
                <input type="date" className="em-input" value={form.lastServiceDate} onChange={e => setForm({ ...form, lastServiceDate: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Next Service Date</label>
                <input type="date" className="em-input" value={form.nextServiceDate} onChange={e => setForm({ ...form, nextServiceDate: e.target.value })} />
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Purchase Cost (₹)</label>
                <input type="number" className={`em-input ${errors.purchaseCost ? 'em-input-err' : ''}`} value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: e.target.value })} placeholder="0" />
                {errors.purchaseCost && <span className="em-err">{errors.purchaseCost}</span>}
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Current Value (₹)</label>
                <input type="number" className="em-input" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} placeholder="0" />
              </CCol>
            </CRow>
          </div>

          {/* Vendor & Notes */}
          <div className="em-form-section">
            <h5 className="em-section-title"><FontAwesomeIcon icon={faBuilding} /> Vendor & Notes</h5>
            <CRow>
              <CCol md={4} className="mb-3">
                <label className="em-label">Vendor Name</label>
                <input className="em-input" value={form.vendorDetails?.vendorName || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, vendorName: e.target.value } })} placeholder="e.g. MediEquip Pvt Ltd" />
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Contact Person</label>
                <input className="em-input" value={form.vendorDetails?.contactPerson || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, contactPerson: e.target.value } })} placeholder="e.g. Ravi Kumar" />
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Phone Number</label>
                <input className="em-input" value={form.vendorDetails?.phone || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, phone: e.target.value } })} placeholder="+91-..." />
              </CCol>
              <CCol md={6} className="mb-3">
                <label className="em-label">Email</label>
                <input className="em-input" type="email" value={form.vendorDetails?.email || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, email: e.target.value } })} placeholder="support@..." />
              </CCol>
              <CCol md={6} className="mb-3">
                <label className="em-label">Address</label>
                <input className="em-input" value={form.vendorDetails?.address || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, address: e.target.value } })} placeholder="Vendor Address" />
              </CCol>
              <CCol md={12} className="mb-3">
                <label className="em-label">Support Contract Details</label>
                <input className="em-input" value={form.vendorDetails?.supportContractDetails || ''} onChange={e => setForm({ ...form, vendorDetails: { ...form.vendorDetails, supportContractDetails: e.target.value } })} placeholder="e.g. 24/7 Priority Support" />
              </CCol>
              <CCol md={12} className="mb-3">
                <label className="em-label">Notes</label>
                <textarea className="em-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
              </CCol>
            </CRow>
          </div>

          {/* Bottom Actions */}
          <div className="em-form-footer">
            <button type="button" className="em-btn em-btn-ghost" onClick={() => { setIsFormVisible(false); setForm(EMPTY_FORM); setErrors({}); setImagePreview(null); }}>
              Cancel
            </button>
            <button type="submit" className="em-btn em-btn-primary" disabled={loading || imageUploading}>
              {loading ? (
                <><CSpinner size="sm" /> Saving...</>
              ) : imageUploading ? (
                <><CSpinner size="sm" /> Uploading image...</>
              ) : (
                <><FontAwesomeIcon icon={faCheckCircle} /> {isEditing ? 'Update Equipment' : 'Save Equipment'}</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── View Modal ── */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg" backdrop="static" className='custom-modal'>
        <CModalHeader><CModalTitle>Equipment Details — {selectedEquip?.equipmentId}</CModalTitle></CModalHeader>
        <CModalBody>
          {selectedEquip && (
            <div className="em-view-grid">
              <div className="em-view-section">
                <h6 className="em-view-sec-title">Basic Information</h6>
                <F label="Name" val={selectedEquip.name} />
                <F label="Category" val={selectedEquip.category} />
                <F label="Type" val={selectedEquip.type} />
                <F label="Brand" val={selectedEquip.brand} />
                <F label="Model" val={selectedEquip.model} />
                <F label="Serial No." val={selectedEquip.serialNo} />
                <F label="Department" val={selectedEquip.department} />
                <F label="Assigned Staff" val={selectedEquip.assignedStaff} />
                <div className="em-detail-row">
                  <span className="em-detail-label">Status</span>
                  <span className={`em-badge ${getStatusClass(selectedEquip.status)}`}>{selectedEquip.status}</span>
                </div>
              </div>
              <div className="em-view-section">
                <h6 className="em-view-sec-title">Dates & Financials</h6>
                <F label="Purchase Date" val={selectedEquip.purchaseDate} />
                <F label="Warranty Expiry" val={selectedEquip.warrantyExpiry} />
                <F label="AMC Start" val={selectedEquip.amcStartDate} />
                <F label="AMC End" val={selectedEquip.amcEndDate} />
                <F label="Last Service" val={selectedEquip.lastServiceDate} />
                <F label="Next Service" val={selectedEquip.nextServiceDate} />
                <F label="Purchase Cost" val={selectedEquip.purchaseCost ? `₹${Number(selectedEquip.purchaseCost).toLocaleString()}` : null} />
                <F label="Current Value" val={selectedEquip.currentValue ? `₹${Number(selectedEquip.currentValue).toLocaleString()}` : null} />
              </div>
              <div className="em-view-section full-width">
                <h6 className="em-view-sec-title">Vendor Details & Notes</h6>
                <F label="Vendor Name" val={selectedEquip.vendorDetails?.vendorName} />
                <F label="Contact Person" val={selectedEquip.vendorDetails?.contactPerson} />
                <F label="Phone" val={selectedEquip.vendorDetails?.phone} />
                <F label="Email" val={selectedEquip.vendorDetails?.email} />
                <F label="Address" val={selectedEquip.vendorDetails?.address} />
                <F label="Support Contract" val={selectedEquip.vendorDetails?.supportContractDetails} />
                <F label="Notes" val={selectedEquip.notes} />
              </div>
              {selectedEquip.imageUrl && (
                <div className="em-view-section full-width">
                  <h6 className="em-view-sec-title">Equipment Image</h6>
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={selectedEquip.imageUrl.startsWith('http') ? selectedEquip.imageUrl : `${wifiUrl}/${selectedEquip.imageUrl}`}
                      alt="Equipment"
                      style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '10px', border: '1px solid #e2e8f0', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModal(false)}>Close</CButton>
          <CButton color="primary" onClick={() => { setViewModal(false); openEdit(selectedEquip); }}>
            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Image Lightbox Modal ── */}
      {imageModal && (
        <CModal
          visible={imageModal}
          onClose={() => setImageModal(false)}
          size="lg"
          alignment="center"
          backdrop="static"
        >
          <CModalHeader style={{ padding: '18px 22px' }}>
            <CModalTitle
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#e7f1ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CIcon icon={cilImage} style={{ color: '#0d6efd' }} />
              </div>
              {selectedImageData.name}
            </CModalTitle>
          </CModalHeader>

          <CModalBody
            style={{
              padding: '24px',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={selectedImageData.url}
              alt={selectedImageData.name}
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                borderRadius: '12px',
                objectFit: 'contain',
                border: '1px solid #e2e8f0',
                background: '#fff',
              }}
              onError={(e) => {
                e.target.src = '';
                e.target.alt = 'Image not available';
              }}
            />
          </CModalBody>

          <CModalFooter style={{ padding: '14px 22px', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Click outside or press <kbd>Esc</kbd> to close
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CButton
                color="light"
                shape="rounded-pill"
                href={selectedImageData.url}
                download={selectedImageData.name}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CIcon icon={cilCloudDownload} /> Download
              </CButton>
              <CButton
                color="secondary"
                shape="rounded-pill"
                onClick={() => setImageModal(false)}
              >
                Close
              </CButton>
            </div>
          </CModalFooter>
        </CModal>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        message="Are you sure you want to delete this equipment record?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default EquipmentManagement;
