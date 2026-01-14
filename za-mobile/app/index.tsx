import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { Audio } from 'expo-av'; // Added Audio import
import Header from '../components/Header';
import Hero from '../components/Hero';
import ActionGrid from '../components/ActionGrid';
import QuickCallFooter from '../components/QuickCallFooter';
import ReportForm from '../components/ReportForm';
import VoiceRecorder from '../components/VoiceRecorder';
import CallScreen from '../components/CallScreen';

// WebRTC Service Wrapper
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from '../utils/WebRTCService';
import axios from 'axios';

import { BASE_URL as SERVER_URL } from '../constants/Config';

export default function Index() {
  const [view, setView] = useState('home'); // home, report, voice, call
  const [reportType, setReportType] = useState<string | null>(null);
  const [callName, setCallName] = useState('مركز العمليات');
  const [isCallAnswered, setIsCallAnswered] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const myCallerId = useRef<string>('User-' + Math.floor(Math.random() * 1000));
  const dashboardSocketIdRef = useRef<string | null>(null);
  const ringtoneRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(SERVER_URL);

    // Auto-fetch location on mount
    (async () => {
      console.log('Mobile App: Starting initialization...');
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
        }
      } catch (e) {
        console.log('Location fetch failed', e);
      }

      // Initialize Audio mode
      try {
        // const { Audio } = require('expo-av'); // This line is now redundant as Audio is imported at the top
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });
        console.log('Mobile App: Audio mode initialized');
      } catch (e) {
        console.log('Audio mode setup failed', e);
      }
    })();

    const socket = socketRef.current;
    if (socket) {
      socket.on('call_answered', async (data: any) => {
        console.log('Call signaling: answered');
        stopRingtone(); // Stop ringback tone
        if (data.answer && pcRef.current) {
          try {
            dashboardSocketIdRef.current = data.dashboardSocketId;
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            setIsCallAnswered(true);
          } catch (e) {
            console.error('Error setting remote description:', e);
          }
        } else {
          setIsCallAnswered(true);
        }
      });

      socket.on('ice_candidate', async (data: any) => {
        if (data.candidate && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error('Error adding ice candidate:', e);
          }
        }
      });

      socket.on('call_ended', () => {
        handleCleanupCall();
        Alert.alert('انتهت المكالمة', 'تم إنهاء المكالمة من قبل الطرف الثاني.');
      });
    }

    return () => {
      if (socket) socket.disconnect();
      handleCleanupCall();
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

  const stopRingtone = async () => {
    if (ringtoneRef.current) {
      try {
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      } catch (e) {
        console.error('Error stopping ringtone:', e);
      }
    }
  };

  const handleCleanupCall = () => {
    stopRingtone();
    setView('home');
    setIsCallAnswered(false);

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const handleCall = async (number: string) => {
    if (view === 'call') return; // Prevent multiple calls
    setCallName(number === 'SOS' ? 'إنذار فوري' : ('رقم طوارئ: ' + number));
    setIsCallAnswered(false);
    setView('call');

    // Play Ringback Tone
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/phone/phone-calling-1.mp3' }, // Simple ringback sound
        { shouldPlay: true, isLooping: true }
      );
      ringtoneRef.current = sound;
    } catch (e) {
      console.error('Failed to play ringtone:', e);
    }

    console.log(`Starting WebRTC call to: ${number}`);
    try {
      // 1. Get Local Stream
      const stream: any = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      // 2. Create PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

      // Handle ICE
      pc.onicecandidate = (event: any) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice_candidate', {
            candidate: event.candidate,
            callerId: myCallerId.current,
            targetId: dashboardSocketIdRef.current
          });
        }
      };

      pc.ontrack = (event: any) => {
        console.log('Mobile App: Received track', event.streams);
      };

      // 3. Create Offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await pc.setLocalDescription(offer);

      // 4. Signaling
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending call_initiate signal via socket (WebRTC)');
        socketRef.current.emit('call_initiate', {
          callerId: myCallerId.current,
          offer: offer,
          type: number === 'SOS' ? 'SOS' : 'voice',
          location: location || 'غير محدد'
        });
      } else {
        console.warn('Socket not connected');
        Alert.alert('خطأ في الاتصال', 'التطبيق غير متصل بالسيرفر حالياً.');
      }
    } catch (err: any) {
      console.error("Call initiation failed:", err);
      Alert.alert('خطأ', `تعذر بدء الاتصال: ${err.message || 'خطأ غير معروف'}`);
      handleCleanupCall();
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('call_ended', { callerId: myCallerId.current });
    }
    handleCleanupCall();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {view === 'home' && (
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
      )}

      {view === 'report' && reportType && (
        <ReportForm type={reportType} onBack={handleBack} />
      )}

      {view === 'voice' && (
        <VoiceRecorder onBack={handleBack} location={location} />
      )}

      {view === 'call' && (
        <View style={{ flex: 1 }}>
          <CallScreen onEndCall={handleEndCall} name={callName} isAnswered={isCallAnswered} />
        </View>
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
