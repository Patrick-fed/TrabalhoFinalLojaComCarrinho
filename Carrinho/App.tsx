import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./Context/AuthContext";
import { CarrinhoProvider } from "./Context/CarrinhoContext";
import { TemaProvider, useTema } from "./Context/TemaContext";
import { AppNavigator } from "./Navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <Aplicacao />
      </TemaProvider>
    </SafeAreaProvider>
  );
}

function Aplicacao() {
  const { tema } = useTema();

  return (
    <AuthProvider>
      <CarrinhoProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style={tema === "escuro" ? "light" : "dark"} />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
