import { API_KEY } from "../Config/apiConfig";
import { MENSAGENS_ERRO_CARRINHO } from "../Constants/mensagensCarrinho";
import type { ErroCarrinho } from "../Types/carrinho";
import type { Carrinho, ItemCarrinho } from "../Types/types";
import { ROTAS } from "./rotas";

type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE";

type OpcoesRequisicao = {
  method: MetodoHttp;
  body?: unknown;
  signal?: AbortSignal;
};

function criarErro(codigo: string, mensagem: string): ErroCarrinho {
  return { codigo, mensagem };
}

function erroRespostaInvalida(): ErroCarrinho {
  return criarErro(
    "resposta_invalida",
    MENSAGENS_ERRO_CARRINHO.respostaInvalida
  );
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehNumeroFinito(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

function ehCancelamento(erro: unknown): boolean {
  return (
    ehRegistro(erro) &&
    "name" in erro &&
    (erro as { name?: unknown }).name === "AbortError"
  );
}

function erroPorStatus(status: number): ErroCarrinho {
  if (status === 400) {
    return criarErro("http_400", MENSAGENS_ERRO_CARRINHO.http400);
  }

  if (status === 409 || status === 422) {
    return criarErro("estoque", MENSAGENS_ERRO_CARRINHO.estoque);
  }

  if (status === 401 || status === 403) {
    return criarErro("http_401", MENSAGENS_ERRO_CARRINHO.http401);
  }

  if (status === 404) {
    return criarErro("http_404", MENSAGENS_ERRO_CARRINHO.http404);
  }

  if (status >= 500) {
    return criarErro("http_500", MENSAGENS_ERRO_CARRINHO.http500);
  }

  return criarErro("http_desconhecido", MENSAGENS_ERRO_CARRINHO.desconhecido);
}

function validarQuantidade(quantidade: number): void {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw criarErro("http_400", MENSAGENS_ERRO_CARRINHO.http400);
  }
}

function converterItem(valor: unknown): ItemCarrinho {
  if (!ehRegistro(valor)) {
    throw erroRespostaInvalida();
  }

  const { produtoId, nome, preco, imagem, quantidade, subtotal } = valor;

  if (
    !ehNumeroFinito(produtoId) ||
    typeof nome !== "string" ||
    nome.trim().length === 0 ||
    !ehNumeroFinito(preco) ||
    preco < 0 ||
    typeof imagem !== "string" ||
    !ehNumeroFinito(quantidade) ||
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    !ehNumeroFinito(subtotal) ||
    subtotal < 0
  ) {
    throw erroRespostaInvalida();
  }

  return {
    produtoId,
    nome: nome.trim(),
    preco,
    imagem,
    quantidade,
    subtotal,
  };
}

function converterCarrinho(
  valor: unknown,
  usuarioIdEsperado?: string
): Carrinho {
  if (!ehRegistro(valor)) {
    throw erroRespostaInvalida();
  }

  const { usuarioId, itens, quantidadeTotal, total } = valor;

  if (
    typeof usuarioId !== "string" ||
    usuarioId.trim().length === 0 ||
    (usuarioIdEsperado !== undefined &&
      usuarioId.trim() !== usuarioIdEsperado) ||
    !Array.isArray(itens) ||
    !ehNumeroFinito(quantidadeTotal) ||
    quantidadeTotal < 0 ||
    !ehNumeroFinito(total) ||
    total < 0
  ) {
    throw erroRespostaInvalida();
  }

  return {
    usuarioId: usuarioId.trim(),
    itens: itens.map(converterItem),
    quantidadeTotal,
    total,
  };
}

async function requisitar(
  url: string,
  opcoes: OpcoesRequisicao
): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-api-key": API_KEY,
  };

  if (opcoes.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: opcoes.method,
      headers,
      body:
        opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
      signal: opcoes.signal,
    });
  } catch (erro) {
    if (opcoes.signal?.aborted || ehCancelamento(erro)) {
      throw erro;
    }

    throw criarErro("rede", MENSAGENS_ERRO_CARRINHO.rede);
  }

  if (!resposta.ok) {
    throw erroPorStatus(resposta.status);
  }

  if (resposta.status === 204) {
    return null;
  }

  let texto: string;

  try {
    texto = await resposta.text();
  } catch {
    return null;
  }

  if (texto.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return null;
  }
}

async function executarMutacao(
  url: string,
  opcoes: OpcoesRequisicao,
  usuarioId: string
): Promise<Carrinho> {
  const dados = await requisitar(url, opcoes);

  try {
    return converterCarrinho(dados, usuarioId);
  } catch {
    return buscarCarrinho(usuarioId, opcoes.signal);
  }
}

export async function buscarCarrinho(
  usuarioId: string,
  signal?: AbortSignal
): Promise<Carrinho> {
  const dados = await requisitar(ROTAS.carrinho(usuarioId), {
    method: "GET",
    signal,
  });

  return converterCarrinho(dados, usuarioId);
}

export async function adicionarItem(
  usuarioId: string,
  produtoId: number,
  quantidade: number,
  signal?: AbortSignal
): Promise<Carrinho> {
  validarQuantidade(quantidade);

  return executarMutacao(
    ROTAS.itensCarrinho(usuarioId),
    {
      method: "POST",
      body: { produtoId, quantidade },
      signal,
    },
    usuarioId
  );
}

export async function atualizarQuantidade(
  usuarioId: string,
  produtoId: number,
  quantidade: number,
  signal?: AbortSignal
): Promise<Carrinho> {
  validarQuantidade(quantidade);

  return executarMutacao(
    ROTAS.itemCarrinho(usuarioId, produtoId),
    {
      method: "PUT",
      body: { quantidade },
      signal,
    },
    usuarioId
  );
}

export async function removerItem(
  usuarioId: string,
  produtoId: number,
  signal?: AbortSignal
): Promise<Carrinho> {
  return executarMutacao(
    ROTAS.itemCarrinho(usuarioId, produtoId),
    {
      method: "DELETE",
      signal,
    },
    usuarioId
  );
}

export async function limparCarrinho(
  usuarioId: string,
  signal?: AbortSignal
): Promise<Carrinho> {
  return executarMutacao(
    ROTAS.carrinho(usuarioId),
    {
      method: "DELETE",
      signal,
    },
    usuarioId
  );
}
