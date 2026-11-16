export type Credenciais = {
  email: string;
  senha: string;
};

export type DadosCadastro = Credenciais & {
  nome: string;
};

export type Conta = {
  id: string;
  nome: string;
  email: string;
  token: string;
};

export type ErroAutenticacao = {
  codigo: string;
  mensagem: string;
};
