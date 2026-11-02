import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../Context/AuthContext";
import { CadastroScreen } from "../Screens/CadastroScreen";
import { CarregandoScreen } from "../Screens/CarregandoScreen";
import { CatalogoScreen } from "../Screens/CatalogoScreen";
import { DetalhesProdutoScreen } from "../Screens/DetalhesProdutoScreen";
import { LoginScreen } from "../Screens/LoginScreen";
import type { AppStackParamList, AuthStackParamList } from "../Types/navigation";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <CarregandoScreen />;
  }

  if (usuario) {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Catalogo" component={CatalogoScreen} />
        <AppStack.Screen
          name="DetalhesProduto"
          component={DetalhesProdutoScreen}
        />
      </AppStack.Navigator>
    );
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Cadastro" component={CadastroScreen} />
    </AuthStack.Navigator>
  );
}
