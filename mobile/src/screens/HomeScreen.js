import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen() {
    const { logout, userType, userData } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.welcomeText}>Welcome, {userData?.name || 'User'}!</Text>
                <Text style={styles.roleText}>Logged in as {userType === 'worker' ? 'Worker' : 'Customer'}</Text>
                
                <Text style={styles.infoText}>
                    This is the initial React Native screen. More features (Browse Jobs, Dashboard) will be added here in the next phases.
                </Text>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    roleText: {
        fontSize: 16,
        color: '#059669',
        fontWeight: '600',
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
