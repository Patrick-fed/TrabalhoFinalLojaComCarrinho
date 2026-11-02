# Research: Carrinho de Compras

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02

Este documento registra as decisões técnicas da feature e os achados da API usados no
plano. Nenhuma nova dependência é necessária.

## Achados da API

**Base URL**: `https://loja-api-wheat.vercel.app` (variável `EXPO_PUBLIC_API_URL`)
**Autenticação**: header obrigatório `x-api-key` (variável `EXPO_PUBLIC_API_KEY`)

A raiz da API informa as rotas disponíveis e que todos os preços e totais estão em
centavos:

```text
GET    /carrinho/:usuarioId
POST   /carrinho/:usuarioId/itens
PUT    /carrinho/:usuarioId/itens/:produtoId
DELETE /carrinho/:usuarioId/itens/:produtoId
DELETE /carrinho/:usuarioId
```

| Verificação | Resultado |
|-------------|-----------|
| `GET /carrinho/:usuarioId` com UUID sem itens | 200 com `{ "usuarioId": "...", "itens": [], "quantidadeTotal": 0, "total": 0 }` |
| Rotas de carrinho na raiz | Confirmadas |
| Valores monetários | Centavos (`4990` = `R$ 49,90`) |
| `x-api-key` | Obrigatório nas rotas protegidas |

**Implicações**:

- O carrinho vazio retornado pela API é sucesso, não erro.
- O contador do cabeçalho deve usar `quantidadeTotal` (soma das quantidades), não a
  quantidade de linhas.
- Subtotais e total devem ser exibidos a partir da resposta da API.
- A chave não deve aparecer em logs, mensagens ou código versionado.

## D-201: Estado global do carrinho

**Decision**: Criar `Context/CarrinhoContext.tsx` com `CarrinhoProvider` e hook
`useCarrinho`, montado dentro de `AuthProvider`.

**Rationale**: O carrinho é usado simultaneamente pelo cabeçalho do catálogo, pela ação
de adicionar do card e pela tela do carrinho. Um contexto evita cópias divergentes e
atende aos requisitos de visão única, contador atualizado e descarte no logout. O
`AuthProvider` já fornece o `uid` necessário.

**Alternatives considered**:

- Estado local na `CatalogoScreen`: dificultaria atualizar a tela do carrinho e o
  contador após operações.
- Passar o carrinho por parâmetros de navegação: criaria cópias e ficaria desatualizado.
- Redux/Zustand: dependência e complexidade desnecessárias para um único domínio.

## D-202: Camada de serviço

**Decision**: Criar `Service/carrinho.ts` com funções específicas para busca, adição,
atualização, remoção e limpeza.

**Rationale**: A constituição exige centralizar chamadas HTTP em `Service/` e manter as
telas focadas em apresentação. As rotas de carrinho já existem em `Service/rotas.ts`.

**Alternatives considered**:

- Chamar `fetch` nas telas: violaria a separação de responsabilidades.
- Reaproveitar `Service/catalogo.ts`: misturaria domínios e responsabilidades.

## D-203: Contrato de mutação e normalização

**Decision**: Enviar `POST` com `{ produtoId, quantidade }` e `PUT` com `{ quantidade }`.
Se a resposta da mutação não for um `Carrinho` válido, executar
`GET /carrinho/:usuarioId` e usar o estado canônico. Se o `GET` também falhar, lançar
`ErroCarrinho`.

**Rationale**: A especificação já assume esses formatos de envio. A normalização torna o
serviço tolerante a respostas `204`, corpo vazio, item isolado ou formato diferente do
esperado, sem duplicar lógica nas telas e mantendo a API como fonte da verdade.

**Alternatives considered**:

- Exigir que toda mutação retorne o carrinho completo: frágil se a API responder `204`.
- Fazer sempre um `GET` após cada mutação: simples, mas desperdiça uma requisição quando a
  API já retorna o carrinho.
- Ignorar o corpo da mutação e atualizar localmente: arriscaria divergir dos totais da API.

## D-204: Controle de concorrência

**Decision**: Manter uma única mutação por vez no contexto, com uma trava em `ref`, um
identificador de requisição e um identificador de sessão. Carregamentos e mutações só
aplicam o resultado se ainda pertencerem à requisição e à sessão atuais.

**Rationale**: Evita requisições duplicadas por toques repetidos, respostas fora de ordem
e atualização da tela com dados de uma operação anterior. Atende aos requisitos de
desabilitar ações durante operações e ignorar respostas atrasadas.

**Alternatives considered**:

- Permitir mutações simultâneas por item: exigiria merge de estados e aumentaria a
  complexidade sem benefício para o escopo.
- Apenas desabilitar botões na interface: não protege contra respostas atrasadas ou toques
  programáticos.

## D-205: Carregamento inicial

**Decision**: Carregar o carrinho automaticamente quando houver `usuario.uid`. A tela do
carrinho usa o estado do contexto e oferece “Tentar novamente” em caso de falha. Uma nova
busca só ocorre em retry ou quando ainda não houver carrinho carregado.

**Rationale**: O contador do cabeçalho precisa do carrinho mesmo antes de abrir a tela.
Carregar no login também atende à reabertura do aplicativo com sessão ativa, sem
persistência local. Evita uma requisição extra a cada foco da tela.

**Alternatives considered**:

- Buscar somente ao abrir a tela do carrinho: o contador do cabeçalho ficaria sem dados.
- Buscar em cada foco: atualizaria dados sem necessidade e poderia competir com mutações.

## D-206: Isolamento por usuário e logout

