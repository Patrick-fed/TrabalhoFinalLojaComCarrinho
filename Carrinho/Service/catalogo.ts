import { API_KEY } from "../Config/apiConfig";
import { MENSAGENS_ERRO_API } from "../Constants/mensagensCatalogo";
import type {
  CategoriaDisponivel,
  ErroCatalogo,
  FiltrosCatalogo,
} from "../Types/catalogo";
import type { Categoria, Produto } from "../Types/types";
import { ROTAS } from "./rotas";

function criarErro(codigo: string, mensagem: string): ErroCatalogo {
  return { codigo, mensagem };
}

function erroRespostaInvalida(): ErroCatalogo {
  return criarErro("resposta_invalida", MENSAGENS_ERRO_API.respostaInvalida);
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function ehNumeroFinito(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

function converterProduto(valor: unknown): Produto {
  if (!ehRegistro(valor)) {
    throw erroRespostaInvalida();
  }

  const { id, nome, descricao, preco, categoria, estoque, imagem } = valor;

  if (
    !ehNumeroFinito(id) ||
    typeof nome !== "string" ||
    nome.trim().length === 0 ||
    typeof descricao !== "string" ||
    !ehNumeroFinito(preco) ||
    preco < 0 ||
    typeof categoria !== "string" ||
    categoria.trim().length === 0 ||
    !ehNumeroFinito(estoque) ||
    estoque < 0 ||
    typeof imagem !== "string"
  ) {
    throw erroRespostaInvalida();
  }

  return {
    id,
    nome: nome.trim(),
    descricao,
    preco,
    categoria: categoria as Categoria,
    estoque,
    imagem,
  };
}

function converterCategoria(valor: unknown): CategoriaDisponivel {
  if (!ehRegistro(valor)) {
    throw erroRespostaInvalida();
  }

  const { id, nome } = valor;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    typeof nome !== "string" ||
    nome.trim().length === 0
  ) {
    throw erroRespostaInvalida();
  }

  return {
    id: id as Categoria,
    nome: nome.trim(),
  };
}

function erroPorStatus(status: number): ErroCatalogo {
  if (status === 400) {
    return criarErro("http_400", MENSAGENS_ERRO_API.http400);
  }

  if (status === 401 || status === 403) {
    return criarErro("http_401", MENSAGENS_ERRO_API.http401);
  }

  if (status === 404) {
    return criarErro("http_404", MENSAGENS_ERRO_API.http404);
  }

  if (status >= 500) {
    return criarErro("http_500", MENSAGENS_ERRO_API.http500);
  }

  return criarErro("http_desconhecido", MENSAGENS_ERRO_API.desconhecido);
}

function ehCancelamento(erro: unknown): boolean {
  return (
    ehRegistro(erro) &&
    "name" in erro &&
    (erro as { name?: unknown }).name === "AbortError"
  );
}

async function requisitar(
  url: string,
  signal?: AbortSignal
): Promise<unknown> {
  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
      signal,
    });
  } catch (erro) {
    if (signal?.aborted || ehCancelamento(erro)) {
      throw erro;
    }

    throw criarErro("rede", MENSAGENS_ERRO_API.rede);
  }

  if (!resposta.ok) {
    throw erroPorStatus(resposta.status);
  }

  try {
    return await resposta.json();
  } catch {
    throw erroRespostaInvalida();
  }
}

function montarUrlProdutos(filtros: FiltrosCatalogo): string {
  const parametros: string[] = [];
  const busca = filtros.busca.trim();

  if (busca.length > 0) {
    parametros.push(`busca=${encodeURIComponent(busca)}`);
  }

  if (filtros.categoria) {
    parametros.push(`categoria=${encodeURIComponent(filtros.categoria)}`);
  }

  if (parametros.length === 0) {
    return ROTAS.produtos;
  }

  return `${ROTAS.produtos}?${parametros.join("&")}`;
}

export async function listarProdutos(
  filtros: FiltrosCatalogo,
  signal?: AbortSignal
): Promise<Produto[]> {
  const dados = await requisitar(montarUrlProdutos(filtros), signal);

  if (!Array.isArray(dados)) {
    throw erroRespostaInvalida();
  }

  return dados.map(converterProduto);
}

export async function buscarProdutoPorId(
  id: number,
  signal?: AbortSignal
): Promise<Produto> {
  const dados = await requisitar(ROTAS.produtoPorId(id), signal);

  return converterProduto(dados);
}

export async function listarCategorias(
  signal?: AbortSignal
): Promise<CategoriaDisponivel[]> {
  const dados = await requisitar(ROTAS.categorias, signal);

  if (!Array.isArray(dados)) {
    throw erroRespostaInvalida();
  }

  return dados.map(converterCategoria);
}
