import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState(null); // 'worker' or 'customer'
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null);

    // Initial check for logged-in user
    useEffect(() => {
        const loadStoredUser = async () => {
            try {
                const storedUserType = await AsyncStorage.getItem('userType');
                const storedUserId = await AsyncStorage.getItem('userId');
                const storedUserData = await AsyncStorage.getItem('userData');
                
                if (storedUserType && storedUserId) {
                    setUserType(storedUserType);
                    setUserId(storedUserId);
                    if (storedUserData) {
                        setUserData(JSON.parse(storedUserData));
                    }
                }
            } catch (error) {
                console.error("Failed to load user session", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    // Login Method
    const login = async (email, password, type) => {
        setIsLoading(true);
        try {
            const endpoint = type === 'worker' ? '/workers/login' : '/customers/login';
            const response = await api.post(endpoint, { email, password });
            
            const user = response.data.worker || response.data.customer;
            
            await AsyncStorage.setItem('userType', type);
            await AsyncStorage.setItem('userId', user._id);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            
            setUserType(type);
            setUserId(user._id);
            setUserData(user);
            
            return { success: true };
        } catch (error) {
            console.error("Login error", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout Method
    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userData');
            
            setUserType(null);
            setUserId(null);
            setUserData(null);
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            isLoading,
            userType,
            userId,
            userData,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
