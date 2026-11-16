import { API_KEY, API_URL } from "../Config/apiConfig";
import {
  MENSAGENS_VALIDACAO,
  MENSAGEM_ERRO_PADRAO,
  obterMensagemErro,
} from "../Constants/mensagensErro";
import type {
  Conta,
  Credenciais,
  DadosCadastro,
  ErroAutenticacao,
} from "../Types/auth";
import { normalizarEmail, validarEmail } from "../Utils/validacoes";
import { ROTAS } from "./rotas";
import { carregarSessao, limparSessao, salvarSessao } from "./sessao";

type Operacao = "cadastro" | "login";

type RespostaHttp = {
  status: number;
  dados: unknown;
};

function criarErro(codigo: string, mensagem: string): ErroAutenticacao {
  return { codigo, mensagem };
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehNumeroFinito(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

function mensagemServidor(dados: unknown): string | null {
  if (!ehRegistro(dados) || typeof dados.erro !== "string") {
    return null;
  }

  const mensagem = dados.erro.trim();
  return mensagem.length > 0 ? mensagem : null;
}

function erroPorStatus(status: number, operacao: Operacao): ErroAutenticacao {
  if (operacao === "cadastro" && status === 409) {
    return criarErro("http_409", obterMensagemErro("http_409"));
  }

  if (operacao === "login" && status === 401) {
    return criarErro("http_401", obterMensagemErro("http_401"));
  }

  if (status === 400) {
    return criarErro("http_400", obterMensagemErro("http_400"));
  }

  if (status === 401 || status === 403) {
    return criarErro("http_401", obterMensagemErro("http_401"));
  }

  if (status >= 500) {
    return criarErro("http_500", obterMensagemErro("http_500"));
  }

  return criarErro("desconhecido", MENSAGEM_ERRO_PADRAO);
}

function falhar(
  resposta: RespostaHttp,
  operacao: Operacao
): never {
  const detalhe = mensagemServidor(resposta.dados);

  if (detalhe) {
    const base = erroPorStatus(resposta.status, operacao);
    throw criarErro(base.codigo, detalhe);
  }

  throw erroPorStatus(resposta.status, operacao);
}

async function requisitar(
  url: string,
  method: "GET" | "POST",
  body?: unknown
): Promise<RespostaHttp> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-api-key": API_KEY,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw criarErro("rede", obterMensagemErro("rede"));
  }

  let dados: unknown = null;
  let texto: string | null = null;

  try {
    texto = await resposta.text();
  } catch {
    texto = null;
  }

  if (texto !== null && texto.trim().length > 0) {
    try {
      dados = JSON.parse(texto) as unknown;
    } catch {
      dados = null;
    }
  }

  return { status: resposta.status, dados };
}

function converterConta(valor: unknown): Conta {
  if (!ehRegistro(valor)) {
    throw criarErro("resposta_invalida", obterMensagemErro("resposta_invalida"));
  }

  const { id, nome, email } = valor;

  if (
    !ehNumeroFinito(id) ||
    !Number.isInteger(id) ||
    id < 1 ||
    typeof nome !== "string" ||
    nome.trim().length === 0 ||
    typeof email !== "string" ||
    email.trim().length === 0
  ) {
    throw criarErro("resposta_invalida", obterMensagemErro("resposta_invalida"));
  }

  return {
    id: String(id),
    nome: nome.trim(),
    email: email.trim(),
    token: "",
  };
}

function converterRespostaLogin(valor: unknown): Conta {
  if (!ehRegistro(valor)) {
    throw criarErro("resposta_invalida", obterMensagemErro("resposta_invalida"));
  }

  const { token, usuario } = valor;

  if (typeof token !== "string" || token.trim().length === 0) {
    throw criarErro("resposta_invalida", obterMensagemErro("resposta_invalida"));
  }

  const conta = converterConta(usuario);

  return { ...conta, token: token.trim() };
}

function validarCredenciais(credenciais: Credenciais): string {
  const email = normalizarEmail(credenciais.email);
  const erroEmail = validarEmail(email);

  if (erroEmail) {
    throw criarErro("http_400", erroEmail);
  }

  if (credenciais.senha.trim().length === 0) {
    throw criarErro("http_400", MENSAGENS_VALIDACAO.camposObrigatorios);
  }

  if (credenciais.senha.length < 6) {
    throw criarErro("http_400", MENSAGENS_VALIDACAO.senhaCurta);
  }

  return email;
}

async function solicitarLogin(credenciais: Credenciais): Promise<Conta> {
  const email = validarCredenciais(credenciais);

  const resposta = await requisitar(ROTAS.login, "POST", {
    email,
    senha: credenciais.senha,
  });

  if (resposta.status !== 200) {
    falhar(resposta, "login");
  }

  const conta = converterRespostaLogin(resposta.dados);
  await salvarSessao(conta);

  return conta;
}

export async function cadastrarUsuario(
  dados: DadosCadastro
): Promise<Conta> {
  const nome = dados.nome.trim();

  if (nome.length === 0) {
    throw criarErro("http_400", MENSAGENS_VALIDACAO.nomeObrigatorio);
  }

  const email = validarCredenciais(dados);

  const resposta = await requisitar(ROTAS.usuarios, "POST", {
    nome,
    email,
    senha: dados.senha,
  });

  if (resposta.status !== 201) {
    falhar(resposta, "cadastro");
  }

  converterConta(resposta.dados);

  return solicitarLogin(dados);
}

export async function entrar(credenciais: Credenciais): Promise<Conta> {
  return solicitarLogin(credenciais);
}

export async function sair(): Promise<void> {
  await limparSessao();
}

export async function restaurarSessao(): Promise<Conta | null> {
  return carregarSessao();
}
