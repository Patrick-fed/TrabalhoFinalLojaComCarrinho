import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CORES } from "../Constants/cores";

export function CarregandoScreen() {
  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.conteudo}>
        <ActivityIndicator color={CORES.primaria} size="large" />
        <Text style={estilos.texto}>Carregando...</Text>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.fundo,
    flex: 1,
  },
  conteudo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  texto: {
    color: CORES.textoSecundario,
    fontSize: 16,
    marginTop: 12,
  },
});
