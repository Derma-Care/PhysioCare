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
    nextServiceDate: '2025-06-15', lastServiceDate: '2025-01-10',
    vendor: 'MediEquip Pvt Ltd', assignedStaff: 'Dr. Rajan',
    notes: 'Handle with care. Calibration every 6 months.'
  },
  {
    id: 'EQ-0002', name: 'TENS Unit', category: 'Physiotherapy', type: 'Device',
    brand: 'Enraf Nonius', model: 'Sonopuls 492', serialNo: 'SN-20240202', status: 'In Warranty',
    department: 'Physiotherapy', purchaseDate: '2024-06-10', warrantyExpiry: '2026-06-10',
    amcStartDate: '2025-06-10', amcEndDate: '2026-06-10',
    purchaseCost: 85000, currentValue: 75000,
    nextServiceDate: '2025-07-10', lastServiceDate: '2025-01-05',
    vendor: 'PhysioSupplies Co.', assignedStaff: 'Meera Das',
    notes: 'Check electrodes monthly.'
  },
  {
    id: 'EQ-0003', name: 'Treadmill (Motorized)', category: 'Rehabilitation', type: 'Machine',
    brand: 'Cosco', model: 'CT-500', serialNo: 'SN-20230811', status: 'Under Maintenance',
    department: 'Physiotherapy', purchaseDate: '2023-08-11', warrantyExpiry: '2025-08-11',
    amcStartDate: '2023-08-11', amcEndDate: '2024-08-11',
    purchaseCost: 120000, currentValue: 80000,
    nextServiceDate: '2025-05-20', lastServiceDate: '2024-11-20',
    vendor: 'FitTech Solutions', assignedStaff: 'Suresh Babu',
    notes: 'Belt replacement due soon.'
  }
];

const EMPTY_FORM = {
  name: '', category: '', type: '', brand: '', model: '',
  serialNo: '', status: 'Active', department: '', purchaseDate: '',
  warrantyExpiry: '', amcStartDate: '', amcEndDate: '',
  purchaseCost: '', currentValue: '', nextServiceDate: '',
  lastServiceDate: '', vendor: '', assignedStaff: '', notes: ''
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
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this equipment record?')) {
      setEquipment(prev => prev.filter(e => e.id !== id));
      showCustomToast('Equipment deleted.', 'info');
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
                    <th>Name</th>
                    <th>Category</th>
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
                      <td><div className="em-name-cell"><strong>{eq.name}</strong><span>{eq.serialNo}</span></div></td>
                      <td>{eq.category}</td>
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
              <CCol md={6} className="mb-3">
                <label className="em-label">Equipment Name <span className="em-req">*</span></label>
                <input className={`em-input ${errors.name ? 'em-input-err' : ''}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ultrasound Machine" />
                {errors.name && <span className="em-err">{errors.name}</span>}
              </CCol>
              <CCol md={3} className="mb-3">
                <label className="em-label">Category <span className="em-req">*</span></label>
                <select className={`em-select ${errors.category ? 'em-input-err' : ''}`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select Category</option>
                  {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <span className="em-err">{errors.category}</span>}
              </CCol>
              <CCol md={3} className="mb-3">
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
                <select className={`em-select ${errors.department ? 'em-input-err' : ''}`} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {errors.department && <span className="em-err">{errors.department}</span>}
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Status</label>
                <select className="em-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </CCol>
              <CCol md={4} className="mb-3">
                <label className="em-label">Assigned Staff</label>
                <input className="em-input" value={form.assignedStaff} onChange={e => setForm({ ...form, assignedStaff: e.target.value })} placeholder="e.g. Dr. Rajan" />
              </CCol>
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
              <CCol md={6} className="mb-3">
                <label className="em-label">Vendor Name</label>
                <input className="em-input" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. MediEquip Pvt Ltd" />
              </CCol>
              <CCol md={6} className="mb-3">
                <label className="em-label">Notes</label>
                <textarea className="em-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
              </CCol>
            </CRow>
          </div>

          {/* Bottom Actions */}
          <div className="em-form-footer">
            <button type="button" className="em-btn em-btn-ghost" onClick={() => { setIsFormVisible(false); setForm(EMPTY_FORM); setErrors({}); }}>
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
                <h6 className="em-view-sec-title">Vendor & Notes</h6>
                <F label="Vendor" val={selectedEquip.vendor} />
                <F label="Notes" val={selectedEquip.notes} />
              </div>
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
    </div>
  );
};

export default EquipmentManagement;
