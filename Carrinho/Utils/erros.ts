import { MENSAGEM_ERRO_PADRAO } from "../Constants/mensagensErro";

export function obterMensagemDeErro(erro: unknown): string {
  if (typeof erro === "object" && erro !== null && "mensagem" in erro) {
    const mensagem = (erro as { mensagem?: unknown }).mensagem;

    if (typeof mensagem === "string" && mensagem.trim().length > 0) {
      return mensagem;
    }
  }

  return MENSAGEM_ERRO_PADRAO;
}
