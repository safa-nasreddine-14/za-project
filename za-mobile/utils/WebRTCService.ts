import { Platform } from 'react-native';

let WebRTC: any = {
    RTCPeerConnection: null,
    RTCIceCandidate: null,
    RTCSessionDescription: null,
    mediaDevices: null,
    MediaStream: null,
};

if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
        WebRTC = {
            RTCPeerConnection: window.RTCPeerConnection,
            RTCIceCandidate: (window as any).RTCIceCandidate,
            RTCSessionDescription: (window as any).RTCSessionDescription,
            mediaDevices: navigator.mediaDevices,
            MediaStream: (window as any).MediaStream,
        };
    }
} else {
    try {
        // This only works in custom Development Builds (npx expo run:android)
        const WrappedWebRTC = require('react-native-webrtc');
        if (WrappedWebRTC) {
            WebRTC = WrappedWebRTC;
        }
    } catch (e) {
        console.warn('WebRTC native module not found. (Standard Expo Go / Manual Revert detected)');
    }
}

export const RTCPeerConnection = WebRTC.RTCPeerConnection;
export const RTCIceCandidate = WebRTC.RTCIceCandidate;
export const RTCSessionDescription = WebRTC.RTCSessionDescription;
export const mediaDevices = WebRTC.mediaDevices;
export const MediaStream = WebRTC.MediaStream;
