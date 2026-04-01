import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function DashboardScreen() {
    const { userId, userType } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            if (userType === 'worker') {
                // Fetch Worker's Bids
                const response = await api.get(`/bids/worker/${userId}`);
                setData(response.data);
            } else {
                // Fetch Customer's Jobs
                const response = await api.get('/jobs');
                // Filter jobs belonging to this customer
                const myJobs = response.data.filter(j => j.customerId?._id === userId || j.customerId === userId);
                setData(myJobs);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId, userType]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleNavigate = (job) => {
        const mapsUrl = (job.coordinates && job.coordinates.lat)
            ? `https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((job.location || '') + ' India')}`;
        
        Linking.openURL(mapsUrl).catch(err => console.error("Couldn't load page", err));
    };

    const renderWorkerBid = ({ item }) => {
        const job = item.jobId || {};
        const isAccepted = item.status === 'accepted';
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{job.title || 'Job Title'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isAccepted ? '#d1fae5' : '#fef3c7' }]}>
                        <Text style={[styles.statusText, { color: isAccepted ? '#065f46' : '#92400e' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Bid Amount:</Text>
                    <Text style={styles.detailValue}>₹{item.bidAmount}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{job.location || 'N/A'}</Text>
                </View>

                {isAccepted && (
                    <TouchableOpacity 
                        style={styles.navigateBtn}
                        onPress={() => handleNavigate(job)}
                    >
                        <Text style={styles.navigateBtnText}>📍 Navigate to Customer</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderCustomerJob = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Budget:</Text>
                    <Text style={styles.detailValue}>₹{item.budget}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Workers Bidding:</Text>
                    <Text style={styles.detailValue}>{item.bids?.length || 0}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={userType === 'worker' ? renderWorkerBid : renderCustomerJob}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {userType === 'worker' ? 'You have no active bids.' : 'You have not posted any jobs.'}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#4f46e5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '700',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    navigateBtn: {
        backgroundColor: '#4f46e5',
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    navigateBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    }
});
