import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

type RootTabParamList = {
  首頁: undefined;
  個人資料: undefined;
};

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

type RouteProps = {
  name: keyof RootTabParamList;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }: { route: RouteProps }) => ({
          tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            
            if (route.name === "首頁") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "個人資料") {
              iconName = focused ? "person" : "person-outline";
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#0066cc",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="首頁" component={HomeScreen} />
        <Tab.Screen name="個人資料" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
