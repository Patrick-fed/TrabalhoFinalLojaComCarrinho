export type Credenciais = {
  email: string;
  senha: string;
};

export type Conta = {
  uid: string;
  email: string | null;
};

export type ErroAutenticacao = {
  codigo: string;
  mensagem: string;
};
