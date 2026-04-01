import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function BrowseJobsScreen() {
    const { userId, userData } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingBid, setSubmittingBid] = useState(false);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            // Filter out completed/cancelled jobs
            const openJobs = response.data.filter(j => j.status === 'open' || j.status === 'assigned');
            setJobs(openJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('Error', 'Failed to load jobs. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const handleQuickBid = async (job) => {
        if (!job.biddingEnabled) {
            Alert.alert("Notice", "Bidding is not enabled for this job.");
            return;
        }

        Alert.alert(
            "Place Bid",
            `Do you want to submit a quick bid for "${job.title}" at your standard rate (₹${userData?.hourlyRate || 0}/hr)?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Submit Bid", 
                    onPress: async () => {
                        setSubmittingBid(true);
                        try {
                            const bidData = {
                                jobId: job._id,
                                workerId: userId,
                                workerName: userData.name,
                                workerEmail: userData.email,
                                workerPhone: userData.phone,
                                workerExperience: userData.experience,
                                workerRating: userData.rating || 0,
                                bidAmount: userData.hourlyRate * 4 || job.budget, // Simple estimation
                                estimatedDuration: 'To be discussed',
                                coverLetter: 'I am highly interested in your job and am available to start soon. I have verified skills matching your requirements. Looking forward to discussing details.',
                                availability: new Date().toISOString().split('T')[0]
                            };

                            const response = await api.post('/bids', bidData);
                            if (response.status === 201) {
                                Alert.alert("Success", "Your bid has been placed successfully!");
                                fetchJobs(); // Refresh job list
                            }
                        } catch (error) {
                            console.error('Bid error:', error.response?.data || error.message);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to place bid.');
                        } finally {
                            setSubmittingBid(false);
                        }
                    }
                }
            ]
        );
    };

    const renderJobItem = ({ item }) => {
        const createdDate = new Date(item.createdAt).toLocaleDateString('en-IN');
        return (
            <View style={styles.jobCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.category}</Text>
                    </View>
                </View>
                
                <Text style={styles.jobDescription} numberOfLines={3}>{item.description}</Text>
                
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>💰</Text>
                        <Text style={styles.detailText}>₹{item.budget}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🕒</Text>
                        <Text style={styles.detailText}>{item.duration || 'Flexible'}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>Posted: {createdDate}</Text>
                    
                    {item.status === 'open' && item.biddingEnabled ? (
                        <TouchableOpacity 
                            style={styles.bidButton}
                            onPress={() => handleQuickBid(item)}
                            disabled={submittingBid}
                        >
                            <Text style={styles.bidButtonText}>Place Quick Bid</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    )}
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
                data={jobs}
                keyExtractor={(item) => item._id}
                renderItem={renderJobItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No available jobs found.</Text>
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
    jobCard: {
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
        borderLeftColor: '#059669',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        marginRight: 10,
    },
    badge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#065f46',
        fontSize: 12,
        fontWeight: '600',
    },
    jobDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    detailsContainer: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
    bidButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    bidButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
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
