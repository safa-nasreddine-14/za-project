import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { ArrowLeft, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { ENDPOINTS } from '../constants/Config';

export default function ReportLog({ onBack }: { onBack: () => void }) {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReports = async () => {
        try {
            const response = await fetch(ENDPOINTS.REPORTS);
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.reportItem}>
            <View style={styles.reportHeader}>
                <Text style={styles.reportCategory}>{item.category || 'غير محدد'}</Text>
                <View style={styles.timeTag}>
                    <Clock size={12} color="#64748b" />
                    <Text style={styles.timeText}>
                        {new Date(item.timestamp).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>

            <Text style={styles.reportDesc} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.reportFooter}>
                <View style={[styles.statusBadge, item.type === 'event' ? styles.eventBadge : styles.voiceBadge]}>
                    <AlertCircle size={14} color="#fff" />
                    <Text style={styles.statusText}>{item.type === 'event' ? 'حدث' : 'صوتي'}</Text>
                </View>
                {item.location && item.location !== 'غير محدد' && (
                    <View style={styles.locationTag}>
                        <MapPin size={12} color="#64748b" />
                        <Text style={styles.locationText}>موقع مسجل</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>سجل البلاغات</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#002347" />
                    <Text style={styles.loadingText}>جاري تحميل السجل...</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AlertCircle size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>لا توجد بلاغات مسجلة حالياً</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    listContent: {
        padding: 16,
        gap: 12,
    },
    reportItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    reportHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reportCategory: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002347',
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
    },
    reportDesc: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'right',
        marginBottom: 14,
        lineHeight: 20,
    },
    reportFooter: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    eventBadge: {
        backgroundColor: '#0ea5e9',
    },
    voiceBadge: {
        backgroundColor: '#6366f1',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#64748b',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#64748b',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    }
});
