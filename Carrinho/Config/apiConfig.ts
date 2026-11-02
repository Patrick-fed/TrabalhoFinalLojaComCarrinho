function obterVariavel(nome: string): string {
  const valor = process.env[nome];

  if (!valor || valor.trim().length === 0) {
    throw new Error(
      `Configuração da API ausente: ${nome}. Crie o arquivo Carrinho/.env a partir de Carrinho/.env.example.`
    );
  }

  return valor.trim();
}

export const API_URL = obterVariavel("EXPO_PUBLIC_API_URL").replace(
  /\/+$/,
  ""
);

export const API_KEY = obterVariavel("EXPO_PUBLIC_API_KEY");
