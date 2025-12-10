import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function ToolScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tool: {id}</Text>
            <View style={styles.card}>
                <TouchableOpacity style={styles.uploadBtn}>
                    <Text style={styles.btnText}>Select File</Text>
                </TouchableOpacity>
                <Text style={styles.hint}>Supported formats: PDF, JPG, PNG</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    uploadBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    hint: {
        color: '#64748b',
        fontSize: 14,
    }
});
