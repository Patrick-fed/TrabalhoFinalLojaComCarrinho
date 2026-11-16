export const MENSAGEM_ERRO_PADRAO =
  "Não foi possível concluir a operação. Tente novamente.";

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  http_400: "Não foi possível concluir a operação. Revise os dados.",
  http_401: "E-mail ou senha incorretos.",
  http_409: "Este e-mail já está cadastrado.",
  http_500: "A loja está indisponível. Tente novamente.",
  rede: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  resposta_invalida: "A loja retornou uma resposta inválida.",
};

export const MENSAGENS_VALIDACAO = {
  camposObrigatorios: "Preencha todos os campos.",
  nomeObrigatorio: "Informe seu nome.",
  emailInvalido: "Informe um e-mail válido.",
  senhaCurta: "A senha deve ter pelo menos 6 caracteres.",
  senhasDiferentes: "As senhas não coincidem.",
} as const;

export function obterMensagemErro(codigo: string): string {
  return MENSAGENS_POR_CODIGO[codigo] ?? MENSAGEM_ERRO_PADRAO;
}
