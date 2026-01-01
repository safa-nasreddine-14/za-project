import React, { useState, useRef } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';

const VoiceRecorder = ({ onBack, userLocation }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [uploading, setUploading] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            alert('فشل الوصول للميكروفون: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const sendAudio = async () => {
        if (!audioBlob) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-msg.wav');
        formData.append('location', userLocation || 'غير محدد');
        formData.append('deviceId', 'Mobile-User-' + Math.floor(Math.random() * 1000));

        try {
            const res = await fetch('/api/voice', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('تم إرسال الرسالة الصوتية بنجاح 🎙️');
                onBack(); // Go back to home
            } else {
                const errorText = await res.text();
                throw new Error(errorText || 'Server upload failed');
            }
        } catch (err) {
            alert('فشل الإرسال: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-8 text-blue-900">تسجيل رسالة صوتية</h2>

            {!audioBlob ? (
                <div
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${recording ? 'bg-red-100 animate-pulse' : 'bg-blue-100 hover:bg-blue-200'}`}
                >
                    {recording ? <Square size={48} className="text-red-600" /> : <Mic size={48} className="text-blue-600" />}
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setAudioBlob(null)}
                            className="flex-1 py-3 border border-red-200 text-red-600 rounded-lg"
                        >
                            إعادة التسجيل
                        </button>
                        <button
                            onClick={sendAudio}
                            disabled={uploading}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                        >
                            {uploading ? 'جاري الإرسال...' : <>إرسال <Send size={18} /></>}
                        </button>
                    </div>
                </div>
            )}

            <p className="mt-8 text-gray-500">
                {recording ? 'جاري التسجيل... اضغط للإيقاف' : (!audioBlob ? 'اضغط على الميكروفون للبدء' : '')}
            </p>

            <button onClick={onBack} className="absolute top-4 right-4 text-gray-400">
                <X size={32} />
            </button>
        </div>
    );
};

export default VoiceRecorder;
