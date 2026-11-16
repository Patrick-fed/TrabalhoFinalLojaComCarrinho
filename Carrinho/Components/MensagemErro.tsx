import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Paleta } from "../Constants/cores";
import { useTema } from "../Context/TemaContext";

type MensagemErroProps = {
  mensagem?: string | null;
};

export function MensagemErro({ mensagem }: MensagemErroProps) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  if (!mensagem) {
    return null;
  }

  return (
    <View style={estilos.container} accessibilityRole="alert">
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const criarEstilos = (cores: Paleta) => StyleSheet.create({
  container: {
    backgroundColor: cores.erroFundo,
    borderColor: cores.erro,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  texto: {
    color: cores.erro,
    fontSize: 14,
  },
});
