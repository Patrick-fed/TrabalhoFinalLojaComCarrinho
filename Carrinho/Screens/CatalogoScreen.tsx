import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { CampoTexto } from "../Components/CampoTexto";
import { CartaoProduto } from "../Components/CartaoProduto";
import { MensagemErro } from "../Components/MensagemErro";
import { SeletorCategorias } from "../Components/SeletorCategorias";
import { CORES } from "../Constants/cores";
import { MENSAGENS_CARRINHO } from "../Constants/mensagensCarrinho";
import { MENSAGENS_CATALOGO } from "../Constants/mensagensCatalogo";
import { useAuth } from "../Context/AuthContext";
import { useCarrinho } from "../Context/CarrinhoContext";
import { listarCategorias, listarProdutos } from "../Service/catalogo";
import type { CategoriaDisponivel } from "../Types/catalogo";
import type { AppStackParamList } from "../Types/navigation";
import type { Categoria, Produto } from "../Types/types";
import { obterMensagemDeErro } from "../Utils/erros";
import { CarregandoScreen } from "./CarregandoScreen";

type CatalogoScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "Catalogo"
>;

type CabecalhoProps = {
  email: string;
  saindo: boolean;
  erroLogout: string | null;
  quantidadeCarrinho: number;
  aoSair: () => void;
  aoAbrirCarrinho: () => void;
};

