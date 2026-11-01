export const MENSAGEM_ERRO_PADRAO =
  "Não foi possível concluir a operação. Tente novamente.";

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta está desativada.",
  "auth/network-request-failed":
    "Não foi possível conectar. Verifique sua internet e tente novamente.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/operation-not-allowed":
    "O cadastro por e-mail e senha não está habilitado.",
};

export const MENSAGENS_VALIDACAO = {
  camposObrigatorios: "Preencha todos os campos.",
  emailInvalido: "Informe um e-mail válido.",
  senhaCurta: "A senha deve ter pelo menos 6 caracteres.",
  senhasDiferentes: "As senhas não coincidem.",
} as const;

export function obterMensagemErro(codigo: string): string {
  return MENSAGENS_POR_CODIGO[codigo] ?? MENSAGEM_ERRO_PADRAO;
}
