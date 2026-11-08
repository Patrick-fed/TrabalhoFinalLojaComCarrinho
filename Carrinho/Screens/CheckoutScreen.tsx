import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { ItemCarrinhoCard } from "../Components/ItemCarrinhoCard";
import { MensagemErro } from "../Components/MensagemErro";
import { CORES } from "../Constants/cores";
import {
  MENSAGENS_CHECKOUT,
  ehFormaPagamentoConhecida,
  rotuloFormaPagamento,
} from "../Constants/mensagensCheckout";
import { MENSAGENS_CARRINHO } from "../Constants/mensagensCarrinho";
import { useAuth } from "../Context/AuthContext";
import { useCarrinho } from "../Context/CarrinhoContext";
import { listarFormasPagamento, registrarCompra } from "../Service/compras";
import type {
  ErroCheckout,
  FormaPagamentoDisponivel,
  SnapshotRevisao,
} from "../Types/checkout";
import type { AppStackParamList } from "../Types/navigation";
import type { Carrinho, ItemCarrinho } from "../Types/types";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type CheckoutScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "Checkout"
>;

function ehCancelamento(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "name" in erro &&
    (erro as { name?: unknown }).name === "AbortError"
  );
}

function ehErroCheckout(erro: unknown): erro is ErroCheckout {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "mensagem" in erro &&
    typeof (erro as { mensagem?: unknown }).mensagem === "string"
  );
}

function criarErro(codigo: string, mensagem: string): ErroCheckout {
  return { codigo, mensagem };
}

function chaveItem(item: ItemCarrinho): string {
  return `${item.produtoId}:${item.quantidade}:${item.subtotal}`;
}

function snapshotsIguais(
  snapshot: SnapshotRevisao | null,
  atual: Carrinho
): boolean {
  if (!snapshot) {
    return false;
  }

  if (
    snapshot.total !== atual.total ||
    snapshot.quantidadeTotal !== atual.quantidadeTotal ||
    snapshot.itens.length !== atual.itens.length
  ) {
    return false;
  }

  const esperadas = snapshot.itens.map(chaveItem).sort();
  const atuais = atual.itens.map(chaveItem).sort();

  return esperadas.every((chave, indice) => chave === atuais[indice]);
}

function montarSnapshot(carrinho: Carrinho): SnapshotRevisao {
  return {
    itens: carrinho.itens.map((item) => ({ ...item })),
    quantidadeTotal: carrinho.quantidadeTotal,
    total: carrinho.total,
  };
}