function Cabecalho({
  email,
  saindo,
  erroLogout,
  quantidadeCarrinho,
  aoSair,
  aoAbrirCarrinho,
}: CabecalhoProps) {
  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.cabecalhoLinha}>
        <View style={estilos.cabecalhoTexto}>
          <Text style={estilos.titulo}>Loja Virtual</Text>
          <Text style={estilos.email} numberOfLines={1}>
            {email}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${MENSAGENS_CARRINHO.carrinho}, ${quantidadeCarrinho} itens`}
          onPress={aoAbrirCarrinho}
          style={({ pressed }) => [
            estilos.botaoCarrinho,
            pressed ? estilos.botaoCarrinhoPressionado : null,
          ]}
        >
          <Text style={estilos.textoBotaoCarrinho}>
            {MENSAGENS_CARRINHO.carrinho}
          </Text>
          <View style={estilos.badgeCarrinho}>
            <Text style={estilos.textoBadgeCarrinho}>{quantidadeCarrinho}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          accessibilityState={{ disabled: saindo, busy: saindo }}
          disabled={saindo}
          onPress={aoSair}
          style={({ pressed }) => [
            estilos.botaoSair,
            pressed && !saindo ? estilos.botaoSairPressionado : null,
          ]}
        >
          {saindo ? (
            <ActivityIndicator color={CORES.primaria} size="small" />
          ) : (
            <Text style={estilos.textoBotaoSair}>Sair</Text>
          )}
        </Pressable>
      </View>

      {erroLogout ? (
        <View style={estilos.erroLogout}>
          <MensagemErro mensagem={erroLogout} />
        </View>
      ) : null}
    </View>
  );
}

export function CatalogoScreen({ navigation }: CatalogoScreenProps) {
  const { usuario, sair } = useAuth();
  const { carrinho, operacao, adicionarProduto } = useCarrinho();

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<Categoria | null>(null);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDisponivel[]>([]);

  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  const [produtosCarregados, setProdutosCarregados] = useState(false);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  const [erroCategorias, setErroCategorias] = useState<string | null>(null);

  const [tentativaProdutos, setTentativaProdutos] = useState(0);
  const [tentativaCategorias, setTentativaCategorias] = useState(0);

  const [saindo, setSaindo] = useState(false);
  const [erroLogout, setErroLogout] = useState<string | null>(null);
  const [abrindoDetalhes, setAbrindoDetalhes] = useState(false);
  const [erroAdicao, setErroAdicao] = useState<string | null>(null);
  const [sucessoAdicao, setSucessoAdicao] = useState<string | null>(null);

  const jaCarregouProdutosRef = useRef(false);
  const requisicaoProdutosRef = useRef(0);
  const requisicaoCategoriasRef = useRef(0);
  const navegacaoRef = useRef(false);
  const timerSucessoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quantidadeCarrinho = carrinho?.quantidadeTotal ?? 0;
  const adicaoDesabilitada = operacao !== null;

  const quantidadesNoCarrinho: Record<number, number> = {};

  for (const item of carrinho?.itens ?? []) {
    quantidadesNoCarrinho[item.produtoId] = item.quantidade;
  }

  useEffect(() => {
    const termo = busca.trim();

    if (termo === buscaAplicada) {
      return;
    }

    const timer = setTimeout(() => {
      setBuscaAplicada(termo);
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, buscaAplicada]);

  useEffect(() => {
    const requisicaoId = ++requisicaoProdutosRef.current;
    const controller = new AbortController();
    const primeiraCarga = !jaCarregouProdutosRef.current;

    if (primeiraCarga) {
      setCarregandoInicial(true);
    } else {
      setAtualizando(true);
    }

    setErroProdutos(null);

    async function carregar() {
      try {
        const lista = await listarProdutos(
          {
            busca: buscaAplicada,
            categoria: categoriaSelecionada,
          },
          controller.signal
        );

        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoProdutosRef.current
        ) {
          return;
        }

        jaCarregouProdutosRef.current = true;
        setProdutosCarregados(true);
        setProdutos(lista);
        setErroProdutos(null);
      } catch (erro) {
        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoProdutosRef.current
        ) {
          return;
        }

        setErroProdutos(obterMensagemDeErro(erro));
      } finally {
        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoProdutosRef.current
        ) {
          return;
        }

        setCarregandoInicial(false);
        setAtualizando(false);
      }
    }

    void carregar();

    return () => controller.abort();
  }, [buscaAplicada, categoriaSelecionada, tentativaProdutos]);

  useEffect(() => {
    const requisicaoId = ++requisicaoCategoriasRef.current;
    const controller = new AbortController();

    setCarregandoCategorias(true);
    setErroCategorias(null);

    async function carregar() {
      try {
        const lista = await listarCategorias(controller.signal);

        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoCategoriasRef.current
        ) {
          return;
        }

        setCategorias(lista);
      } catch (erro) {
        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoCategoriasRef.current
        ) {
          return;
        }

        setErroCategorias(obterMensagemDeErro(erro));
      } finally {
        if (
          controller.signal.aborted ||
          requisicaoId !== requisicaoCategoriasRef.current
        ) {
          return;
        }

        setCarregandoCategorias(false);
      }
    }

    void carregar();

    return () => controller.abort();
  }, [tentativaCategorias]);

  useFocusEffect(
    useCallback(() => {
      navegacaoRef.current = false;
      setAbrindoDetalhes(false);

      return undefined;
    }, [])
  );

  useEffect(() => {
    return () => {
      if (timerSucessoRef.current) {
        clearTimeout(timerSucessoRef.current);
      }
    };
  }, []);

  function abrirCarrinho() {
    navigation.navigate("Carrinho");
  }

  async function adicionarProdutoAoCarrinho(produto: Produto) {
    if (operacao !== null || produto.estoque <= 0) {
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
      setSucessoAdicao(MENSAGENS_CARRINHO.adicionado);
      timerSucessoRef.current = setTimeout(() => {
        setSucessoAdicao(null);
        timerSucessoRef.current = null;
      }, 2500);
    } catch (erro) {
      setErroAdicao(obterMensagemDeErro(erro));
    }
  }

  function tentarNovamenteProdutos() {
    if (carregandoInicial || atualizando) {
      return;
    }

    setTentativaProdutos((valor) => valor + 1);
  }

  function tentarNovamenteCategorias() {
    if (carregandoCategorias) {
      return;
    }

    setTentativaCategorias((valor) => valor + 1);
  }

  function limparBusca() {
    setBusca("");
    setBuscaAplicada("");
  }

  function limparFiltros() {
    setBusca("");
    setBuscaAplicada("");
    setCategoriaSelecionada(null);
  }

  function abrirDetalhes(produto: Produto) {
    if (navegacaoRef.current) {
      return;
    }

    navegacaoRef.current = true;
    setAbrindoDetalhes(true);
    navigation.navigate("DetalhesProduto", { produto });
  }

  async function aoSair() {
    if (saindo) {
      return;
    }

    setSaindo(true);
    setErroLogout(null);

    try {
      await sair();
    } catch (erro) {
      setErroLogout(obterMensagemDeErro(erro));
    } finally {
      setSaindo(false);
    }
  }

  const temFiltros =
    buscaAplicada.length > 0 || categoriaSelecionada !== null;

  const nomeCategoriaSelecionada = categoriaSelecionada
    ? categorias.find((categoria) => categoria.id === categoriaSelecionada)
        ?.nome ?? categoriaSelecionada
    : null;

  const resumoFiltros = [
    buscaAplicada ? `Busca: "${buscaAplicada}"` : null,
    nomeCategoriaSelecionada ? `Categoria: ${nomeCategoriaSelecionada}` : null,
  ]
    .filter((item): item is string => item !== null)
    .join(" • ");

  function obterMensagemVazio(): string {
    if (buscaAplicada && categoriaSelecionada) {
      return MENSAGENS_CATALOGO.semResultados;
    }

    if (buscaAplicada) {
      return MENSAGENS_CATALOGO.semResultadosBusca;
    }

    if (categoriaSelecionada) {
      return MENSAGENS_CATALOGO.semResultadosCategoria;
    }

    return MENSAGENS_CATALOGO.vazio;
  }

  const email = usuario?.email ?? "E-mail não disponível";

  if (carregandoInicial) {
    return <CarregandoScreen />;
  }

  if (!produtosCarregados && erroProdutos) {
    return (
      <SafeAreaView style={estilos.container}>
        <Cabecalho
          email={email}
          saindo={saindo}
          erroLogout={erroLogout}
          quantidadeCarrinho={quantidadeCarrinho}
          aoSair={() => {
            void aoSair();
          }}
          aoAbrirCarrinho={abrirCarrinho}
        />

        <View style={estilos.estadoCentral}>
          <MensagemErro mensagem={erroProdutos} />
          <BotaoPrincipal
            titulo={MENSAGENS_CATALOGO.tentarNovamente}
            aoPressionar={tentarNovamenteProdutos}
            carregando={carregandoInicial}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        email={email}
        saindo={saindo}
        erroLogout={erroLogout}
        quantidadeCarrinho={quantidadeCarrinho}
        aoSair={() => {
          void aoSair();
        }}
        aoAbrirCarrinho={abrirCarrinho}
      />

      <FlatList
        data={produtos}
        keyExtractor={(produto) => String(produto.id)}
        renderItem={({ item }) => (
          <CartaoProduto
            produto={item}
            quantidadeNoCarrinho={quantidadesNoCarrinho[item.id] ?? 0}
            aoPressionar={abrirDetalhes}
            aoAdicionar={(produto) => {
              void adicionarProdutoAoCarrinho(produto);
            }}
            adicionando={
              operacao?.tipo === "adicionar" &&
              operacao.produtoId === item.id
            }
            adicaoDesabilitada={adicaoDesabilitada}
            desabilitado={abrindoDetalhes}
          />
        )}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.listaConteudo}
        ListHeaderComponent={
          <View style={estilos.filtros}>
            {sucessoAdicao ? (
              <View style={estilos.bannerSucesso}>
                <Text style={estilos.textoBannerSucesso}>{sucessoAdicao}</Text>
              </View>
            ) : null}

            {erroAdicao ? (
              <View style={estilos.bannerErro}>
                <MensagemErro mensagem={erroAdicao} />
              </View>
            ) : null}

            <CampoTexto
              label="Buscar produtos"
              valor={busca}
              aoMudar={setBusca}
              placeholder="Digite o nome do produto"
              returnKeyType="search"
            />

            {busca.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={limparBusca}
                style={estilos.acaoLimparBusca}
              >
                <Text style={estilos.textoAcao}>
                  {MENSAGENS_CATALOGO.limparBusca}
                </Text>
              </Pressable>
            ) : null}

            <SeletorCategorias
              categorias={categorias}
              selecionada={categoriaSelecionada}
              aoSelecionar={setCategoriaSelecionada}
              carregando={carregandoCategorias}
              erro={erroCategorias}
              aoTentarNovamente={tentarNovamenteCategorias}
            />

            {temFiltros ? (
              <View style={estilos.resumoFiltros}>
                <Text style={estilos.textoResumo}>{resumoFiltros}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={limparFiltros}
                  style={estilos.acaoLimparFiltros}
                >
                  <Text style={estilos.textoAcao}>
                    {MENSAGENS_CATALOGO.limparFiltros}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {erroProdutos ? (
              <View style={estilos.areaErroProdutos}>
                <MensagemErro mensagem={erroProdutos} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: atualizando,
                    busy: atualizando,
                  }}
                  disabled={atualizando}
                  onPress={tentarNovamenteProdutos}
                  style={({ pressed }) => [
                    estilos.botaoTentarNovamente,
                    pressed && !atualizando
                      ? estilos.botaoTentarNovamentePressionado
                      : null,
                  ]}
                >
                  <Text style={estilos.textoBotaoTentarNovamente}>
                    {MENSAGENS_CATALOGO.tentarNovamente}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {atualizando ? (
              <View style={estilos.indicadorAtualizacao}>
                <ActivityIndicator color={CORES.primaria} size="small" />
                <Text style={estilos.textoAtualizando}>
                  {MENSAGENS_CATALOGO.atualizando}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          atualizando ? undefined : (
            <View style={estilos.estadoVazio}>
              <Text style={estilos.textoVazio}>{obterMensagemVazio()}</Text>
            </View>
          )
        }
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
    backgroundColor: CORES.branco,
    borderBottomColor: CORES.borda,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cabecalhoLinha: {
    flexDirection: "row",
  },
  cabecalhoTexto: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
  },
  titulo: {
    color: CORES.primaria,
    fontSize: 20,
    fontWeight: "700",
  },
  email: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginTop: 2,
  },
  botaoSair: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: CORES.primaria,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botaoSairPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoBotaoSair: {
    color: CORES.primaria,
    fontSize: 14,
    fontWeight: "700",
  },
  botaoCarrinho: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: CORES.primaria,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginRight: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  botaoCarrinhoPressionado: {
    backgroundColor: CORES.primariaEscura,
  },
  textoBotaoCarrinho: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeCarrinho: {
    alignItems: "center",
    backgroundColor: CORES.branco,
    borderRadius: 10,
    justifyContent: "center",
    marginLeft: 6,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  textoBadgeCarrinho: {
    color: CORES.primaria,
    fontSize: 12,
    fontWeight: "700",
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
  bannerErro: {
    marginBottom: 12,
  },
  erroLogout: {
    marginTop: 8,
  },
  listaConteudo: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  filtros: {
    marginBottom: 8,
  },
  acaoLimparBusca: {
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: -8,
    paddingVertical: 4,
  },
  acaoLimparFiltros: {
    paddingVertical: 4,
  },
  resumoFiltros: {
    alignItems: "center",
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textoResumo: {
    color: CORES.texto,
    flex: 1,
    fontSize: 13,
    paddingRight: 12,
  },
  textoAcao: {
    color: CORES.primaria,
    fontSize: 13,
    fontWeight: "700",
  },
  areaErroProdutos: {
    marginBottom: 16,
  },
  botaoTentarNovamente: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: CORES.primaria,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botaoTentarNovamentePressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoBotaoTentarNovamente: {
    color: CORES.primaria,
    fontSize: 13,
    fontWeight: "700",
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
  separador: {
    height: 12,
  },
  estadoVazio: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  textoVazio: {
    color: CORES.textoSecundario,
    fontSize: 15,
    textAlign: "center",
  },
  estadoCentral: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
