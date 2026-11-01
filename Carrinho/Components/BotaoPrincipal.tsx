import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { CORES } from "../Constants/cores";

type BotaoPrincipalProps = {
  titulo: string;
  aoPressionar: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
};

export function BotaoPrincipal({
  titulo,
  aoPressionar,
  carregando = false,
  desabilitado = false,
}: BotaoPrincipalProps) {
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={aoPressionar}
      style={({ pressed }) => [
        estilos.botao,
        inativo ? estilos.botaoDesabilitado : null,
        pressed && !inativo ? estilos.botaoPressionado : null,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={CORES.branco} />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    alignItems: "center",
    backgroundColor: CORES.primaria,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botaoDesabilitado: {
    backgroundColor: CORES.textoSecundario,
    opacity: 0.7,
  },
  botaoPressionado: {
    backgroundColor: CORES.primariaEscura,
  },
  texto: {
    color: CORES.branco,
    fontSize: 16,
    fontWeight: "700",
  },
});
