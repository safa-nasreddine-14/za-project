import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Phone } from 'lucide-react-native';

const CallButton = ({ number, label, color = '#34A853' }: { number: string, label?: string, color?: string }) => {
    const handlePress = () => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <TouchableOpacity
            style={[styles.callButton, { backgroundColor: color }]}
            onPress={handlePress}
        >
            <Phone size={16} color="white" />
            <View style={styles.btnTextContainer}>
                <Text style={styles.numberText}>{number}</Text>
                {label && <Text style={styles.labelText}>{label}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default function QuickCallFooter() {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>أرقام الطوارئ السريعة</Text>
            <View style={styles.buttonRow}>
                <CallButton number="1021" label="الرقم الأخضر" color="#2E7D32" />
                <CallButton number="14" label="الحماية المدنية" color="#D32F2F" />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    section: {
        padding: 16,
        paddingBottom: 24, // Optimized space at bottom
        backgroundColor: '#f8fafc',
    },
    sectionTitle: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    btnTextContainer: {
        alignItems: 'center',
    },
    numberText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    labelText: {
        color: 'white',
        fontSize: 9,
        opacity: 0.9,
    }
});
