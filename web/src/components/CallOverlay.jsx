import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, User } from 'lucide-react';
import io from 'socket.io-client';

const socket = io();

const CallOverlay = ({ onEndCall }) => {
    const [status, setStatus] = useState('calling'); // calling, connected, ended
    const [timer, setTimer] = useState(0);
    const peerRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const remoteAudioRef = React.useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const startCall = async () => {
            try {
                // 1. Get Microphone with noise suppression
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                streamRef.current = stream;

                // 2. Setup Peer
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerRef.current = pc;

                // 3. Add tracks
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                // Handle Remote Track
                pc.ontrack = (event) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };

                // 4. Handle ICE

                pc.onicecandidate = (event) => {
                    if (event.candidate && isMounted) {
                        socket.emit('ice_candidate', { candidate: event.candidate });
                    }
                };

                // 5. Create Offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // 6. Send Signal
                socket.emit('call_initiate', {
                    callerId: 'Mobile-User-' + Math.floor(Math.random() * 1000),
                    offer: offer
                });

                // 7. Listen for Answer
                socket.on('call_answered', async (data) => {
                    if (data.answer && peerRef.current && isMounted) {
                        try {
                            await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                            setStatus('connected');
                        } catch (e) {
                            console.error("Failed to set remote description", e);
                        }
                    }
                });

                socket.on('ice_candidate', async (data) => {
                    if (data.candidate && peerRef.current && isMounted) {
                        try {
                            await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error("Failed to add ice candidate", e);
                        }
                    }
                });

                socket.on('call_ended', () => {
                    if (isMounted) handleEndCleanup();
                });

            } catch (err) {
                console.error("Call failed:", err);
                if (isMounted) {
                    setError("فشل الوصول إلى الميكروفون. يرجى التأكد من الأذونات.");
                    setTimeout(onEndCall, 3000);
                }
            }
        };

        startCall();

        return () => {
            isMounted = false;
            socket.off('call_answered');
            socket.off('ice_candidate');
            socket.off('call_ended');

            // Critical cleanup on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (peerRef.current) {
                peerRef.current.close();
            }
        };
    }, []);

    const handleEndCleanup = () => {
        setStatus('ended');
        // We don't call onEndCall immediately here to let the user see "ended"
        setTimeout(() => {
            onEndCall();
        }, 1500);
    };

    useEffect(() => {
        let interval;
        if (status === 'connected') {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManualEnd = () => {
        socket.emit('call_reject');
        handleEndCleanup();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col items-center justify-between p-8">
            <div className="mt-12 flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                    <User size={64} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold">مركز القيادة</h2>
                <div className="text-center">
                    {error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                        <p className="text-gray-400">
                            {status === 'calling' && 'جارٍ الاتصال...'}
                            {status === 'connected' && formatTime(timer)}
                            {status === 'ended' && 'تم إنهاء المكالمة'}
                        </p>
                    )}
                </div>
            </div>

            {status === 'connected' && (
                <div className="flex gap-1 h-12 items-center">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 bg-green-500 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            )}

            <div className="mb-12 flex gap-8">
                <button className={`p-4 rounded-full ${status === 'connected' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    <Mic size={24} />
                </button>
                <button
                    onClick={handleManualEnd}
                    className="p-4 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-700 transform hover:scale-110 transition-all"
                >
                    <PhoneOff size={32} />
                </button>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
};


export default CallOverlay;
