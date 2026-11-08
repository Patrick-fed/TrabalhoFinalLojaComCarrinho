import { API_KEY } from "../Config/apiConfig";
import {
  MENSAGENS_CHECKOUT,
  MENSAGENS_ERRO_CHECKOUT,
  ehFormaPagamentoConhecida,
} from "../Constants/mensagensCheckout";
import type {
  ErroCheckout,
  FormaPagamentoDisponivel,
} from "../Types/checkout";
import type {
  Compra,
  FormaPagamento,
  ItemCarrinho,
} from "../Types/types";
import { ROTAS } from "./rotas";

type ContextoErro = "formasPagamento" | "finalizacao";

type OpcoesRequisicao = {
  method: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
};

function criarErro(codigo: string, mensagem: string): ErroCheckout {
  return { codigo, mensagem };
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

function erroRespostaInvalida(contexto: ContextoErro): ErroCheckout {
  return criarErro(
    "resposta_invalida",
    MENSAGENS_ERRO_CHECKOUT[contexto].respostaInvalida
  );
}

function erroFormatoInesperado(contexto: ContextoErro): ErroCheckout {
  return criarErro(
    "formato_inesperado",
    MENSAGENS_ERRO_CHECKOUT[contexto].formatoInesperado
  );
}

function erroPorStatus(status: number, contexto: ContextoErro): ErroCheckout {
  if (status === 401) {
    return criarErro(
      "http_401",
      MENSAGENS_ERRO_CHECKOUT[contexto].http401
    );
  }

  if (status === 403) {
    return criarErro(
      "http_403",
      MENSAGENS_ERRO_CHECKOUT[contexto].http403
    );
  }

  if (status >= 500) {
    return criarErro("http_500", MENSAGENS_ERRO_CHECKOUT[contexto].http500);
  }

  if (contexto === "finalizacao") {
    const mensagens = MENSAGENS_ERRO_CHECKOUT.finalizacao;

    if (status === 400) {
      return criarErro("http_400", mensagens.http400);
    }

    if (status === 404) {
      return criarErro("http_404", mensagens.http404);
    }

    if (status === 409) {
      return criarErro("http_409", mensagens.http409);
    }

    if (status === 422) {
      return criarErro("http_422", mensagens.http422);
    }
  }

  return criarErro(
    "desconhecido",
    MENSAGENS_ERRO_CHECKOUT[contexto].desconhecido
  );
}

function converterItem(valor: unknown): ItemCarrinho {
  if (!ehRegistro(valor)) {
    throw erroFormatoInesperado("finalizacao");
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
    throw erroFormatoInesperado("finalizacao");
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

function converterFormaDisponivel(valor: unknown): FormaPagamentoDisponivel {
  if (!ehRegistro(valor)) {
    throw erroFormatoInesperado("formasPagamento");
  }

  const { id, nome } = valor;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    typeof nome !== "string" ||
    nome.trim().length === 0
  ) {
    throw erroFormatoInesperado("formasPagamento");
  }

  return { id: id.trim(), nome: nome.trim() };
}

function converterFormasPagamento(valor: unknown): FormaPagamentoDisponivel[] {
  if (!Array.isArray(valor)) {
    throw erroFormatoInesperado("formasPagamento");
  }

  return valor.map(converterFormaDisponivel);
}

function converterCompra(valor: unknown, usuarioId: string): Compra {
  if (!ehRegistro(valor)) {
    throw erroRespostaInvalida("finalizacao");
  }

  const {
    id,
    usuarioId: usuarioIdResposta,
    itens,
    quantidadeTotal,
    total,
    formaPagamento,
    status,
    criadaEm,
  } = valor;

  if (
    !ehNumeroFinito(id) ||
    typeof usuarioIdResposta !== "string" ||
    usuarioIdResposta.trim().length === 0 ||
    usuarioIdResposta.trim() !== usuarioId ||
    !Array.isArray(itens) ||
    !ehNumeroFinito(quantidadeTotal) ||
    !Number.isInteger(quantidadeTotal) ||
    quantidadeTotal < 0 ||
    !ehNumeroFinito(total) ||
    total < 0 ||
    typeof formaPagamento !== "string" ||
    !ehFormaPagamentoConhecida(formaPagamento) ||
    typeof status !== "string" ||
    status.trim().length === 0 ||
    typeof criadaEm !== "string" ||
    criadaEm.trim().length === 0
  ) {
    throw erroFormatoInesperado("finalizacao");
  }

  return {
    id,
    usuarioId: usuarioIdResposta.trim(),
    itens: itens.map(converterItem),
    quantidadeTotal,
    total,
    formaPagamento,
    status: status.trim(),
    criadaEm: criadaEm.trim(),
  };
}

async function requisitar(
  url: string,
  opcoes: OpcoesRequisicao,
  contexto: ContextoErro
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

    throw criarErro(
      "rede",
      MENSAGENS_ERRO_CHECKOUT[contexto].rede
    );
  }

  if (!resposta.ok) {
    throw erroPorStatus(resposta.status, contexto);
  }

  if (resposta.status === 204) {
    return null;
  }

  let texto: string;

  try {
    texto = await resposta.text();
  } catch {
    throw erroRespostaInvalida(contexto);
  }

  if (texto.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    throw erroRespostaInvalida(contexto);
  }
}

export async function listarFormasPagamento(
  signal?: AbortSignal
): Promise<FormaPagamentoDisponivel[]> {
  const dados = await requisitar(
    ROTAS.formasPagamento,
    { method: "GET", signal },
    "formasPagamento"
  );

  return converterFormasPagamento(dados);
}

export async function registrarCompra(
  usuarioId: string,
  formaPagamento: FormaPagamento,
  signal?: AbortSignal
): Promise<Compra> {
  if (typeof usuarioId !== "string" || usuarioId.trim().length === 0) {
    throw criarErro(
      "http_400",
      MENSAGENS_CHECKOUT.usuarioNaoIdentificado
    );
  }

  if (!ehFormaPagamentoConhecida(formaPagamento)) {
    throw criarErro(
      "http_400",
      MENSAGENS_ERRO_CHECKOUT.finalizacao.http400
    );
  }

  const usuarioIdLimpo = usuarioId.trim();

  const dados = await requisitar(
    ROTAS.compras,
    {
      method: "POST",
      body: { usuarioId: usuarioIdLimpo, formaPagamento },
      signal,
    },
    "finalizacao"
  );

  return converterCompra(dados, usuarioIdLimpo);
}
