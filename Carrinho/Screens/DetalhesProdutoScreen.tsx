import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { MensagemErro } from "../Components/MensagemErro";
import { CORES } from "../Constants/cores";
import { MENSAGENS_DETALHES_PRODUTO } from "../Constants/mensagensDetalhesProduto";
import { useCarrinho } from "../Context/CarrinhoContext";
import { buscarProdutoPorId } from "../Service/catalogo";
import type { AppStackParamList } from "../Types/navigation";
import type { Produto } from "../Types/types";
import { obterMensagemDeErro } from "../Utils/erros";
import { formatarPrecoCentavos } from "../Utils/formatacao";
import { CarregandoScreen } from "./CarregandoScreen";

type DetalhesProdutoScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "DetalhesProduto"
>;

function obterCodigoErro(erro: unknown): string | null {
  if (typeof erro === "object" && erro !== null && "codigo" in erro) {
    const codigo = (erro as { codigo?: unknown }).codigo;

    return typeof codigo === "string" ? codigo : null;
  }

  return null;
}

export function DetalhesProdutoScreen({
  navigation,
  route,
}: DetalhesProdutoScreenProps) {
  const { produto: produtoDaRota } = route.params;
  const { carrinho, operacao, adicionarProduto } = useCarrinho();

  const [produto, setProduto] = useState<Produto | null>(produtoDaRota);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoIndisponivel, setProdutoIndisponivel] = useState(false);
  const [erroAdicao, setErroAdicao] = useState<string | null>(null);
  const [sucessoAdicao, setSucessoAdicao] = useState<string | null>(null);
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const requisicaoRef = useRef(0);
  const timerSucessoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const produtoId = produtoDaRota.id;

  useEffect(() => {
    const requisicaoId = ++requisicaoRef.current;
    const controller = new AbortController();

    setCarregando(true);
    setErro(null);
    setProdutoIndisponivel(false);

    async function carregar() {
      try {
        const dados = await buscarProdutoPorId(produtoId, controller.signal);

        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoRef.current
        ) {
          return;
        }

        setProduto(dados);
        setErro(null);
        setProdutoIndisponivel(false);
        setImagemFalhou(false);
      } catch (erroCarga) {
        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoRef.current
        ) {
          return;
        }

        if (obterCodigoErro(erroCarga) === "http_404") {
          setProduto(null);
          setProdutoIndisponivel(true);
          setErro(MENSAGENS_DETALHES_PRODUTO.produtoIndisponivel);
        } else {
          setErro(obterMensagemDeErro(erroCarga));
        }
      } finally {
        if (
          !controller.signal.aborted &&
          requisicaoId === requisicaoRef.current
        ) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => controller.abort();
  }, [produtoId, tentativa]);

  useEffect(() => {
    return () => {
      if (timerSucessoRef.current) {
        clearTimeout(timerSucessoRef.current);
      }
    };
  }, []);

  const quantidadeNoCarrinho = produto
    ? carrinho?.itens.find((item) => item.produtoId === produto.id)
        ?.quantidade ?? 0
    : 0;
  const estoqueDisponivel = produto
    ? Math.max(produto.estoque - quantidadeNoCarrinho, 0)
    : 0;
  const esgotado = estoqueDisponivel <= 0;
  const adicionando =
    produto !== null &&
    operacao !== null &&
    operacao.tipo === "adicionar" &&
    operacao.produtoId === produto.id;
  const adicaoDesabilitada = operacao !== null || esgotado;

  function tentarNovamente() {
    if (carregando) {
      return;
    }

    setTentativa((valor) => valor + 1);
  }

  async function adicionarAoCarrinho() {
    if (!produto || operacao !== null || estoqueDisponivel <= 0) {
      return;
    }

    setErroAdicao(null);
    setSucessoAdicao(null);

    if (timerSucessoRef.current) {
      clearTimeout(timerSucessoRef.current);
      timerSucessoRef.current = null;
    }

    try {
      await adicionarProduto(produto.id, 1);
      setSucessoAdicao(MENSAGENS_DETALHES_PRODUTO.adicionado);
      timerSucessoRef.current = setTimeout(() => {
        setSucessoAdicao(null);
        timerSucessoRef.current = null;
      }, 2500);
    } catch (erroOperacao) {
      setErroAdicao(obterMensagemDeErro(erroOperacao));
    }
  }

  if (produto === null && carregando) {
    return <CarregandoScreen />;
  }

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
          <Text style={estilos.textoBotaoVoltar}>
            {MENSAGENS_DETALHES_PRODUTO.voltar}
          </Text>
        </Pressable>

        <Text style={estilos.tituloCabecalho}>
          {MENSAGENS_DETALHES_PRODUTO.titulo}
        </Text>
      </View>

      {produto === null ? (
        <View style={estilos.estadoCentral}>
          <MensagemErro mensagem={erro} />
          {produtoIndisponivel ? (
            <BotaoPrincipal
              titulo={MENSAGENS_DETALHES_PRODUTO.voltarAoCatalogo}
              aoPressionar={() => navigation.goBack()}
            />
          ) : (
            <BotaoPrincipal
              titulo={MENSAGENS_DETALHES_PRODUTO.tentarNovamente}
              aoPressionar={tentarNovamente}
              carregando={carregando}
            />
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
        >
          {carregando ? (
            <View style={estilos.indicadorAtualizacao}>
              <ActivityIndicator color={CORES.primaria} size="small" />
              <Text style={estilos.textoAtualizando}>
                {MENSAGENS_DETALHES_PRODUTO.atualizando}
              </Text>
            </View>
          ) : null}

          {erro ? (
            <View style={estilos.areaErro}>
              <MensagemErro mensagem={erro} />
              <BotaoPrincipal
                titulo={MENSAGENS_DETALHES_PRODUTO.tentarNovamente}
                aoPressionar={tentarNovamente}
                carregando={carregando}
              />
            </View>
          ) : null}

          <View style={estilos.areaImagem}>
            {imagemFalhou ? (
              <View style={estilos.semImagem}>
                <Text style={estilos.textoSemImagem}>
                  {MENSAGENS_DETALHES_PRODUTO.imagemIndisponivel}
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

          <View style={estilos.areaEstoque}>
            <Text style={estilos.textoEstoque}>
              {esgotado
                ? MENSAGENS_DETALHES_PRODUTO.estoqueEsgotado
                : `${MENSAGENS_DETALHES_PRODUTO.estoqueDisponivel}: ${estoqueDisponivel}`}
            </Text>
          </View>

          <Text style={estilos.rotuloDescricao}>
            {MENSAGENS_DETALHES_PRODUTO.descricao}
          </Text>
          <Text style={estilos.descricao}>
            {produto.descricao.trim().length > 0
              ? produto.descricao
              : MENSAGENS_DETALHES_PRODUTO.descricaoVazia}
          </Text>

          {sucessoAdicao ? (
            <View style={estilos.bannerSucesso} accessibilityRole="alert">
              <Text style={estilos.textoBannerSucesso}>{sucessoAdicao}</Text>
            </View>
          ) : null}

          {erroAdicao ? <MensagemErro mensagem={erroAdicao} /> : null}

          <BotaoPrincipal
            titulo={
              esgotado
                ? MENSAGENS_DETALHES_PRODUTO.esgotado
                : MENSAGENS_DETALHES_PRODUTO.adicionarAoCarrinho
            }
            aoPressionar={() => {
              void adicionarAoCarrinho();
            }}
            carregando={adicionando}
            desabilitado={adicaoDesabilitada}
          />
        </ScrollView>
      )}
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
  estadoCentral: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  indicadorAtualizacao: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  textoAtualizando: {
    color: CORES.textoSecundario,
    fontSize: 13,
    marginLeft: 8,
  },
  areaErro: {
    marginBottom: 12,
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
    marginBottom: 16,
  },
  areaEstoque: {
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textoEstoque: {
    color: CORES.primariaEscura,
    fontSize: 14,
    fontWeight: "600",
  },
  rotuloDescricao: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  descricao: {
    color: CORES.textoSecundario,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  bannerSucesso: {
    backgroundColor: CORES.primariaClara,
    borderColor: CORES.sucesso,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textoBannerSucesso: {
    color: CORES.sucesso,
    fontSize: 13,
    fontWeight: "600",
  },
});
