import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>المديرية العامة للحماية المدنية</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#002347', // --primary-blue
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
