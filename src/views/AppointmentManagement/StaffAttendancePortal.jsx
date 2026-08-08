import React, { useState, useEffect } from 'react';
import { User, LogIn, LogOut, CheckCircle2, ShieldCheck, ArrowRight, Loader2, FlaskConical } from 'lucide-react';
import { COLORS } from '../../Constant/Themes';
import { BASE_URL } from '../../baseUrl';
import { showCustomToast } from '../../Utils/Toaster';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const StaffAttendancePortal = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const clinicId = queryParams.get('clinicId') || '';
    const branchId = queryParams.get('branchId') || '';

    const [step, setStep] = useState('ENTER_ID');
    const [userId, setUserId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [staffData, setStaffData] = useState(null);
    const [coords, setCoords] = useState({ latitude: '', longitude: '' });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({ 
                        latitude: pos.coords.latitude.toString(), 
                        longitude: pos.coords.longitude.toString() 
                    });
                },
                (err) => console.log("Location access denied or unavailable", err)
            );
        }
    }, []);

    useEffect(() => {
        let timer;
        if (step === 'ACTION' && staffData?.status === 'LOGGED_OUT') {
            timer = setTimeout(() => {
                resetPortal();
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [step, staffData]);

    const fetchStaffStatus = async (e) => {
        e.preventDefault();
        if (!userId.trim()) {
            showCustomToast("Please enter your User ID", "error");
            return;
        }

        setIsProcessing(true);
        const today = new Date().toISOString().split("T")[0];
        
        try {
            let apiUrl = `${BASE_URL}/getUserDailyAttendence/${userId.trim()}/${today}`;
            let res = await axios.get(apiUrl);
            
            if (!res.data.success || !res.data.data) {
                apiUrl = `${BASE_URL}/getDaily/${userId.trim()}/${today}`;
                res = await axios.get(apiUrl);
            }

            if (res.data.success && res.data.data) {
                const data = res.data.data;
                const isLoggedIn = data.status === "LOGGED_IN";
                const isLoggedOut = !!data.logout?.time;
                
                setStaffData({
                    userId: userId.trim(),
                    name: data.name || data.staffName || data.therapistName || `Staff (${userId})`,
                    status: isLoggedOut ? 'LOGGED_OUT' : (isLoggedIn ? 'LOGGED_IN' : 'PENDING')
                });
                setStep('ACTION');
            } else {
                setStaffData({ userId: userId.trim(), name: `Staff (${userId})`, status: 'PENDING' });
                setStep('ACTION');
            }
        } catch (error) {
            console.error("Error fetching status", error);
            setStaffData({ userId: userId.trim(), name: `Staff (${userId})`, status: 'PENDING' });
            setStep('ACTION');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAction = async (actionType) => {
        setIsProcessing(true);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
        const dateStr = new Date().toISOString().split("T")[0];
        
        try {
            if (actionType === 'LOGIN') {
                const payload = {
                    userId: staffData.userId, date: dateStr, clinicId, branchId,
                    login: { time, latitude: coords.latitude || "0", longitude: coords.longitude || "0" }
                };
                const res = await axios.post(`${BASE_URL}/saveUserAttendence`, payload);
                if (res.data.success) {
                    showCustomToast(`Welcome! Checked IN at ${time}`, "success");
                    resetPortal();
                } else showCustomToast(res.data.message || "Login failed", "error");
            } else if (actionType === 'LOGOUT') {
                const payload = {
                    userId: staffData.userId, date: dateStr, logoutTime: time,
                    logoutLatitude: coords.latitude || "0", logoutLongitude: coords.longitude || "0"
                };
                const res = await axios.put(`${BASE_URL}/updateUserAttendence`, payload);
                if (res.data.success) {
                    showCustomToast(`Goodbye! Checked OUT at ${time}`, "success");
                    resetPortal();
                } else showCustomToast(res.data.message || "Logout failed", "error");
            } else if (actionType === 'TEST_MOCK') {
                showCustomToast(`Action successful!`, "success");
                resetPortal();
            }
        } catch (error) {
            console.error(`${actionType} Error`, error);
            showCustomToast(`${actionType} Failed`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetPortal = () => {
        setStep('ENTER_ID'); setUserId(''); setStaffData(null);
    };

    const simulateStatus = (statusType) => {
        if (!userId.trim()) { showCustomToast("Please enter a User ID to test", "error"); return; }
        setStaffData({ userId: userId.trim(), name: `Test User (${userId})`, status: statusType });
        setStep('ACTION');
    };

    const currentDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 400, borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ background: COLORS.primary, padding: '24px 20px', color: '#fff', textAlign: 'center' }}>
                    <ShieldCheck size={36} color="#fff" style={{ marginBottom: 10 }} />
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Staff Attendance</h2>
                    <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 13 }}>{currentDate}</p>
                </div>

                <div style={{ padding: 30 }}>
                    {step === 'ENTER_ID' && (
                        <div>
                            <form onSubmit={fetchStaffStatus}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>ENTER YOUR USER ID</label>
                                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. EMP001" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 16, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }} />
                                <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: 14, borderRadius: 10, background: COLORS.primary, color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <>Next <ArrowRight size={18} /></>}
                                </button>
                            </form>

                        </div>
                    )}
                    {step === 'ACTION' && staffData && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', color: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><User size={36} /></div>
                            <h3 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: 20 }}>{staffData.name}</h3>
                            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>ID: {staffData.userId}</p>

                            {staffData.status === 'PENDING' && (
                                <button onClick={() => staffData.name.includes('Test User') ? handleAction('TEST_MOCK') : handleAction('LOGIN')} disabled={isProcessing} style={{ width: '100%', padding: 16, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={20} /> Check IN</>}
                                </button>
                            )}

                            {staffData.status === 'LOGGED_IN' && (
                                <button onClick={() => staffData.name.includes('Test User') ? handleAction('TEST_MOCK') : handleAction('LOGOUT')} disabled={isProcessing} style={{ width: '100%', padding: 16, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <><LogOut size={20} /> Check OUT</>}
                                </button>
                            )}

                            {staffData.status === 'LOGGED_OUT' && (
                                <div style={{ background: '#f0fdf4', color: '#166534', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                    <CheckCircle2 size={32} color="#22c55e" />
                                    <span style={{ fontWeight: 600, fontSize: 15 }}>Your attendance is already submitted for today.</span>
                                </div>
                            )}

                            <button onClick={resetPortal} disabled={isProcessing} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginTop: 20, fontSize: 14 }}>← Not you? Go back</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default StaffAttendancePortal;
