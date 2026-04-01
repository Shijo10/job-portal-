import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import BrowseJobsScreen from '../screens/BrowseJobsScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const { userType } = useContext(AuthContext);

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#059669',
                tabBarInactiveTintColor: 'gray',
                headerTitleStyle: { fontWeight: 'bold' }
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeScreen} 
                options={{ title: 'Profile' }}
            />
            {userType === 'worker' ? (
                <Tab.Screen 
                    name="BrowseJobs" 
                    component={BrowseJobsScreen} 
                    options={{ title: 'Browse Jobs' }}
                />
            ) : null}
            <Tab.Screen 
                name="Dashboard" 
                component={DashboardScreen} 
                options={{ title: userType === 'worker' ? 'My Bids' : 'My Jobs' }}
            />
        </Tab.Navigator>
    );
}