export function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const { usuario } = useAuth();
  const { carrinho, carregando, erro, recarregar, limparCarrinho } =
    useCarrinho();

  const [formasPagamento, setFormasPagamento] = useState<
    FormaPagamentoDisponivel[]
  >([]);
  const [carregandoFormas, setCarregandoFormas] = useState(true);
  const [erroFormas, setErroFormas] = useState<ErroCheckout | null>(null);
  const [formaSelecionada, setFormaSelecionada] = useState<string | null>(
    null
  );
  const [finalizando, setFinalizando] = useState(false);
  const [erroFinalizacao, setErroFinalizacao] = useState<ErroCheckout | null>(
    null
  );
  const [snapshotRevisao, setSnapshotRevisao] =
    useState<SnapshotRevisao | null>(null);
  const [avisoDivergencia, setAvisoDivergencia] = useState(false);
  const [aguardandoNovaConfirmacao, setAguardandoNovaConfirmacao] =
    useState(false);
  const [erroSelecao, setErroSelecao] = useState<string | null>(null);

  const finalizandoRef = useRef(false);
  const montadoRef = useRef(true);
  const controladorFormasRef = useRef<AbortController | null>(null);
  const controladorFinalizacaoRef = useRef<AbortController | null>(null);

  const usuarioId = usuario?.uid ?? null;

  const carregarFormas = useCallback(async (signal?: AbortSignal) => {
    setCarregandoFormas(true);
    setErroFormas(null);

    try {
      const formas = await listarFormasPagamento(signal);

      if (signal?.aborted || !montadoRef.current) {
        return;
      }

      setFormasPagamento(formas);
      setFormaSelecionada((atual) =>
        atual !== null && !formas.some((forma) => forma.id === atual)
          ? null
          : atual
      );
      setCarregandoFormas(false);
    } catch (erroFormasCarga) {
      if (
        signal?.aborted ||
        !montadoRef.current ||
        ehCancelamento(erroFormasCarga)
      ) {
        return;
      }

      setErroFormas(
        ehErroCheckout(erroFormasCarga)
          ? erroFormasCarga
          : criarErro(
              "desconhecido",
              MENSAGENS_CHECKOUT.finalizacaoFalhou
            )
      );
      setCarregandoFormas(false);
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;

    const controlador = new AbortController();
    controladorFormasRef.current = controlador;

    void carregarFormas(controlador.signal);

    void recarregar().then((dados) => {
      if (dados && montadoRef.current) {
        setSnapshotRevisao(montarSnapshot(dados));
      }
    });

    return () => {
      montadoRef.current = false;
      controlador.abort();
      controladorFinalizacaoRef.current?.abort();
      controladorFinalizacaoRef.current = null;
    };
  }, [carregarFormas, recarregar]);

  const carrinhoVazio = !carrinho || carrinho.itens.length === 0;

  const formaValida =
    formaSelecionada !== null &&
    ehFormaPagamentoConhecida(formaSelecionada) &&
    formasPagamento.some((forma) => forma.id === formaSelecionada);

  const podeFinalizar =
    !carrinhoVazio &&
    formaValida &&
    !finalizando &&
    !carregandoFormas &&
    !carregando;

  function voltar() {
    navigation.goBack();
  }

  function tentarNovamenteCarrinho() {
    void recarregar().then((dados) => {
      if (dados && montadoRef.current) {
        setSnapshotRevisao(montarSnapshot(dados));
        setErroFinalizacao(null);
        setAvisoDivergencia(false);
        setAguardandoNovaConfirmacao(false);
      }
    });
  }

  function tentarNovamenteFormas() {
    const controlador = new AbortController();
    controladorFormasRef.current = controlador;
    void carregarFormas(controlador.signal);
  }

  function selecionarForma(id: string) {
    if (finalizando || !ehFormaPagamentoConhecida(id)) {
      return;
    }

    setFormaSelecionada(id);
    setErroSelecao(null);
    setErroFinalizacao(null);
  }

  async function finalizar() {
    if (finalizandoRef.current) {
      return;
    }

    if (carrinhoVazio) {
      setErroFinalizacao(
        criarErro("desconhecido", MENSAGENS_CHECKOUT.carrinhoVazio)
      );
      return;
    }

    if (
      !formaSelecionada ||
      !ehFormaPagamentoConhecida(formaSelecionada) ||
      !formasPagamento.some((forma) => forma.id === formaSelecionada)
    ) {
      setErroSelecao(MENSAGENS_CHECKOUT.selecioneFormaPagamento);
      return;
    }

    const usuarioIdFinalizacao = usuarioId;

    if (!usuarioIdFinalizacao) {
      setErroFinalizacao(
        criarErro(
          "http_401",
          MENSAGENS_CHECKOUT.usuarioNaoIdentificado
        )
      );
      return;
    }

    finalizandoRef.current = true;
    setFinalizando(true);
    setErroFinalizacao(null);
    setErroSelecao(null);

    const controlador = new AbortController();
    controladorFinalizacaoRef.current = controlador;

    try {
      const carrinhoAtual = await recarregar();

      if (!montadoRef.current || controlador.signal.aborted) {
        return;
      }

      if (!carrinhoAtual) {
        setErroFinalizacao(
          criarErro(
            "desconhecido",
            MENSAGENS_CHECKOUT.finalizacaoFalhou
          )
        );
        return;
      }

      if (carrinhoAtual.itens.length === 0) {
        setErroFinalizacao(
          criarErro("desconhecido", MENSAGENS_CHECKOUT.carrinhoVazio)
        );
        return;
      }

      if (!snapshotsIguais(snapshotRevisao, carrinhoAtual)) {
        setSnapshotRevisao(montarSnapshot(carrinhoAtual));
        setAvisoDivergencia(true);
        setAguardandoNovaConfirmacao(true);
        return;
      }

      setAguardandoNovaConfirmacao(false);

      const compra = await registrarCompra(
        usuarioIdFinalizacao,
        formaSelecionada,
        controlador.signal
      );

      if (!montadoRef.current || controlador.signal.aborted) {
        return;
      }

      let carrinhoAtualizado = true;

      try {
        await limparCarrinho();
      } catch (erroLimpeza) {
        const jaVazio =
          ehErroCheckout(erroLimpeza) && erroLimpeza.codigo === "http_404";
        carrinhoAtualizado = jaVazio;
      }

      if (!montadoRef.current || controlador.signal.aborted) {
        return;
      }

      navigation.replace("ConfirmacaoCompra", {
        compra,
        carrinhoAtualizado,
      });
    } catch (erroFinalizacaoCompra) {
      if (
        !montadoRef.current ||
        controlador.signal.aborted ||
        ehCancelamento(erroFinalizacaoCompra)
      ) {
        return;
      }

      setErroFinalizacao(
        ehErroCheckout(erroFinalizacaoCompra)
          ? erroFinalizacaoCompra
          : criarErro(
              "desconhecido",
              MENSAGENS_CHECKOUT.finalizacaoFalhou
            )
      );
    } finally {
      finalizandoRef.current = false;

      if (montadoRef.current) {
        setFinalizando(false);
      }

      if (controladorFinalizacaoRef.current === controlador) {
        controladorFinalizacaoRef.current = null;
      }
    }
  }

  function renderizarResumo() {
    if (!carrinho) {
      return null;
    }

    return (
      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          {MENSAGENS_CHECKOUT.resumoTitulo}
        </Text>

        {carrinho.itens.map((item) => (
          <View key={String(item.produtoId)} style={estilos.areaItem}>
            <ItemCarrinhoCard
              item={item}
              operacao={null}
              somenteLeitura
              aoAumentar={() => undefined}
              aoDiminuir={() => undefined}
              aoRemover={() => undefined}
            />
          </View>
        ))}

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
        </View>
      </View>
    );
  }

  function renderizarFormasPagamento() {
    return (
      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          {MENSAGENS_CHECKOUT.formaPagamentoTitulo}
        </Text>

        {carregandoFormas ? (
          <View style={estilos.estadoCentral}>
            <ActivityIndicator color={CORES.primaria} size="small" />
            <Text style={estilos.textoEstado}>
              {MENSAGENS_CHECKOUT.carregandoFormas}
            </Text>
          </View>
        ) : null}

        {!carregandoFormas && erroFormas ? (
          <View>
            <MensagemErro mensagem={erroFormas.mensagem} />
            <BotaoPrincipal
              titulo={MENSAGENS_CHECKOUT.tentarNovamente}
              aoPressionar={tentarNovamenteFormas}
            />
          </View>
        ) : null}

        {!carregandoFormas &&
        !erroFormas &&
        formasPagamento.length === 0 ? (
          <Text style={estilos.textoEstado}>
            {MENSAGENS_CHECKOUT.formasVazias}
          </Text>
        ) : null}

        {!carregandoFormas && !erroFormas ? (
          <View>
            {formasPagamento.map((forma) => {
              const conhecida = ehFormaPagamentoConhecida(forma.id);
              const rotulo = rotuloFormaPagamento(forma.id) ?? forma.nome;
              const selecionada = formaSelecionada === forma.id;

              return (
                <Pressable
                  key={forma.id}
                  accessibilityRole="radio"
                  accessibilityLabel={rotulo}
                  accessibilityState={{
                    selected: selecionada,
                    disabled: !conhecida || finalizando,
                  }}
                  disabled={!conhecida || finalizando}
                  onPress={() => selecionarForma(forma.id)}
                  style={({ pressed }) => [
                    estilos.opcaoPagamento,
                    selecionada ? estilos.opcaoPagamentoSelecionada : null,
                    !conhecida ? estilos.opcaoPagamentoDesabilitada : null,
                    pressed && conhecida && !finalizando
                      ? estilos.opcaoPagamentoPressionada
                      : null,
                  ]}
                >
                  <View
                    style={[
                      estilos.radio,
                      selecionada ? estilos.radioSelecionado : null,
                    ]}
                  />
                  <Text
                    style={[
                      estilos.textoOpcaoPagamento,
                      !conhecida ? estilos.textoOpcaoDesabilitada : null,
                    ]}
                  >
                    {rotulo}
                  </Text>
                  {!conhecida ? (
                    <Text style={estilos.indisponivel}>
                      {MENSAGENS_CHECKOUT.formaPagamentoIndisponivel}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  }

  if (!carrinho) {
    return (
      <SafeAreaView style={estilos.container}>
        <Cabecalho aoVoltar={voltar} />

        <View style={estilos.estadoCentral}>
          {erro ? (
            <>
              <MensagemErro mensagem={erro} />
              <BotaoPrincipal
                titulo={MENSAGENS_CHECKOUT.tentarNovamente}
                aoPressionar={tentarNovamenteCarrinho}
                carregando={carregando}
              />
            </>
          ) : (
            <>
              <ActivityIndicator color={CORES.primaria} size="large" />
              <Text style={estilos.textoEstado}>
                {MENSAGENS_CHECKOUT.carregando}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho aoVoltar={voltar} />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {erro ? (
          <View style={estilos.areaErro}>
            <MensagemErro mensagem={erro} />
            <BotaoPrincipal
              titulo={MENSAGENS_CHECKOUT.tentarNovamente}
              aoPressionar={tentarNovamenteCarrinho}
              carregando={carregando}
            />
          </View>
        ) : null}

        {carrinhoVazio ? (
          <View style={estilos.areaErro}>
            <MensagemErro mensagem={MENSAGENS_CHECKOUT.carrinhoVazio} />
          </View>
        ) : null}

        {renderizarResumo()}
        {renderizarFormasPagamento()}

        {avisoDivergencia && aguardandoNovaConfirmacao ? (
          <View style={estilos.avisoDivergencia}>
            <Text style={estilos.textoAvisoDivergencia}>
              {MENSAGENS_CHECKOUT.avisoDivergencia}
            </Text>
          </View>
        ) : null}

        {erroSelecao ? (
          <View style={estilos.areaErro}>
            <MensagemErro mensagem={erroSelecao} />
          </View>
        ) : null}

        {erroFinalizacao ? (
          <View style={estilos.areaErro}>
            <MensagemErro mensagem={erroFinalizacao.mensagem} />
          </View>
        ) : null}
      </ScrollView>

      <View style={estilos.rodape}>
        <BotaoPrincipal
          titulo={MENSAGENS_CARRINHO.finalizarCompra}
          aoPressionar={() => {
            void finalizar();
          }}
          carregando={finalizando}
          desabilitado={!podeFinalizar}
        />
      </View>
    </SafeAreaView>
  );
}

type CabecalhoProps = {
  aoVoltar: () => void;
};

function Cabecalho({ aoVoltar }: CabecalhoProps) {
  return (
    <View style={estilos.cabecalho}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MENSAGENS_CHECKOUT.voltar}
        onPress={aoVoltar}
        style={({ pressed }) => [
          estilos.botaoCabecalho,
          pressed ? estilos.botaoCabecalhoPressionado : null,
        ]}
      >
        <Text style={estilos.textoBotaoCabecalho}>
          {MENSAGENS_CHECKOUT.voltar}
        </Text>
      </Pressable>

      <Text style={estilos.tituloCabecalho}>
        {MENSAGENS_CHECKOUT.titulo}
      </Text>

      <View style={estilos.espacoCabecalho} />
    </View>
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
  textoBotaoCabecalho: {
    color: CORES.primaria,
    fontSize: 15,
    fontWeight: "700",
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
  conteudo: {
    padding: 16,
    paddingBottom: 32,
  },
  secao: {
    marginBottom: 8,
  },
  tituloSecao: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  areaItem: {
    marginBottom: 12,
  },
  resumo: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
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
  estadoCentral: {
    alignItems: "center",
    paddingVertical: 16,
  },
  textoEstado: {
    color: CORES.textoSecundario,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  areaErro: {
    marginBottom: 16,
  },
  opcaoPagamento: {
    alignItems: "center",
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  opcaoPagamentoSelecionada: {
    borderColor: CORES.primaria,
    borderWidth: 2,
  },
  opcaoPagamentoDesabilitada: {
    opacity: 0.55,
  },
  opcaoPagamentoPressionada: {
    backgroundColor: CORES.primariaClara,
  },
  radio: {
    borderColor: CORES.textoSecundario,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginRight: 12,
    width: 20,
  },
  radioSelecionado: {
    backgroundColor: CORES.primaria,
    borderColor: CORES.primaria,
  },
  textoOpcaoPagamento: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "600",
  },
  textoOpcaoDesabilitada: {
    color: CORES.textoSecundario,
  },
  indisponivel: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginLeft: "auto",
  },
  avisoDivergencia: {
    backgroundColor: CORES.primariaClara,
    borderColor: CORES.primaria,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  textoAvisoDivergencia: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  rodape: {
    backgroundColor: CORES.branco,
    borderTopColor: CORES.borda,
    borderTopWidth: 1,
    padding: 16,
  },
});
