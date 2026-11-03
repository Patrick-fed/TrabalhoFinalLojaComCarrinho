import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CORES } from "../Constants/cores";

type ModalConfirmacaoProps = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  carregando?: boolean;
};

export function ModalConfirmacao({
  visivel,
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar,
  aoConfirmar,
  aoCancelar,
  carregando = false,
}: ModalConfirmacaoProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visivel}
      onRequestClose={() => {
        if (!carregando) {
          aoCancelar();
        }
      }}
    >
      <View style={estilos.fundo}>
        <View style={estilos.caixa} accessibilityViewIsModal>
          <Text style={estilos.titulo}>{titulo}</Text>
          <Text style={estilos.mensagem}>{mensagem}</Text>

          <View style={estilos.acoes}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={textoCancelar}
              accessibilityState={{ disabled: carregando }}
              disabled={carregando}
              onPress={aoCancelar}
              style={({ pressed }) => [
                estilos.botaoCancelar,
                carregando ? estilos.botaoDesabilitado : null,
                pressed && !carregando
                  ? estilos.botaoCancelarPressionado
                  : null,
              ]}
            >
              <Text style={estilos.textoCancelar}>{textoCancelar}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={textoConfirmar}
              accessibilityState={{ disabled: carregando, busy: carregando }}
              disabled={carregando}
              onPress={aoConfirmar}
              style={({ pressed }) => [
                estilos.botaoConfirmar,
                carregando ? estilos.botaoDesabilitado : null,
                pressed && !carregando
                  ? estilos.botaoConfirmarPressionado
                  : null,
              ]}
            >
              {carregando ? (
                <ActivityIndicator color={CORES.branco} size="small" />
              ) : (
                <Text style={estilos.textoConfirmar}>{textoConfirmar}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    alignItems: "center",
    backgroundColor: "rgba(16, 32, 48, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  caixa: {
    backgroundColor: CORES.branco,
    borderRadius: 12,
    maxWidth: 420,
    padding: 20,
    width: "100%",
  },
  titulo: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  mensagem: {
    color: CORES.textoSecundario,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  acoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  botaoCancelar: {
    borderColor: CORES.borda,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botaoCancelarPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoCancelar: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  botaoConfirmar: {
    alignItems: "center",
    backgroundColor: CORES.erro,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 92,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botaoConfirmarPressionado: {
    opacity: 0.85,
  },
  textoConfirmar: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: "700",
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});
