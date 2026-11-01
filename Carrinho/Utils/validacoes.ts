import { MENSAGENS_VALIDACAO } from "../Constants/mensagensErro";

export type ErrosFormulario = {
  email?: string;
  senha?: string;
  confirmacao?: string;
};

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarEmail(email: string): string | undefined {
  const valor = email.trim();

  if (valor.length === 0) {
    return MENSAGENS_VALIDACAO.camposObrigatorios;
  }

  if (!FORMATO_EMAIL.test(valor)) {
    return MENSAGENS_VALIDACAO.emailInvalido;
  }

  return undefined;
}

export function validarSenha(
  senha: string,
  exigirTamanhoMinimo = true
): string | undefined {
  if (senha.trim().length === 0) {
    return MENSAGENS_VALIDACAO.camposObrigatorios;
  }

  if (exigirTamanhoMinimo && senha.length < 6) {
    return MENSAGENS_VALIDACAO.senhaCurta;
  }

  return undefined;
}

export function validarConfirmacao(
  senha: string,
  confirmacao: string
): string | undefined {
  if (confirmacao.trim().length === 0) {
    return MENSAGENS_VALIDACAO.camposObrigatorios;
  }

  if (senha !== confirmacao) {
    return MENSAGENS_VALIDACAO.senhasDiferentes;
  }

  return undefined;
}

export function validarCadastro(
  email: string,
  senha: string,
  confirmacao: string
): ErrosFormulario {
  return {
    email: validarEmail(email),
    senha: validarSenha(senha),
    confirmacao: validarConfirmacao(senha, confirmacao),
  };
}

export function validarLogin(
  email: string,
  senha: string
): ErrosFormulario {
  return {
    email: validarEmail(email),
    senha: validarSenha(senha, false),
  };
}

export function temErros(erros: ErrosFormulario): boolean {
  return Object.values(erros).some((erro) => Boolean(erro));
}
