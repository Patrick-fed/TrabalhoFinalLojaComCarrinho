Conta e login
POST /usuarios responde 201 com o usuário criado, sem a senha. Dá 400 se faltar o
nome, se o e-mail for inválido ou se a senha tiver menos de 6 caracteres, e 409 se o e-mail
já estiver cadastrado.
{ "id": 3, "nome": "João", "email": "joao@email.com" }
POST /login responde 200 com o token e os dados do usuário, ou 401 se o e-mail ou a
senha estiverem errados:
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"usuario": { "id": 3, "nome": "João", "email": "joao@email.com" }
Exemplo de chamada
const API = process.env.EXPO_PUBLIC_API_URL;
async function fazerLogin(email: string, senha: string):
Promise<RespostaLogin> {
const resposta = await fetch(`${API}/login`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, senha }),
});
const dados = await resposta.json();
if (!resposta.ok) throw new Error((dados as ErroApi).erro);
return dados as RespostaLogin;
}
async function buscarProdutos(token: string): Promise<Produto[]> {
const resposta = await fetch(`${API}/produtos`, {
headers: { Authorization: `Bearer ${token}` },
});
if (!resposta.ok) throw new Error("Não foi possível carregar os
produtos.");
return resposta.json();
}