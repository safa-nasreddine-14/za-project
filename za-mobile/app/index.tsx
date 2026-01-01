import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ActionGrid from '../components/ActionGrid';
import QuickCallFooter from '../components/QuickCallFooter';
import ReportForm from '../components/ReportForm';
import VoiceRecorder from '../components/VoiceRecorder';
import CallScreen from '../components/CallScreen';

// Polyfills/Imports for WebRTC
let RTCPeerConnection: any;
let mediaDevices: any;
let RTCSessionDescription: any;
let RTCIceCandidate: any;

if (Platform.OS === 'web') {
  RTCPeerConnection = (window as any).RTCPeerConnection || (window as any).webkitRTCPeerConnection;
  mediaDevices = navigator.mediaDevices;
  RTCSessionDescription = (window as any).RTCSessionDescription;
  RTCIceCandidate = (window as any).RTCIceCandidate;
} else {
  // These will be available if react-native-webrtc is installed
  try {
    const WebRTC = require('react-native-webrtc');
    RTCPeerConnection = WebRTC.RTCPeerConnection;
    mediaDevices = WebRTC.mediaDevices;
    RTCSessionDescription = WebRTC.RTCSessionDescription;
    RTCIceCandidate = WebRTC.RTCIceCandidate;
  } catch (e) {
    console.warn('react-native-webrtc not found on native');
  }
}

import { BASE_URL as SERVER_URL } from '../constants/Config';

export default function Index() {
  const [view, setView] = useState('home'); // home, report, voice, call
  const [reportType, setReportType] = useState<string | null>(null);
  const [callName, setCallName] = useState('مركز العمليات');
  const [isCallAnswered, setIsCallAnswered] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const peerRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const remoteStreamRef = useRef<any>(null);
  const myCallerId = useRef<string>('User-' + Math.floor(Math.random() * 1000));

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    // Auto-fetch location on mount
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
      }

      // Initialize Audio mode for transitions
      try {
        const { Audio } = require('expo-av');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
      } catch (e) { }
    })();

    socketRef.current.on('call_answered', async (data: any) => {
      console.log('Call answered by admin');
      setIsCallAnswered(true);
      if (data.answer && peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (e) {
          console.error("Failed to set remote description on mobile", e);
        }
      }
    });

    socketRef.current.on('ice_candidate', async (data: any) => {
      if (data.candidate && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Failed to add ice candidate on mobile", e);
        }
      }
    });

    socketRef.current.on('call_ended', () => {
      handleCleanupCall();
      Alert.alert('انتهت المكالمة', 'تم إنهاء المكالمة من قبل الطرف الثاني.');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleOpenReport = (type: string) => {
    if (type === 'voice') {
      setView('voice');
    } else {
      setReportType(type);
      setView('report');
    }
  };

  const handleBack = () => {
    setView('home');
    setReportType(null);
  };

  const handleCleanupCall = () => {

    setView('home');
    setIsCallAnswered(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  };

  const handleCall = async (number: string) => {
    setCallName(number === 'SOS' ? 'إنذار فوري' : ('رقم طوارئ: ' + number));
    setIsCallAnswered(false);
    setView('call');

    try {
      // 1. Check for Secure Context (Important for WebRTC on Web)
      if (Platform.OS === 'web' && !window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('SECURE_CONTEXT_REQUIRED');
      }

      // 2. Check for Support
      if (!mediaDevices || !RTCPeerConnection) {
        throw new Error('WEBRTC_UNSUPPORTED');
      }

      // 3. Get Mic
      const stream = await mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 4. Setup Peer
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerRef.current = pc;

      // 5. Add tracks
      if (Platform.OS === 'web') {
        stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));
      } else {
        // Native usage
        stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));
      }

      // Handle Remote Track (Missing in previous version)
      pc.ontrack = (event: any) => {
        console.log('Received remote track on mobile');
        // On native, we don't necessarily need to attach to an audio element for just audio 
        // if the native module handles it, but for web or clarity:
        if (event.streams && event.streams[0]) {
          // Native module usually handles the audio output automatically if it's an audio-only pc
          console.log('Remote stream attached');
        }
      };

      // 6. Handle ICE
      pc.onicecandidate = (event: any) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice_candidate', { candidate: event.candidate });
        }
      };

      // 7. Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 8. Send Signal
      if (socketRef.current) {
        socketRef.current.emit('call_initiate', {
          callerId: myCallerId.current,
          type: number === 'SOS' ? 'SOS' : 'voice',
          offer: offer,
          location: location || 'غير محدد'
        });
      }
    } catch (err: any) {
      console.warn("WebRTC initialization failed:", err.message);

      let errorMsg = 'تعذر بدء الاتصال الصوتي. ';

      if (err.message === 'SECURE_CONTEXT_REQUIRED') {
        errorMsg += 'يجب استخدام رابط آمن (HTTPS) أو الاتصال بـ localhost لتفعيل الميكروفون.';
      } else if (err.message === 'WEBRTC_UNSUPPORTED') {
        errorMsg += 'هذا المتصفح أو الجهاز لا يدعم تقنية الاتصال المباشر. ' + (Platform.OS !== 'web' ? 'الميزة تتطلب نسخة التطبيق الأصلية (Development Build).' : 'يرجى استخدام متصفح حديث.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg += 'يرجى منح صلاحية الميكروفون من إعدادات المتصفح أو الجهاز.';
      } else {
        errorMsg += 'يرجى التأكد من تفعيل الميكروفون وتوفر الاتصال.';
      }

      Alert.alert('تنبيه', errorMsg);

      // Fallback: Just signaling (UI only)
      if (socketRef.current) {
        socketRef.current.emit('call_initiate', {
          callerId: myCallerId.current,
          type: number === 'SOS' ? 'SOS' : 'voice',
          location: location || 'غير محدد'
        });
      }
    }
  };


  const handleEndCall = () => {
    handleCleanupCall();
    if (socketRef.current) {
      socketRef.current.emit('call_reject', { callerId: myCallerId.current });
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {view === 'home' && (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Header />
            <Hero />
            <ActionGrid
              onOpenReport={handleOpenReport}
              onEmergencyCall={() => handleCall('SOS')}
              location={location}
            />
            <QuickCallFooter />
          </ScrollView>
        </>
      )}

      {view === 'report' && reportType && (
        <ReportForm type={reportType} onBack={handleBack} />
      )}

      {view === 'voice' && (
        <VoiceRecorder onBack={handleBack} location={location} />
      )}

      {view === 'call' && (
        <CallScreen onEndCall={handleEndCall} name={callName} isAnswered={isCallAnswered} />
      )}

    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 60,
  }
});
