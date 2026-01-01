import React from 'react';
import { Mic, TriangleAlert, BellRing } from 'lucide-react';

const ActionButton = ({ icon: Icon, title, onClick, color = 'var(--primary-blue)', bgColor = 'white' }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: bgColor,
            color: color,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            width: '100%',
            gap: '10px',
            transition: 'transform 0.1s'
        }}
    >
        <div style={{
            padding: '12px',
            borderRadius: '50%',
            backgroundColor: color === 'white' ? 'rgba(255,255,255,0.2)' : `${color}15`
        }}>
            <Icon size={32} color={color} />
        </div>
        <span style={{ fontSize: '1rem', fontWeight: '600' }}>{title}</span>
    </button>
);

const ActionGrid = ({ onOpenReport, userLocation }) => {

    const handleAlarm = async () => {
        if (!confirm('هل أنت متأكد من إرسال إنذار استغاثة؟')) return;

        let location = userLocation || 'غير محدد';

        // Attempt to get location if not already available
        if (!userLocation) {
            try {
                if (navigator.geolocation) {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    location = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                }
            } catch (e) {
                console.error("Location error:", e);
            }
        }

        try {
            const res = await fetch('/api/alarms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: 'Mobile-User-' + Math.floor(Math.random() * 1000),
                    location: location
                })
            });
            if (res.ok) {
                alert('تم إرسال الإنذار والغوث قادم!');
            }
        } catch (err) {
            console.error(err);
            alert(`فشل الاتصال: ${err.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ActionButton
                    icon={Mic}
                    title="رسالة صوتية"
                    onClick={() => onOpenReport('voice')}
                />
                <ActionButton
                    icon={TriangleAlert}
                    title="تبليغ عن حدث"
                    onClick={() => onOpenReport('event')}
                />
            </div>

            <ActionButton
                icon={BellRing}
                title="إنذار فوري"
                onClick={handleAlarm}
                color="white"
                bgColor="var(--alarm-red)"
            />
        </div>
    );
};

export default ActionGrid;
