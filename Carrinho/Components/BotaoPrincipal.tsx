import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import type { Paleta } from "../Constants/cores";
import { useTema } from "../Context/TemaContext";

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
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
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
        <ActivityIndicator color={cores.branco} />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const criarEstilos = (cores: Paleta) => StyleSheet.create({
  botao: {
    alignItems: "center",
    backgroundColor: cores.primaria,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botaoDesabilitado: {
    backgroundColor: cores.textoSecundario,
    opacity: 0.7,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  texto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: "700",
  },
});
