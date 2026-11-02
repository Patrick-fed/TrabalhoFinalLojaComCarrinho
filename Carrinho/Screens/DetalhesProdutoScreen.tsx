import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CORES } from "../Constants/cores";
import type { AppStackParamList } from "../Types/navigation";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type DetalhesProdutoScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "DetalhesProduto"
>;

export function DetalhesProdutoScreen({
  navigation,
  route,
}: DetalhesProdutoScreenProps) {
  const { produto } = route.params;
  const [imagemFalhou, setImagemFalhou] = useState(false);

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o catálogo"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            estilos.botaoVoltar,
            pressed ? estilos.botaoVoltarPressionado : null,
          ]}
        >
          <Text style={estilos.textoBotaoVoltar}>Voltar</Text>
        </Pressable>

        <Text style={estilos.tituloCabecalho}>Detalhes do produto</Text>
      </View>

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.areaImagem}>
          {imagemFalhou ? (
            <View style={estilos.semImagem}>
              <Text style={estilos.textoSemImagem}>
                Imagem indisponível
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: produto.imagem }}
              style={estilos.imagem}
              resizeMode="cover"
              onError={() => setImagemFalhou(true)}
              accessibilityLabel={`Imagem de ${produto.nome}`}
            />
          )}
        </View>

        <Text style={estilos.nome}>{produto.nome}</Text>
        <Text style={estilos.preco}>
          {formatarPrecoCentavos(produto.preco)}
        </Text>

        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>
            Os detalhes completos deste produto serão implementados em breve.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.fundo,
    flex: 1,
  },
  cabecalho: {
    alignItems: "center",
    backgroundColor: CORES.branco,
    borderBottomColor: CORES.borda,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  botaoVoltar: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  botaoVoltarPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoBotaoVoltar: {
    color: CORES.primaria,
    fontSize: 15,
    fontWeight: "700",
  },
  tituloCabecalho: {
    color: CORES.texto,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    paddingRight: 56,
    textAlign: "center",
  },
  conteudo: {
    padding: 16,
    paddingBottom: 32,
  },
  areaImagem: {
    aspectRatio: 1.4,
    backgroundColor: CORES.primariaClara,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    width: "100%",
  },
  imagem: {
    height: "100%",
    width: "100%",
  },
  semImagem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  textoSemImagem: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  nome: {
    color: CORES.texto,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  preco: {
    color: CORES.primaria,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  aviso: {
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    padding: 16,
  },
  textoAviso: {
    color: CORES.primariaEscura,
    fontSize: 14,
    lineHeight: 20,
  },
});
