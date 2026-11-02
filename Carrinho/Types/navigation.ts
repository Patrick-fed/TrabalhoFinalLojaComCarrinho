import type { Produto } from "./types";

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

export type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
};
