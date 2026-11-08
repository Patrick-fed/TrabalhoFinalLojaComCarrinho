import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { ItemCarrinhoCard } from "../Components/ItemCarrinhoCard";
import { MensagemErro } from "../Components/MensagemErro";
import { ModalConfirmacao } from "../Components/ModalConfirmacao";
import { CORES } from "../Constants/cores";
import { MENSAGENS_CARRINHO } from "../Constants/mensagensCarrinho";
import { useCarrinho } from "../Context/CarrinhoContext";
import { listarProdutos } from "../Service/catalogo";
import type { OperacaoCarrinho } from "../Types/carrinho";
import type { AppStackParamList } from "../Types/navigation";
import type { ItemCarrinho } from "../Types/types";
import { obterMensagemDeErro } from "../Utils/erros";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type CarrinhoScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "Carrinho"
>;

type CabecalhoProps = {
  operacao: OperacaoCarrinho | null;
  quantidadeItens: number;
  aoVoltar: () => void;
  aoLimpar: () => void;
};

function Cabecalho({
  operacao,
  quantidadeItens,
  aoVoltar,
  aoLimpar,
}: CabecalhoProps) {
  const podeLimpar = quantidadeItens > 0 && operacao === null;

  return (
    <View style={estilos.cabecalho}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MENSAGENS_CARRINHO.voltar}
        onPress={aoVoltar}
        style={({ pressed }) => [
          estilos.botaoCabecalho,
          pressed ? estilos.botaoCabecalhoPressionado : null,
        ]}
      >
        <Text style={estilos.textoBotaoCabecalho}>
          {MENSAGENS_CARRINHO.voltar}
        </Text>
      </Pressable>

      <Text style={estilos.tituloCabecalho}>Carrinho</Text>

      {quantidadeItens > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={MENSAGENS_CARRINHO.limparCarrinho}
          accessibilityState={{ disabled: !podeLimpar }}
          disabled={!podeLimpar}
          onPress={aoLimpar}
          style={({ pressed }) => [
            estilos.botaoCabecalho,
            !podeLimpar ? estilos.botaoCabecalhoDesabilitado : null,
            pressed && podeLimpar
              ? estilos.botaoCabecalhoPressionado
              : null,
          ]}
        >
          <Text style={estilos.textoBotaoLimpar}>
            {MENSAGENS_CARRINHO.limparCarrinho}
          </Text>
        </Pressable>
      ) : (
        <View style={estilos.espacoCabecalho} />
      )}
    </View>
  );
}

