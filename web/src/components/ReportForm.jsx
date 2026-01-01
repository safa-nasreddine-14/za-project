import React, { useState } from 'react';
import { ArrowRight, Camera, MapPin, Send } from 'lucide-react';

const ReportForm = ({ type, onBack, userLocation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        location: userLocation || null
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const fileInputRef = React.useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('location', formData.location || 'غير محدد');

            // Append files
            Array.from(mediaFiles).forEach(file => {
                data.append('media', file);
            });

            const res = await fetch('/api/reports', {
                method: 'POST',
                body: data // fetch automatically sets Content-Type to multipart/form-data
            });

            if (res.ok) {
                alert('تم إرسال البلاغ بنجاح');
                onBack();
            } else {
                throw new Error('Server error');
            }
        } catch (err) {
            alert(`خطأ: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLocation = () => {
        if (!navigator.geolocation) {
            alert('متصفحك لا يدعم تحديد الموقع!');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
                setFormData(prev => ({ ...prev, location: loc }));
                alert('تم تحديد موقعك بنجاح! 📍');
            },
            (error) => {
                console.error(error);
                alert('فشل تحديد الموقع. تأكد من تفعيل GPS.');
            }
        );
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'var(--primary-blue)',
                color: 'white'
            }}>
                <button onClick={onBack} style={{ color: 'white', background: 'transparent' }}>
                    <ArrowRight size={24} />
                </button>
                <h2>تبليغ عن حدث</h2>
            </div>

            <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files?.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        setMediaFiles(prev => [...prev, ...newFiles]);
                    }
                }}
            />

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>



                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold' }}>نوع الحدث</label>
                    <select
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                        required
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="">ختر نوع الحدث...</option>
                        <option value="سرقة">سرقة</option>
                        <option value="حادث مرور">حادث مرور</option>
                        <option value="شجار">شجار</option>
                        <option value="حريق">حريق</option>
                        <option value="آخر">آخر</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold' }}>وصف المشكلة</label>
                    <textarea
                        rows={4}
                        placeholder="اكتب تفاصيل ما حدث..."
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'none' }}
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={handleLocation} style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px dashed #aaa',
                        background: formData.location ? '#e8f5e9' : '#f9f9f9', // Greenish if set
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: formData.location ? '#2e7d32' : '#555'
                    }}>
                        <MapPin size={20} />
                        {formData.location ? 'تم التحديد' : 'تحديد الموقع'}
                    </button>

                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px dashed #aaa',
                        background: mediaFiles.length > 0 ? '#e3f2fd' : '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: mediaFiles.length > 0 ? '#1565c0' : '#555'
                    }}>
                        <Camera size={20} />
                        {mediaFiles.length > 0 ? `${mediaFiles.length} ملفات` : 'صورة/فيديو'}
                    </button>
                </div>

                {/* Selected Files List */}
                {mediaFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {mediaFiles.map((file, idx) => (
                            <div key={idx} className="relative flex-shrink-0 w-32 h-32 border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-center p-1">
                                        🎬 فيديو
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-bl-lg text-sm font-bold shadow-md hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: 'auto',
                        padding: '1rem',
                        backgroundColor: 'var(--primary-blue)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'جاري الإرسال...' : (
                        <>
                            <span>إرسال البلاغ</span>
                            <Send size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReportForm;
