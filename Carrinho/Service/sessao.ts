import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Conta } from "../Types/auth";

const CHAVE_CONTA = "@carrinho/conta";

type OuvinteExpiracao = () => void;

let tokenAtual: string | null = null;
const ouvintesExpiracao = new Set<OuvinteExpiracao>();

export function obterToken(): string | null {
  return tokenAtual;
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function converterConta(valor: unknown): Conta | null {
  if (!ehRegistro(valor)) {
    return null;
  }

  const { id, nome, email, token } = valor;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    typeof nome !== "string" ||
    nome.trim().length === 0 ||
    typeof email !== "string" ||
    email.trim().length === 0 ||
    typeof token !== "string" ||
    token.trim().length === 0
  ) {
    return null;
  }

  return {
    id: id.trim(),
    nome: nome.trim(),
    email: email.trim(),
    token: token.trim(),
  };
}

export async function salvarSessao(conta: Conta): Promise<void> {
  tokenAtual = conta.token;

  try {
    await AsyncStorage.setItem(CHAVE_CONTA, JSON.stringify(conta));
  } catch {
    // Falha de persistência não impede a sessão em memória.
  }
}

export async function carregarSessao(): Promise<Conta | null> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_CONTA);

    if (!bruto) {
      return null;
    }

    let dados: unknown;

    try {
      dados = JSON.parse(bruto) as unknown;
    } catch {
      await limparSessao();
      return null;
    }

    const conta = converterConta(dados);

    if (!conta) {
      await limparSessao();
      return null;
    }

    tokenAtual = conta.token;
    return conta;
  } catch {
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  tokenAtual = null;

  try {
    await AsyncStorage.removeItem(CHAVE_CONTA);
  } catch {
    // Sem sessão em memória mesmo que a remoção falhe.
  }
}

export function assinarExpiracao(ouvinte: OuvinteExpiracao): () => void {
  ouvintesExpiracao.add(ouvinte);

  return () => {
    ouvintesExpiracao.delete(ouvinte);
  };
}

export function notificarTokenExpirado(): void {
  if (tokenAtual === null) {
    return;
  }

  tokenAtual = null;

  for (const ouvinte of ouvintesExpiracao) {
    ouvinte();
  }
}