**Decision**: Ao mudar `usuario.uid`, abortar requisições ativas, limpar o estado e
ignorar respostas da sessão anterior. Ao sair, o estado fica nulo.

**Rationale**: Atende ao requisito de cada usuário ver apenas o próprio carrinho e evita
que uma resposta atrasada de um usuário apareça para outro.

**Alternatives considered**:

- Confiar apenas na troca de pilha do `AppNavigator`: o provider continuaria montado e
  poderia manter estado do usuário anterior.
- Limpar apenas no logout: não cobriria troca de conta sem logout explícito.

## D-207: Contador no cabeçalho

**Decision**: Adicionar ao cabeçalho do catálogo um botão “Carrinho” com badge exibindo
`carrinho?.quantidadeTotal ?? 0`, navegando para `Carrinho`.

**Rationale**: Torna o carrinho acessível na área principal autenticada e reflete
operações bem-sucedidas sem duplicar estado.

**Alternatives considered**:

- Colocar o carrinho apenas em uma aba inferior: mudaria a navegação existente e exigiria
  outra estrutura.
- Exibir apenas o texto sem contador: não atenderia ao requisito de quantidade total.

## D-208: Ação de adicionar no card

**Decision**: Alterar `CartaoProduto` para ter uma área principal que abre detalhes e uma
ação separada “Adicionar”. A ação mostra “Esgotado” e fica desabilitada quando
`produto.estoque <= 0`; durante a adição, mostra spinner e bloqueia novos toques.

**Rationale**: Atende à clarificação de adicionar pelo card com quantidade 1, sem criar
navegação implícita ao tocar no botão. Separar as áreas evita `Pressable` aninhado e
mantém acessibilidade previsível.

**Alternatives considered**:

- Colocar o botão dentro do `Pressable` de navegação: o toque poderia abrir detalhes.
- Abrir um modal de quantidade: contraria a decisão de ajustar quantidades no carrinho.

## D-209: Tela do carrinho

**Decision**: Criar `CarrinhoScreen` com `FlatList`, `ItemCarrinhoCard`, resumo de totais e
ação “Limpar carrinho” no cabeçalho. O estado vazio oferece retorno ao catálogo.

**Rationale**: `FlatList` é adequada para listas e já é usada no projeto. O resumo fixo ou
no rodapé mantém os totais visíveis. Os controles por item atendem à alteração de
quantidade e remoção.

**Alternatives considered**:

- `ScrollView` com `map`: menos adequada para listas e sem virtualização.
- Editar quantidade em outra tela: adicionaria navegação desnecessária.

## D-210: Confirmação de limpeza

**Decision**: Criar `ModalConfirmacao` com `Modal` do React Native para confirmar a
limpeza do carrinho.

**Rationale**: `Alert.alert` tem comportamento inconsistente no React Native Web, que é o
ambiente principal de validação. Um modal customizado funciona em web e mobile, permite
estado de carregamento e mantém o padrão visual azul.

**Alternatives considered**:

- `Alert.alert`: simples no mobile, mas arriscado no Expo Web.
- Confirmação inline: menos clara e mais fácil de ignorar.

## D-211: Totais e formatação

**Decision**: Exibir `item.subtotal`, `carrinho.quantidadeTotal` e `carrinho.total`
retornados pela API, formatando valores com `formatarPrecoCentavos`.

**Rationale**: A API é a fonte da verdade e o requisito exige que os valores exibidos
correspondam ao retorno. Reutiliza a formatação já existente no catálogo.

**Alternatives considered**:

- Recalcular totais localmente: poderia divergir da API em promoções ou regras futuras.
- Formatar manualmente em cada tela: duplicaria lógica.

## D-212: Tratamento de erros

**Decision**: Criar `ErroCarrinho` no formato aceito por `Utils/erros.ts` e mapear rede,
HTTP 400/401/403/404/409/422/5xx, resposta inválida e cancelamento para mensagens em
português. Não exibir corpo bruto, chave ou stack trace.

**Rationale**: Mantém consistência com o catálogo, permite que as telas usem
`obterMensagemDeErro` e evita vazamento de detalhes técnicos.

**Alternatives considered**:

- Exibir a mensagem da API diretamente: poderia expor detalhes técnicos ou variar de
  formato.
- Um único erro genérico: não diferenciaria estoque, autenticação e item ausente.

## D-213: Estratégia de testes

**Decision**: Não adicionar framework de testes. Validar com `npm run typecheck` e o
roteiro manual de `quickstart.md`.

**Rationale**: O projeto é acadêmico, não possui infraestrutura de testes e a
especificação não exige automação. O roteiro cobre os fluxos críticos e os modos de falha.

**Alternatives considered**:

- Jest + React Native Testing Library: configuração e dependências adicionais;
  pode ser introduzido em uma etapa futura.

## Unknowns resolvidos

| Desconhecido | Resolução |
|--------------|-----------|
| Onde manter o estado compartilhado? | `CarrinhoContext` dentro de `AuthProvider`. |
| Como tolerar respostas de mutação desconhecidas? | Normalização no serviço com fallback para `GET`. |
| Como evitar respostas antigas? | Trava de mutação + identificadores de requisição/sessão. |
| Como isolar por usuário? | Reset e aborto ao mudar `uid`. |
| Onde exibir o contador? | Badge no botão “Carrinho” do cabeçalho. |
| Como confirmar limpeza no Expo Web? | `ModalConfirmacao` customizado. |
| Como validar sem testes automatizados? | `tsc --noEmit` + quickstart manual. |
