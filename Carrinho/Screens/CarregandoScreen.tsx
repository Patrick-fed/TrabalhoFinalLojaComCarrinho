import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Paleta } from "../Constants/cores";
import { useTema } from "../Context/TemaContext";

export function CarregandoScreen() {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.conteudo}>
        <ActivityIndicator color={cores.primaria} size="large" />
        <Text style={estilos.texto}>Carregando...</Text>
      </View>
    </SafeAreaView>
  );
}

const criarEstilos = (cores: Paleta) => StyleSheet.create({
  container: {
    backgroundColor: cores.fundo,
    flex: 1,
  },
  conteudo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 16,
    marginTop: 12,
  },
});
