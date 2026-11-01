import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../Config/fireBase";
import {
  MENSAGEM_ERRO_PADRAO,
  obterMensagemErro,
} from "../Constants/mensagensErro";
import type { Conta, Credenciais, ErroAutenticacao } from "../Types/auth";
import { normalizarEmail } from "../Utils/validacoes";

function converterConta(usuario: User | null): Conta | null {
  if (!usuario) {
    return null;
  }

  return {
    uid: usuario.uid,
    email: usuario.email,
  };
}

function obterCodigoErro(erro: unknown): string {
  if (typeof erro === "object" && erro !== null && "code" in erro) {
    const codigo = (erro as { code?: unknown }).code;

    if (typeof codigo === "string") {
      return codigo;
    }
  }

  return "desconhecido";
}

function converterErro(erro: unknown): ErroAutenticacao {
  const codigo = obterCodigoErro(erro);

  return {
    codigo,
    mensagem: obterMensagemErro(codigo),
  };
}

export async function cadastrarUsuario(
  credenciais: Credenciais
): Promise<Conta> {
  try {
    const resultado = await createUserWithEmailAndPassword(
      auth,
      normalizarEmail(credenciais.email),
      credenciais.senha
    );
    const conta = converterConta(resultado.user);

    if (!conta) {
      throw {
        codigo: "auth/conta-nao-criada",
        mensagem: MENSAGEM_ERRO_PADRAO,
      } satisfies ErroAutenticacao;
    }

    return conta;
  } catch (erro) {
    throw converterErro(erro);
  }
}

export async function entrar(credenciais: Credenciais): Promise<Conta> {
  try {
    const resultado = await signInWithEmailAndPassword(
      auth,
      normalizarEmail(credenciais.email),
      credenciais.senha
    );
    const conta = converterConta(resultado.user);

    if (!conta) {
      throw {
        codigo: "auth/conta-nao-encontrada",
        mensagem: MENSAGEM_ERRO_PADRAO,
      } satisfies ErroAutenticacao;
    }

    return conta;
  } catch (erro) {
    throw converterErro(erro);
  }
}

export async function sair(): Promise<void> {
  try {
    await signOut(auth);
  } catch (erro) {
    throw converterErro(erro);
  }
}

export function observarSessao(
  callback: (usuario: Conta | null) => void
): () => void {
  return onAuthStateChanged(auth, (usuario) => {
    callback(converterConta(usuario));
  });
}
