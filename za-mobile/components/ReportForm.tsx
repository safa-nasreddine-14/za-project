import React, { useState, useRef, useEffect } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions
} from 'react-native';
import { ArrowLeft, Camera, MapPin, Send, X } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ENDPOINTS } from '../constants/Config';

const { width } = Dimensions.get('window');

export default function ReportForm({ type, onBack }: { type: string, onBack: () => void }) {

    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<string | null>(null);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [category, setCategory] = useState<string | null>(null);

    const categories = ['حادث مرور', 'حريق', 'فيضانات', 'إسعاف مريض', 'طلب نجدة', 'أخرى'];

    useEffect(() => {
        handleGetLocation();
    }, []);

    const handlePickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('الصلاحيات مطلوبة', 'نحتاج الوصول إلى الصور لرفع الأدلة.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setMediaFiles(prev => [...prev, ...result.assets]);
        }
    };

    const handleGetLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('الصلاحيات مطلوبة', 'نحتاج الوصول للموقع لتحديد مكان الحادث.');
            return;
        }

        setLoading(true);
        try {
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
        } catch (error) {
            console.error('Error fetching location:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!category) {
            Alert.alert('تنبيه', 'يرجى اختيار نوع التبليغ.');
            return;
        }

        if (!description) {
            Alert.alert('تنبيه', 'يرجى كتابة وصف للحدث.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('category', category);
            formData.append('description', description);
            formData.append('location', location || 'غير محدد');

            mediaFiles.forEach((file, index) => {
                const uriParts = file.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                // React Native FormData requires this specific format
                (formData as any).append('media', {
                    uri: file.uri,
                    name: `upload_${index}.${fileType}`,
                    type: file.type === 'video' ? `video/${fileType}` : `image/${fileType}`,
                });
            });

            console.log('Sending report to server...');
            console.log('Type:', type);
            console.log('Category:', category);
            console.log('Description:', description);
            console.log('Location:', location);
            console.log('Media files:', mediaFiles.length);

            const response = await fetch(ENDPOINTS.REPORTS, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - FormData sets it automatically with boundary
            });

            console.log('Response status:', response.status);

            let responseData;
            try {
                responseData = await response.json();
                console.log('Response data:', responseData);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error(`خطأ ${response.status}: فشل في قراءة استجابة السيرفر`);
            }

            if (response.ok) {
                Alert.alert('نجاح', 'تم إرسال البلاغ بنجاح.');
                onBack();
            } else {
                const errorMsg = responseData.error || responseData.details || 'فشل الإرسال';
                throw new Error(`خطأ ${response.status}: ${errorMsg}`);
            }
        } catch (error: any) {
            const errorMessage = error.message || 'حدث خطأ أثناء التواصل مع السيرفر.';
            Alert.alert('خطأ', errorMessage);
            console.error('Full error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>إرسال بلاغ</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.label}>نوع التبليغ</Text>
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>وصف المشكلة</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="اكتب تفاصيل ما حدث..."
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.actionRow}>
                    <View
                        style={[styles.locationIndicator, location ? styles.activeAction : styles.pendingAction]}
                    >
                        {loading && !location ? (
                            <ActivityIndicator size="small" color="#002347" />
                        ) : (
                            <MapPin size={20} color={location ? '#2e7d32' : '#555'} />
                        )}
                        <Text style={[styles.actionText, location ? { color: '#2e7d32' } : null]}>
                            {location ? 'تم تحديد الموقع تلقائياً' : 'جاري تحديد الموقع...'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, mediaFiles.length > 0 ? styles.activeActionBlue : null]}
                        onPress={handlePickMedia}
                    >
                        <Camera size={20} color={mediaFiles.length > 0 ? '#1565c0' : '#555'} />
                        <Text style={[styles.actionText, mediaFiles.length > 0 ? { color: '#1565c0' } : null]}>
                            {mediaFiles.length > 0 ? `${mediaFiles.length} ملفات` : 'صورة/فيديو'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {mediaFiles.length > 0 && (
                    <View style={styles.mediaGrid}>
                        {mediaFiles.map((file, idx) => (
                            <View key={idx} style={styles.mediaWrapper}>
                                <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                                >
                                    <X size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.submitButton, loading ? styles.disabledButton : null]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.submitText}>إرسال البلاغ</Text>
                        <Send size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
        textAlign: 'right',
    },
    categoryContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    categoryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    categoryBtnActive: {
        backgroundColor: '#002347',
        borderColor: '#002347',
    },
    categoryBtnText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '600',
    },
    categoryBtnTextActive: {
        color: '#fff',
    },

    locationIndicator: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
    },
    pendingAction: {
        backgroundColor: '#fffbe6',
        borderColor: '#ffe58f',
    },
    textArea: {

        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        textAlignVertical: 'top',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'right',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
    },
    activeAction: {
        backgroundColor: '#e8f5e9',
        borderColor: '#2e7d32',
    },
    activeActionBlue: {
        backgroundColor: '#e3f2fd',
        borderColor: '#1565c0',
    },
    actionText: {
        color: '#555',
        fontWeight: '600',
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    mediaWrapper: {
        position: 'relative',
    },
    thumbnail: {
        width: (width - 60) / 3,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        padding: 2,
    },
    submitButton: {
        margin: 20,
        backgroundColor: '#002B5B',
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
