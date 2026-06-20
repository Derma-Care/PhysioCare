import React, { useState, useEffect, useMemo } from 'react';
import {
  CRow, CCol, CModal, CModalHeader, CModalTitle,
  CModalBody, CButton, CSpinner, CModalFooter
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
import { wifiUrl } from '../../baseUrl';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilImage } from '@coreui/icons';


// ─── Dropdown Constants ─────────────────────────────────────────────────────
const EQUIPMENT_CATEGORIES = ['Physiotherapy', 'Diagnostic', 'Rehabilitation', 'Surgical', 'Monitoring', 'Other'];
const EQUIPMENT_TYPES = ['Machine', 'Device', 'Instrument', 'Furniture', 'Software', 'Other'];
const DEPARTMENTS = ['Physiotherapy', 'Orthopedics', 'Neurology', 'Cardiology', 'General', 'ICU'];
const STATUS_OPTIONS = ['Active', 'Under Maintenance', 'Out of Service', 'Scrapped', 'In Warranty', 'AMC Active'];

// ─── Mock Dummy Data ─────────────────────────────────────────────────────────
const MOCK_EQUIPMENT = [
  {
    id: 'EQ-0001', name: 'Ultrasound Machine', category: 'Diagnostic', type: 'Machine',
    brand: 'Siemens', model: 'ACUSON X300', serialNo: 'SN-20240101', status: 'Active',
    department: 'Physiotherapy', purchaseDate: '2024-01-15', warrantyExpiry: '2026-01-15',
    amcStartDate: '2024-01-15', amcEndDate: '2025-01-15',
    purchaseCost: 450000, currentValue: 380000,
    lastServiceDate: '2025-01-10',
    vendorDetails: {
      vendorName: 'MediEquip Pvt Ltd',
      contactPerson: 'Ravi Kumar',
      phone: '+91-9876543210',
      email: 'support@mediequip.com',
      address: '123 Health Street, NY',
      supportContractDetails: '24/7 Priority Support'
    },
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop',
    assignedStaff: 'Dr. Rajan',
    notes: 'Handle with care. Calibration every 6 months.'
  },
  {
    id: 'EQ-0002', name: 'TENS Unit', category: 'Physiotherapy', type: 'Device',
    brand: 'Enraf Nonius', model: 'Sonopuls 492', serialNo: 'SN-20240202', status: 'In Warranty',
    department: 'Physiotherapy', purchaseDate: '2024-06-10', warrantyExpiry: '2026-06-10',
    amcStartDate: '2025-06-10', amcEndDate: '2026-06-10',
    purchaseCost: 85000, currentValue: 75000,
    nextServiceDate: '2025-07-10', lastServiceDate: '2025-01-05',
    vendorDetails: {
      vendorName: 'PhysioSupplies Co.',
      contactPerson: 'Anjali Desai',
      phone: '+91-9988776655',
      email: 'sales@physiosupplies.in',
      address: '45 Wellness Blvd, Mumbai',
      supportContractDetails: 'Standard 1 year replacement'
    },
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
    assignedStaff: 'Meera Das',
    notes: 'Check electrodes monthly.'
  },
  {
    id: 'EQ-0003', name: 'Treadmill (Motorized)', category: 'Rehabilitation', type: 'Machine',
    brand: 'Cosco', model: 'CT-500', serialNo: 'SN-20230811', status: 'Under Maintenance',
    department: 'Physiotherapy', purchaseDate: '2023-08-11', warrantyExpiry: '2025-08-11',
    amcStartDate: '2023-08-11', amcEndDate: '2024-08-11',
    purchaseCost: 120000, currentValue: 80000,
    nextServiceDate: '2025-05-20', lastServiceDate: '2024-11-20',
    vendorDetails: {
      vendorName: 'FitTech Solutions',
      contactPerson: 'Vikram Singh',
      phone: '+91-8877665544',
      email: 'service@fittech.com',
      address: 'Industrial Area Phase II, Delhi',
      supportContractDetails: 'On-call maintenance'
    },
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=200&h=200&fit=crop',
    assignedStaff: 'Suresh Babu',
    notes: 'Belt replacement due soon.'
  }
];

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
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list | add
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // local object URL for preview
  const [imageModal, setImageModal] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState({ url: '', name: '' });

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

  // ─── Notifications (AMC/Warranty soon) ────────────────────────────────────
  const notifications = useMemo(() => {
    const today = new Date();
    const alerts = [];
    equipment.forEach(e => {
      const warranty = e.warrantyExpiry ? new Date(e.warrantyExpiry) : null;
      const amc = e.amcEndDate ? new Date(e.amcEndDate) : null;
      const service = e.nextServiceDate ? new Date(e.nextServiceDate) : null;
      if (warranty) {
        const days = Math.ceil((warranty - today) / (1000 * 60 * 60 * 24));
        if (days <= 15 && days >= 0) alerts.push({ equip: e.name, type: 'Warranty', days, id: e.id });
      }
      if (amc) {
        const days = Math.ceil((amc - today) / (1000 * 60 * 60 * 24));
        if (days <= 7 && days >= 0) alerts.push({ equip: e.name, type: 'AMC', days, id: e.id });
      }
      if (service) {
        const days = Math.ceil((service - today) / (1000 * 60 * 60 * 24));
        if (days <= 2 && days >= 0) alerts.push({ equip: e.name, type: 'Service Due', days, id: e.id });
      }
    });
    return alerts;
  }, [equipment]);

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

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      if (isEditing) {
        setEquipment(prev => prev.map(e => e.id === editingId ? { ...form, id: editingId } : e));
        showCustomToast('Equipment updated successfully.', 'success');
      } else {
        const newId = `EQ-${String(equipment.length + 1).padStart(4, '0')}`;
        setEquipment(prev => [{ ...form, id: newId }, ...prev]);
        showCustomToast('Equipment added successfully.', 'success');
      }
      setLoading(false);
      setIsFormVisible(false);
      setForm(EMPTY_FORM);
      setIsEditing(false);
    }, 700);
  };

  const openEdit = (equip) => {
    setForm(equip);
    setIsEditing(true);
    setEditingId(equip.id);
    setIsFormVisible(true);
    // Restore preview when editing: show existing image as preview
    setImagePreview(equip.image || null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this equipment record?')) {
      setEquipment(prev => prev.filter(e => e.id !== id));
      showCustomToast('Equipment deleted.', 'info');
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
      const fileKey = await uploadFile('equipmentImage', file);
      setForm(prev => ({ ...prev, image: fileKey }));
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
      {notifications.length > 0 && (
        <div className="em-alerts">
          <FontAwesomeIcon icon={faBell} className="me-2" />
          {notifications.map((n, i) => (
            <span key={i} className="em-alert-pill">
              {n.equip} — <strong>{n.type}</strong> expiring in {n.days} day{n.days !== 1 ? 's' : ''}
            </span>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <div className="em-header">
        <div>
          <h4 className="em-title">Equipment Management</h4>
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
          <button className="em-btn em-btn-primary" onClick={() => { setForm(EMPTY_FORM); setIsEditing(false); setErrors({}); setIsFormVisible(true); }}>
            <FontAwesomeIcon icon={faPlus} /> Add Equipment
          </button>
        )}
      </div>

      {/* ── Main Content ── */}
      {!isFormVisible ? (
        <>
          {/* Filters */}
          <div className="em-filters">
            <input
              className="em-search" placeholder="Search by name, brand, serial no..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
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
              <table className="em-table">
                <thead>
                  <tr>
                    <th>Equip ID</th>
                    <th>Images</th>
                    <th>Name</th>
                    {/* <th>Category</th> */}
                    <th>Brand / Model</th>
                    <th>Department</th>
                    <th>Next Service</th>
                    <th>Warranty Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(eq => (
                    <tr key={eq.id}>
                      <td><span className="em-id-badge">{eq.id}</span></td>
                      {/* Image cell — click to open lightbox */}
                      <td style={{ textAlign: 'center' }}>
                        {eq.image
                          ? <img
                            src={eq.image.startsWith('http') ? eq.image : `${wifiUrl}/${eq.image}`}
                            alt={eq.name}
                            title="Click to enlarge"
                            onClick={() => { setSelectedImageData({ url: eq.image.startsWith('http') ? eq.image : `${wifiUrl}/${eq.image}`, name: eq.name }); setImageModal(true); }}
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                            onMouseOver={e => e.target.style.transform = 'scale(1.15)'}
                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                          />
                          : <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto' }}>🔧</div>
                        }
                      </td>
                      {/* Name cell */}
                      <td><div className="em-name-cell"><strong>{eq.name}</strong><span>{eq.serialNo}</span></div></td>
                      <td><div className="em-name-cell"><strong>{eq.brand}</strong><span>{eq.model}</span></div></td>
                      <td>{eq.department}</td>
                      <td>{eq.nextServiceDate || '—'}</td>
                      <td>{eq.warrantyExpiry || '—'}</td>
                      <td><span className={`em-badge ${getStatusClass(eq.status)}`}>{eq.status}</span></td>
                      <td>
                        <div className="em-actions">
                          <button className="em-icon-btn view" onClick={() => handleView(eq)} title="View"><Eye /> </button>
                          <button className="em-icon-btn edit" onClick={() => openEdit(eq)} title="Edit"><Edit2 /> </button>
                          <button className="em-icon-btn delete" onClick={() => handleDelete(eq.id)} title="Delete"><Trash2 /> </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <input className={`em-input ${errors.name ? 'em-input-err' : ''}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ultrasound Machine" />
                {errors.name && <span className="em-err">{errors.name}</span>}
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Category <span className="em-req">*</span></label>
                <select className={`em-select ${errors.category ? 'em-input-err' : ''}`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
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
                <label className="em-label">Department</label>
                <select className="em-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Assigned Staff</label>
                <input className="em-input" value={form.assignedStaff} onChange={e => setForm({ ...form, assignedStaff: e.target.value })} placeholder="e.g. Dr. Rajan" />
              </CCol>


              <CCol md={4} className="mb-3">
                <label className="em-label">Status</label>
                <select className="em-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
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
                        onClick={() => { setImagePreview(null); setForm(prev => ({ ...prev, image: '' })); }}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
                      >✕ Remove</button>
                    </div>
                  )}
                  {form.image && !imagePreview && (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Saved: {form.image}</span>
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
            <button type="submit" className="em-btn em-btn-primary" disabled={loading}>
              {loading ? <CSpinner size="sm" /> : <><FontAwesomeIcon icon={faCheckCircle} /> {isEditing ? 'Update Equipment' : 'Save Equipment'}</>}
            </button>
          </div>
        </form>
      )}

      {/* ── View Modal ── */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg" backdrop="static">
        <CModalHeader><CModalTitle>Equipment Details — {selectedEquip?.id}</CModalTitle></CModalHeader>
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
              {selectedEquip.image && (
                <div className="em-view-section full-width">
                  <h6 className="em-view-sec-title">Equipment Image</h6>
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={selectedEquip.image.startsWith('http') ? selectedEquip.image : `${wifiUrl}/${selectedEquip.image}`}
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
    </div>
  );
};

export default EquipmentManagement;
