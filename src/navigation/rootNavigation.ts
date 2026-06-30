// src/navigation/rootNavigation.ts
import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "./AppNavigator"; // You can import the type here

export const globalNavigationRef = createNavigationContainerRef<RootStackParamList>();