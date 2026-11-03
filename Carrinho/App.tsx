import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./Context/AuthContext";
import { CarrinhoProvider } from "./Context/CarrinhoContext";
import { AppNavigator } from "./Navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CarrinhoProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </CarrinhoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
