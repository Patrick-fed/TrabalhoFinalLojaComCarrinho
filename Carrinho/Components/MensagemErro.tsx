import { StyleSheet, Text, View } from "react-native";
import { CORES } from "../Constants/cores";

type MensagemErroProps = {
  mensagem?: string | null;
};

export function MensagemErro({ mensagem }: MensagemErroProps) {
  if (!mensagem) {
    return null;
  }

  return (
    <View style={estilos.container} accessibilityRole="alert">
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.erroFundo,
    borderColor: CORES.erro,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  texto: {
    color: CORES.erro,
    fontSize: 14,
  },
});
