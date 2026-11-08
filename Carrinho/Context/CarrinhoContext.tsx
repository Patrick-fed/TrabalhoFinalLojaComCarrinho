import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { MENSAGENS_ERRO_CARRINHO } from "../Constants/mensagensCarrinho";
import {
  adicionarItem as adicionarItemNoServico,
  atualizarQuantidade as atualizarQuantidadeNoServico,
  buscarCarrinho,
  limparCarrinho as limparCarrinhoNoServico,
  removerItem as removerItemNoServico,
} from "../Service/carrinho";
import type { ErroCarrinho, OperacaoCarrinho } from "../Types/carrinho";
import type { Carrinho } from "../Types/types";
import { obterMensagemDeErro } from "../Utils/erros";
import { useAuth } from "./AuthContext";

type CarrinhoContextValue = {
  carrinho: Carrinho | null;
  carregando: boolean;
  erro: string | null;
  operacao: OperacaoCarrinho | null;
  recarregar: () => Promise<Carrinho | null>;
  adicionarProduto: (produtoId: number, quantidade?: number) => Promise<void>;
  alterarQuantidade: (produtoId: number, quantidade: number) => Promise<void>;
  removerItem: (produtoId: number) => Promise<void>;
  limparCarrinho: () => Promise<void>;
};

const CarrinhoContext = createContext<CarrinhoContextValue | undefined>(
  undefined
);

type CarrinhoProviderProps = {
  children: ReactNode;
};

function criarErro(codigo: string, mensagem: string): ErroCarrinho {
  return { codigo, mensagem };
}

function ehCancelamento(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "name" in erro &&
    (erro as { name?: unknown }).name === "AbortError"
  );
}

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  const { usuario } = useAuth();
  const uid = usuario?.uid ?? null;

  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [operacao, setOperacao] = useState<OperacaoCarrinho | null>(null);

  const uidRef = useRef<string | null>(uid);
  const sessaoRef = useRef(0);
  const requisicaoRef = useRef(0);
  const operacaoAtivaRef = useRef(false);
  const controladorCargaRef = useRef<AbortController | null>(null);
  const controladorMutacaoRef = useRef<AbortController | null>(null);

  const carregarCarrinho = useCallback(
    async (
      usuarioId: string,
      sessao: number
    ): Promise<Carrinho | null> => {
      const requisicaoId = ++requisicaoRef.current;

      controladorCargaRef.current?.abort();
      const controller = new AbortController();
      controladorCargaRef.current = controller;

      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscarCarrinho(usuarioId, controller.signal);

        if (
          controller.signal.aborted ||
          sessao !== sessaoRef.current ||
          requisicaoId !== requisicaoRef.current ||
          usuarioId !== uidRef.current
        ) {
          return null;
        }

        setCarrinho(dados);
        setErro(null);
        return dados;
      } catch (erroCarga) {
        if (
          controller.signal.aborted ||
          ehCancelamento(erroCarga) ||
          sessao !== sessaoRef.current ||
          requisicaoId !== requisicaoRef.current ||
          usuarioId !== uidRef.current
        ) {
          return null;
        }

        setErro(obterMensagemDeErro(erroCarga));
        return null;
      } finally {
        if (
          !controller.signal.aborted &&
          sessao === sessaoRef.current &&
          requisicaoId === requisicaoRef.current &&
          usuarioId === uidRef.current
        ) {
          setCarregando(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    uidRef.current = uid;
    sessaoRef.current += 1;
    requisicaoRef.current += 1;
    operacaoAtivaRef.current = false;

    controladorCargaRef.current?.abort();
    controladorMutacaoRef.current?.abort();
    controladorCargaRef.current = null;
    controladorMutacaoRef.current = null;

    setCarrinho(null);
    setErro(null);
    setOperacao(null);
    setCarregando(false);

    if (uid) {
      void carregarCarrinho(uid, sessaoRef.current);
    }

    return () => {
      controladorCargaRef.current?.abort();
      controladorMutacaoRef.current?.abort();
    };
  }, [uid, carregarCarrinho]);

  const recarregar = useCallback(async (): Promise<Carrinho | null> => {
    const usuarioId = uidRef.current;

    if (!usuarioId || operacaoAtivaRef.current) {
      return null;
    }

    return carregarCarrinho(usuarioId, sessaoRef.current);
  }, [carregarCarrinho]);

  const executarOperacao = useCallback(
    async (
      tipo: OperacaoCarrinho["tipo"],
      produtoId: number | undefined,
      acao: (usuarioId: string, signal: AbortSignal) => Promise<Carrinho>
    ) => {
      const usuarioId = uidRef.current;

      if (!usuarioId) {
        throw criarErro("http_401", MENSAGENS_ERRO_CARRINHO.http401);
      }

      if (operacaoAtivaRef.current) {
        return;
      }

      operacaoAtivaRef.current = true;
      const sessao = sessaoRef.current;

      controladorCargaRef.current?.abort();
      setCarregando(false);
      setOperacao({ tipo, produtoId });

      const controller = new AbortController();
      controladorMutacaoRef.current = controller;

      try {
        const dados = await acao(usuarioId, controller.signal);

        if (
          controller.signal.aborted ||
          sessao !== sessaoRef.current ||
          usuarioId !== uidRef.current
        ) {
          return;
        }

        setCarrinho(dados);
        setErro(null);
      } catch (erroOperacao) {
        if (
          controller.signal.aborted ||
          ehCancelamento(erroOperacao) ||
          sessao !== sessaoRef.current ||
          usuarioId !== uidRef.current
        ) {
          return;
        }

        throw erroOperacao;
      } finally {
        if (
          sessao === sessaoRef.current &&
          usuarioId === uidRef.current
        ) {
          operacaoAtivaRef.current = false;
          setOperacao(null);
        }
      }
    },
    []
  );

  const adicionarProduto = useCallback(
    async (produtoId: number, quantidade = 1) => {
      await executarOperacao("adicionar", produtoId, (usuarioId, signal) =>
        adicionarItemNoServico(usuarioId, produtoId, quantidade, signal)
      );
    },
    [executarOperacao]
  );

  const alterarQuantidade = useCallback(
    async (produtoId: number, quantidade: number) => {
      await executarOperacao("alterar", produtoId, (usuarioId, signal) =>
        atualizarQuantidadeNoServico(usuarioId, produtoId, quantidade, signal)
      );
    },
    [executarOperacao]
  );

  const removerItem = useCallback(
    async (produtoId: number) => {
      await executarOperacao("remover", produtoId, (usuarioId, signal) =>
        removerItemNoServico(usuarioId, produtoId, signal)
      );
    },
    [executarOperacao]
  );

  const limparCarrinho = useCallback(async () => {
    await executarOperacao("limpar", undefined, (usuarioId, signal) =>
      limparCarrinhoNoServico(usuarioId, signal)
    );
  }, [executarOperacao]);

  const valor = useMemo(
    () => ({
      carrinho,
      carregando,
      erro,
      operacao,
      recarregar,
      adicionarProduto,
      alterarQuantidade,
      removerItem,
      limparCarrinho,
    }),
    [
      carrinho,
      carregando,
      erro,
      operacao,
      recarregar,
      adicionarProduto,
      alterarQuantidade,
      removerItem,
      limparCarrinho,
    ]
  );

  return (
    <CarrinhoContext.Provider value={valor}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho(): CarrinhoContextValue {
  const contexto = useContext(CarrinhoContext);

  if (!contexto) {
    throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider.");
  }

  return contexto;
}
