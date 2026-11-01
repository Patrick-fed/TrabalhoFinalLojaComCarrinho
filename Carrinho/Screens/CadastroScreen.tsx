import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { CampoTexto } from "../Components/CampoTexto";
import { MensagemErro } from "../Components/MensagemErro";
import { CORES } from "../Constants/cores";
import { useAuth } from "../Context/AuthContext";
import type { AuthStackParamList } from "../Types/navigation";
import { obterMensagemDeErro } from "../Utils/erros";
import {
  temErros,
  validarCadastro,
} from "../Utils/validacoes";
import type { ErrosFormulario } from "../Utils/validacoes";

type CadastroScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Cadastro"
>;

export function CadastroScreen({ navigation }: CadastroScreenProps) {
  const { cadastrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function limparErro(campo: keyof ErrosFormulario) {
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    setErroGeral(null);
  }

  async function enviar() {
    if (enviando) {
      return;
    }

    const novosErros = validarCadastro(email, senha, confirmacao);
    setErros(novosErros);
    setErroGeral(null);

    if (temErros(novosErros)) {
      return;
    }

    setEnviando(true);

    try {
      await cadastrar({ email, senha });
    } catch (erro) {
      setErroGeral(obterMensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.container}>
      <KeyboardAvoidingView
        style={estilos.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>Criar conta</Text>
            <Text style={estilos.subtitulo}>
              Preencha os dados para acessar a loja.
            </Text>

            <MensagemErro mensagem={erroGeral} />

            <CampoTexto
              label="E-mail"
              valor={email}
              aoMudar={(valor) => {
                setEmail(valor);
                limparErro("email");
              }}
              erro={erros.email}
              placeholder="seu@email.com"
              tipoTeclado="email-address"
              autoComplete="email"
              returnKeyType="next"
            />

            <CampoTexto
              label="Senha"
              valor={senha}
              aoMudar={(valor) => {
                setSenha(valor);
                limparErro("senha");
              }}
              erro={erros.senha}
              placeholder="Mínimo de 6 caracteres"
              seguro
              autoComplete="new-password"
              returnKeyType="next"
            />

            <CampoTexto
              label="Confirmar senha"
              valor={confirmacao}
              aoMudar={(valor) => {
                setConfirmacao(valor);
                limparErro("confirmacao");
              }}
              erro={erros.confirmacao}
              placeholder="Repita a senha"
              seguro
              autoComplete="new-password"
              returnKeyType="done"
              aoEnviar={() => {
                void enviar();
              }}
            />

            <BotaoPrincipal
              titulo="Criar conta"
              aoPressionar={() => {
                void enviar();
              }}
              carregando={enviando}
            />

            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate("Login")}
              style={estilos.link}
            >
              <Text style={estilos.textoLink}>Já tenho conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.fundo,
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
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
  subtitulo: {
    color: CORES.textoSecundario,
    fontSize: 14,
    marginBottom: 20,
  },
  link: {
    alignItems: "center",
    marginTop: 16,
    padding: 8,
  },
  textoLink: {
    color: CORES.primaria,
    fontSize: 14,
    fontWeight: "600",
  },
});
