import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { PhoneOff, Mic, MicOff, Volume2, User } from 'lucide-react-native';

interface CallScreenProps {
    onEndCall: () => void;
    name?: string;
    isAnswered: boolean;
}

export default function CallScreen({ onEndCall, name = 'مركز العمليات', isAnswered }: CallScreenProps) {

    const [seconds, setSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);

    useEffect(() => {
        let timer: any;
        if (isAnswered) {
            timer = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isAnswered]);


    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <User size={80} color="#fff" />
                </View>
                <Text style={styles.callerName}>{name}</Text>
                <Text style={styles.callStatus}>{isAnswered ? 'مكالمة جارية...' : 'جاري الاتصال...'}</Text>
                {isAnswered && <Text style={styles.timer}>{formatTime(seconds)}</Text>}

            </View>

            <View style={styles.controls}>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.controlBtn, isMuted && styles.activeControlBtn]}
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <MicOff size={28} color="#fff" /> : <Mic size={28} color="#fff" />}
                        <Text style={styles.controlText}>كتم</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlBtn, isSpeaker && styles.activeControlBtn]}
                        onPress={() => setIsSpeaker(!isSpeaker)}
                    >
                        <Volume2 size={28} color="#fff" />
                        <Text style={styles.controlText}>مكبر الصوت</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.hangupBtn} onPress={onEndCall}>
                    <PhoneOff size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    avatarCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#002B5B',
    },
    callerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    callStatus: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 10,
    },
    timer: {
        fontSize: 20,
        color: '#fff',
    },
    controls: {
        paddingBottom: 60,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 40,
    },
    controlBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeControlBtn: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    controlText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 4,
    },
    hangupBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
