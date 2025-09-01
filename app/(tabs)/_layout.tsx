// imports icons from Material Community Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
//imports the tabs component (render native UI)
import { Tabs } from "expo-router";

// just the main tab bar
// export makes this function available in other files 
// default just mean that this is mean component of the file (most important thing/reusable piece of code)
// TabsLayout is the name of the function
// () means that this function requires no arguments to run
export default function TabsLayout() {
  return (
    // sets the full tab bar style with all props
    // creates the tab navigation bar at the bottom or my app
    // screenOptions sets up the appearance of all the tab WINDOWS
    <Tabs
    // {{}} because pass in JS object which is then a dictionary
    // JSX describes what UI should look like while JS describes how something should look or behave
    // screenOptions is asking for how to configure the tabs (LOGIC), not the actual UI
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
      {/* Tabs.Screen is a component from expo router that defines a screen in tab layout => basically saying: "Here are all the tabs in my app that will be displayed by tabs"
      "name" is the route name and must match the route name in the index.tsx file
      options is where I configure how the specific tab looks
      tabBarIcon returns icon component and has default parameters for color and size */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Campus",
          // prop that is built into the tabs.screen component 
          // ({color, size}) => is an arrow function that requests two parameters and then says= "This is what I'm gonna do with them"
          // The tabs component alreadty provides the color and size, so we don't need to pass them in
          tabBarIcon: ({ color, size }) => (
            // MaterialCommunityIcons is a component from the Material Community Icons library, name is the name of the icon in the library
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
