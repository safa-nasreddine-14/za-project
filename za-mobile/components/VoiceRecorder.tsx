import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Mic, Square, Play, Send } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { ENDPOINTS } from '../constants/Config';

// Global reference to ensure only one recording object exists across component remounts
let globalRecording: Audio.Recording | null = null;
let isPreparingGlobal = false;

export default function VoiceRecorder({ onBack, location }: { onBack: () => void, location: string | null }) {
    const [isRecording, setIsRecording] = useState(false);
    const [soundUri, setSoundUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const isMounted = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (globalRecording) {
                const rec = globalRecording;
                globalRecording = null;
                rec.stopAndUnloadAsync().catch(err => console.log('Cleanup global recording error', err));
            }
            if (soundRef.current) {
                const snd = soundRef.current;
                soundRef.current = null;
                snd.unloadAsync().catch(err => console.log('Cleanup sound error', err));
            }
        };
    }, []);

    async function startRecording() {
        if (isPreparingGlobal || isRecording) return;
        isPreparingGlobal = true;

        try {
            // Force cleanup of ANY global recording object before starting
            if (globalRecording) {
                try {
                    await globalRecording.stopAndUnloadAsync();
                } catch (e) { }
                globalRecording = null;
            }

            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                if (isMounted.current) Alert.alert('الصلاحيات مطلوبة', 'نحتاج الوصول للميكروفون لتسجيل الرسالة.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false
            });

            console.log('Creating new recording object...');
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            if (!isMounted.current) {
                console.log('Unmounted during creation, unloading...');
                await newRecording.stopAndUnloadAsync().catch(() => { });
                globalRecording = null;
                return;
            }

            globalRecording = newRecording;
            setIsRecording(true);
            console.log('Recording started successfully');
        } catch (err) {
            console.error('Failed to start recording', err);
            globalRecording = null;
            if (isMounted.current) {
                Alert.alert('خطأ', 'فشل بدء التسجيل، يرجى المحاولة مرة أخرى.');
            }
        } finally {
            isPreparingGlobal = false;
        }
    }

    async function stopRecording() {
        if (!globalRecording) return;
        setIsRecording(false);
        try {
            await globalRecording.stopAndUnloadAsync();
            const uri = globalRecording.getURI();
            setSoundUri(uri);
        } catch (err) {
            console.error('Stop recording failed', err);
        } finally {
            globalRecording = null;
        }
    }

    async function playRecording() {
        if (!soundUri) return;
        try {
            // Unload previous sound if any
            if (soundRef.current) {
                await soundRef.current.unloadAsync().catch(() => { });
            }

            // Ensure audio mode is set for playback
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false
            });

            const { sound } = await Audio.Sound.createAsync({ uri: soundUri as string });
            soundRef.current = sound;
            await sound.playAsync();

            // Clean up sound after it finishes playing
            sound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.didJustFinish) {
                    sound.unloadAsync().catch(() => { });
                    soundRef.current = null;
                }
            });
        } catch (err) {
            console.error('Playback failed', err);
        }
    }

    async function handleSend() {
        if (!soundUri) return;
        setLoading(true);
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('audio', {
                uri: soundUri,
                name: 'voice_message.m4a',
                type: 'audio/m4a',
            });
            formData.append('location', location || 'غير محدد');
            formData.append('deviceId', 'Mobile-User');

            const response = await fetch(ENDPOINTS.VOICE, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - FormData sets it automatically with boundary
            });

            if (response.ok) {
                Alert.alert('نجاح', 'تم إرسال الرسالة الصوتية بنجاح.');
                onBack();
            }
        } catch (err) {
            console.error(err);
            Alert.alert('خطأ', 'فشل إرسال التسجيل.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>رسالة صوتية مستعجلة</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.micCircle}>
                    <Mic size={60} color={isRecording ? '#ef4444' : '#002347'} />
                </View>

                <Text style={styles.statusText}>
                    {isRecording ? 'جاري التسجيل...' : soundUri ? 'تم التسجيل بنجاح' : 'اضغط للبدء في التسجيل'}
                </Text>

                <View style={styles.controls}>
                    {!isRecording && !soundUri && (
                        <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
                            <Mic size={32} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {isRecording && (
                        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                            <Square size={32} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {soundUri && !isRecording && (
                        <View style={styles.finalActions}>
                            <TouchableOpacity style={styles.playBtn} onPress={playRecording}>
                                <Play size={24} color="#002B5B" />
                                <Text style={styles.btnText}>تشغيل</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Send size={24} color="#fff" />
                                        <Text style={styles.sendText}>إرسال</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.retryBtn} onPress={() => setSoundUri(null)}>
                                <Text style={styles.retryText}>إعادة التسجيل</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#002347',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    micCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f0f4f8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderWidth: 2,
        borderColor: '#002B5B',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 50,
    },
    controls: {
        width: '100%',
        alignItems: 'center',
    },
    recordBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#002347',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finalActions: {
        gap: 15,
        width: '100%',
    },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#002B5B',
    },
    sendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#2e7d32',
    },
    retryBtn: {
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: { color: '#002B5B', fontWeight: 'bold' },
    sendText: { color: '#fff', fontWeight: 'bold' },
    retryText: { color: '#666' }
});
