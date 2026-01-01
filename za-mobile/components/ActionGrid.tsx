import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Mic, AlertTriangle, BellRing } from 'lucide-react-native';

export default function ActionGrid({ onOpenReport, onEmergencyCall, location }: { onOpenReport: (type: string) => void, onEmergencyCall: () => void, location: string | null }) {



    const handleAlarm = () => {
        Alert.alert(
            'إنذار فوري',
            'سيتم إجراء اتصال طارئ بمركز العمليات. هل أنت متأكد؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'اتصال الآن',
                    onPress: async () => {
                        onEmergencyCall();
                        // Also trigger the API alarm for the dashboard to record it
                        try {
                            const { ENDPOINTS } = require('../constants/Config');
                            await fetch(ENDPOINTS.ALARMS, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    deviceId: 'Mobile-User',
                                    location: location || 'غير محدد',
                                    type: 'SOS'
                                })
                            });
                        } catch (e) {
                            console.error('Failed to send SOS alarm to API:', e);
                        }
                    }
                }
            ]
        );
    };


    return (
        <View style={styles.gridContainer}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onOpenReport('voice')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#00234715' }]}>
                        <Mic size={32} color="#002347" />
                    </View>
                    <Text style={styles.btnText}>رسالة صوتية</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onOpenReport('event')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#00234715' }]}>
                        <AlertTriangle size={32} color="#002347" />
                    </View>
                    <Text style={styles.btnText}>تبليغ عن حدث</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.alarmBtn}
                onPress={handleAlarm}
            >
                <View style={styles.alarmIconCircle}>
                    <BellRing size={32} color="white" />
                </View>
                <Text style={styles.alarmText}>إنذار فوري</Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    gridContainer: {
        padding: 16,
        gap: 16,
    },
    topRow: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    iconCircle: {
        padding: 12,
        borderRadius: 30,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#002347',
    },
    alarmBtn: {
        backgroundColor: '#D32F2F', // --alarm-red
        padding: 24,
        borderRadius: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    alarmIconCircle: {
        padding: 12,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    alarmText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});


