import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { MensagemErro } from "../Components/MensagemErro";
import { CORES } from "../Constants/cores";
import { useAuth } from "../Context/AuthContext";
import { obterMensagemDeErro } from "../Utils/erros";

export function HomeScreen() {
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSair() {
    if (saindo) {
      return;
    }

    setSaindo(true);
    setErro(null);

    try {
      await sair();
    } catch (erroCapturado) {
      setErro(obterMensagemDeErro(erroCapturado));
    } finally {
      setSaindo(false);
    }
  }

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.conteudo}>
        <View style={estilos.cartao}>
          <Text style={estilos.titulo}>Loja Virtual</Text>
          <Text style={estilos.descricao}>Área principal em construção.</Text>

          <View style={estilos.blocoUsuario}>
            <Text style={estilos.rotulo}>Usuário autenticado</Text>
            <Text style={estilos.email}>
              {usuario?.email ?? "E-mail não disponível"}
            </Text>
          </View>

          <MensagemErro mensagem={erro} />

          <BotaoPrincipal
            titulo="Sair"
            aoPressionar={() => {
              void aoSair();
            }}
            carregando={saindo}
          />
        </View>
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
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  cartao: {
    alignSelf: "center",
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 480,
    padding: 24,
    width: "100%",
  },
  titulo: {
    color: CORES.primaria,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  descricao: {
    color: CORES.textoSecundario,
    fontSize: 14,
    marginBottom: 20,
  },
  blocoUsuario: {
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    marginBottom: 20,
    padding: 16,
  },
  rotulo: {
    color: CORES.textoSecundario,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  email: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "600",
  },
});
