// imports icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

// just the main tab bar
export default function TabsLayout() {
  return (
    // sets the full tab bar style with all props
    // header is the top navigation bar that corresponds to the tab bar 
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f0f0f0" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#A682FF",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      {/* Tabs.Screen is a component from expo router that defines a screen in tab layout
      "name" is the route name and must match the route name in the index.tsx file
      options is where I configure how the specific tab looks
      tabBarIcon returns icon component and has default parameters for color and size */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Campus",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="moving"
        options={{
          title: "Moving",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="truck"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chat"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
