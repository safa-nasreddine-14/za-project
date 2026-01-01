import { View, Text, StyleSheet } from 'react-native';
import { Smartphone, Wifi, ShieldCheck } from 'lucide-react-native';

export default function Hero() {
    return (
        <View style={styles.container}>
            <View style={styles.hexagonPlaceholder}>
                <View style={styles.iconRow}>
                    <Smartphone size={24} color="#fff" />
                    <Wifi size={24} color="#fff" />
                </View>
                <ShieldCheck size={48} color="#fff" />
                <Text style={styles.title}>Allo حماية</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        marginTop: 10,
    },
    hexagonPlaceholder: {
        width: 180,
        height: 180,
        backgroundColor: '#003366', // --secondary-blue
        borderRadius: 30, // Rounded instead of clip-path polygon
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#002347',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    title: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