export function CarrinhoScreen({ navigation }: CarrinhoScreenProps) {
  const {
    carrinho,
    carregando,
    erro,
    operacao,
    recarregar,
    alterarQuantidade,
    removerItem,
    limparCarrinho,
  } = useCarrinho();

  const [erroOperacao, setErroOperacao] = useState<string | null>(null);
  const [modalLimpezaVisivel, setModalLimpezaVisivel] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [estoques, setEstoques] = useState<Record<number, number>>({});

  const quantidadeItens = carrinho?.itens.length ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    async function carregarEstoques() {
      try {
        const produtos = await listarProdutos(
          { busca: "", categoria: null },
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        const mapa: Record<number, number> = {};

        for (const produto of produtos) {
          mapa[produto.id] = produto.estoque;
        }

        setEstoques(mapa);
      } catch {
        // Estoque é complementar; falha de leitura não impede o carrinho.
      }
    }

    void carregarEstoques();

    return () => controller.abort();
  }, []);

  function voltar() {
    navigation.goBack();
  }

  async function executarAcao(acao: () => Promise<void>) {
    if (operacao !== null) {
      return;
    }

    setErroOperacao(null);

    try {
      await acao();
    } catch (erroAcao) {
      setErroOperacao(obterMensagemDeErro(erroAcao));
    }
  }

  function aumentarQuantidade(item: ItemCarrinho) {
    const estoque = estoques[item.produtoId];

    if (
      typeof estoque === "number" &&
      (estoque <= 0 || item.quantidade >= estoque)
    ) {
      setErroOperacao(MENSAGENS_CARRINHO.estoqueLimiteMensagem);
      return;
    }

    void executarAcao(() =>
      alterarQuantidade(item.produtoId, item.quantidade + 1)
    );
  }

  function diminuirQuantidade(item: ItemCarrinho) {
    if (item.quantidade <= 1) {
      return;
    }

    void executarAcao(() =>
      alterarQuantidade(item.produtoId, item.quantidade - 1)
    );
  }

  function remover(item: ItemCarrinho) {
    void executarAcao(() => removerItem(item.produtoId));
  }

  function abrirConfirmacaoLimpeza() {
    if (operacao !== null || quantidadeItens === 0) {
      return;
    }

    setErroOperacao(null);
    setModalLimpezaVisivel(true);
  }

  function cancelarLimpeza() {
    if (limpando) {
      return;
    }

    setModalLimpezaVisivel(false);
  }

  async function confirmarLimpeza() {
    if (limpando) {
      return;
    }

    setLimpando(true);
    setErroOperacao(null);

    try {
      await limparCarrinho();
      setModalLimpezaVisivel(false);
    } catch (erroLimpeza) {
      setModalLimpezaVisivel(false);
      setErroOperacao(obterMensagemDeErro(erroLimpeza));
    } finally {
      setLimpando(false);
    }
  }

  if (!carrinho) {
    return (
      <SafeAreaView style={estilos.container}>
        <Cabecalho
          operacao={operacao}
          quantidadeItens={0}
          aoVoltar={voltar}
          aoLimpar={abrirConfirmacaoLimpeza}
        />

        <View style={estilos.estadoCentral}>
          {erro ? (
            <>
              <MensagemErro mensagem={erro} />
              <BotaoPrincipal
                titulo={MENSAGENS_CARRINHO.tentarNovamente}
                aoPressionar={() => {
                  void recarregar();
                }}
                carregando={carregando}
              />
            </>
          ) : (
            <>
              <ActivityIndicator color={CORES.primaria} size="large" />
              <Text style={estilos.textoCarregando}>
                {MENSAGENS_CARRINHO.carregando}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        operacao={operacao}
        quantidadeItens={quantidadeItens}
        aoVoltar={voltar}
        aoLimpar={abrirConfirmacaoLimpeza}
      />

      <FlatList
        data={carrinho.itens}
        keyExtractor={(item) => String(item.produtoId)}
        renderItem={({ item }) => (
          <ItemCarrinhoCard
            item={item}
            operacao={operacao}
            estoque={estoques[item.produtoId]}
            aoAumentar={aumentarQuantidade}
            aoDiminuir={diminuirQuantidade}
            aoRemover={remover}
          />
        )}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
        contentContainerStyle={estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {erroOperacao ? <MensagemErro mensagem={erroOperacao} /> : null}

            {carregando ? (
              <View style={estilos.indicadorAtualizacao}>
                <ActivityIndicator color={CORES.primaria} size="small" />
                <Text style={estilos.textoAtualizando}>
                  {MENSAGENS_CARRINHO.carregando}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={estilos.estadoVazio}>
            <Text style={estilos.textoVazio}>
              {MENSAGENS_CARRINHO.vazio}
            </Text>
            <View style={estilos.areaBotaoVazio}>
              <BotaoPrincipal
                titulo={MENSAGENS_CARRINHO.voltarAoCatalogo}
                aoPressionar={voltar}
              />
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={estilos.resumo}>
            <View style={estilos.linhaResumo}>
              <Text style={estilos.labelResumo}>
                {MENSAGENS_CARRINHO.quantidadeTotal}
              </Text>
              <Text style={estilos.valorResumo}>
                {carrinho.quantidadeTotal}
              </Text>
            </View>

            <View style={estilos.linhaResumo}>
              <Text style={estilos.labelResumo}>
                {MENSAGENS_CARRINHO.total}
              </Text>
              <Text style={estilos.totalResumo}>
                {formatarPrecoCentavos(carrinho.total)}
              </Text>
            </View>

            {quantidadeItens > 0 ? (
              <View style={estilos.areaFinalizar}>
                <BotaoPrincipal
                  titulo={MENSAGENS_CARRINHO.finalizarCompra}
                  aoPressionar={() => navigation.navigate("Checkout")}
                  desabilitado={operacao !== null}
                />
              </View>
            ) : null}
          </View>
        }
      />

      <ModalConfirmacao
        visivel={modalLimpezaVisivel}
        titulo={MENSAGENS_CARRINHO.confirmarLimpezaTitulo}
        mensagem={MENSAGENS_CARRINHO.confirmarLimpezaMensagem}
        textoConfirmar={MENSAGENS_CARRINHO.confirmar}
        textoCancelar={MENSAGENS_CARRINHO.cancelar}
        aoConfirmar={() => {
          void confirmarLimpeza();
        }}
        aoCancelar={cancelarLimpeza}
        carregando={limpando}
      />
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
    paddingHorizontal: 12,
  },
  botaoCabecalho: {
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  botaoCabecalhoPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  botaoCabecalhoDesabilitado: {
    opacity: 0.45,
  },
  textoBotaoCabecalho: {
    color: CORES.primaria,
    fontSize: 15,
    fontWeight: "700",
  },
  textoBotaoLimpar: {
    color: CORES.erro,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  tituloCabecalho: {
    color: CORES.texto,
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  espacoCabecalho: {
    minWidth: 72,
  },
  listaConteudo: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  separador: {
    height: 12,
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
  estadoCentral: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  textoCarregando: {
    color: CORES.textoSecundario,
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  estadoVazio: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  textoVazio: {
    color: CORES.textoSecundario,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  areaBotaoVazio: {
    maxWidth: 320,
    width: "100%",
  },
  resumo: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  linhaResumo: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelResumo: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  valorResumo: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },
  totalResumo: {
    color: CORES.primaria,
    fontSize: 22,
    fontWeight: "700",
  },
  areaFinalizar: {
    marginTop: 12,
  },
});
