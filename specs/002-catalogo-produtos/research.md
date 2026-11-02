# Research: Catálogo de Produtos

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02

Este documento registra as decisões técnicas da feature e os achados da API usados no
plano. Nenhuma nova dependência é necessária.

## Achados da API

**Base URL**: `https://loja-api-wheat.vercel.app` (variável `EXPO_PUBLIC_API_URL`)
**Autenticação**: header obrigatório `x-api-key` (variável `EXPO_PUBLIC_API_KEY`)

| Verificação | Resultado |
|-------------|-----------|
| `GET /categorias` | 200 com 9 categorias no formato `{ "id": string, "nome": string }` |
| `GET /produtos` | 200 com 24 produtos no formato `{ id, nome, descricao, preco, categoria, estoque, imagem }` |
| `GET /produtos?busca=teclado` | 200 com 1 resultado; busca é case-insensitive |
| `GET /produtos?busca=Teclado` / `TECLADO` | Mesmo resultado da busca minúscula |
| `GET /produtos?busca=mecanico` | 200 com lista vazia; a busca é sensível a acentos |
| `GET /produtos?busca=mecânico` | 200 com "Teclado mecânico" |
| `GET /produtos?busca=cancelamento` | 200 com lista vazia; a busca considera o nome, não a descrição |
| `GET /produtos?categoria=eletronicos&busca=teclado` | 200 com o produto correspondente |
| `GET /produtos?categoria=inexistente` | 400 com `{ "erro": "Categoria inválida..." }` |
| `GET /produtos?categoria=` / `?busca=` | 200; parâmetro vazio é tratado como ausência |
| `GET /produtos/1` | 200 com o produto |
| `GET /produtos/99999` | 404 com `{ "erro": "Produto não encontrado." }` |
| `GET /imagens/1.jpg` | 200, `image/jpeg` |
| Sem `x-api-key` | 401/erro com `{ "erro": "Chave de acesso inválida ou ausente..." }` |

**Categorias retornadas**: `eletronicos`, `roupas`, `casa`, `livros`, `cervejas`,
`carnes`, `refrigerantes`, `chocolates`, `cachorro-quente`.

**Implicações**:
- A busca deve ser enviada como o usuário digitou (apenas `trim`), sem normalização de
  acentos, para não divergir do comportamento da API.
- Parâmetros vazios devem ser omitidos da URL.
- Categorias devem vir de `/categorias`, não de uma lista fixa na tela.
- A chave não deve aparecer em logs, mensagens ou no código versionado.

## D-101: Cliente HTTP

**Decision**: Usar `fetch` nativo do React Native/Expo em um único arquivo
`Service/catalogo.ts`.

**Rationale**: `fetch` já está disponível, atende aos dois endpoints e evita uma
dependência nova. O projeto não usa Axios e a constituição prioriza recursos existentes.

**Alternatives considered**:
- Axios: adicionaria dependência e não traria benefício proporcional neste escopo.
- Chamadas diretas nas telas: violariam a centralização em `Service/`.

## D-102: Configuração da API

**Decision**: Criar `Config/apiConfig.ts` para ler `EXPO_PUBLIC_API_URL` e
`EXPO_PUBLIC_API_KEY`, lançando erro claro se estiverem ausentes. `Service/rotas.ts`
passa a importar `API_URL`; `Service/catalogo.ts` usa `API_KEY` no header.

**Rationale**: Segue o padrão de `Config/fireBaseConfig.ts`, separa configuração de
lógica e permite que o app funcione sem URLs hardcoded. As variáveis já existem em
`Carrinho/.env` e serão documentadas em `.env.example`.

**Alternatives considered**:
- Manter a URL hardcoded em `rotas.ts`: já funciona, mas ignora o ambiente e duplica a
  configuração.
- Ler as variáveis diretamente no serviço: possível, porém menos organizado e sem
  validação única.

## D-103: Tipos existentes

**Decision**: Exportar os tipos de `Types/types.ts` e completar a union `Categoria` com
as 9 categorias da API. Reutilizar `Produto` no catálogo.

**Rationale**: A constituição exige reutilização dos tipos existentes. Hoje eles não são
exportáveis e a union está incompleta, o que impediria o catálogo de representar
produtos de cervejas, carnes, refrigerantes, chocolates e cachorro-quente.

**Alternatives considered**:
- Criar um `Produto` duplicado no catálogo: duplicação desnecessária e risco de
  divergência.
- Tipar `Categoria` como `string`: evitaria manutenção da union, mas perderia a
  segurança de tipo e a expressividade dos dados conhecidos.

## D-104: Tipos específicos do catálogo

**Decision**: Criar `Types/catalogo.ts` com `CategoriaDisponivel` (`id`, `nome`),
`FiltrosCatalogo` (`busca`, `categoria`) e `ErroCatalogo` (`codigo`, `mensagem`).

**Rationale**: `Categoria` em `types.ts` representa o identificador do produto; a
resposta de `/categorias` tem também o nome de exibição. `ErroCatalogo` mantém o mesmo
formato compreendido por `Utils/erros.ts`.

**Alternatives considered**:
- Colocar tudo em `types.ts`: misturaria tipos de domínio com tipos exclusivos da tela.
- Reutilizar `ErroAutenticacao`: o nome e o contexto são diferentes, embora o formato
  seja parecido.

## D-105: Busca com debounce

**Decision**: Manter `busca` (texto do campo) e `buscaAplicada` (valor usado na
consulta). Um efeito com `setTimeout` de 300 ms atualiza `buscaAplicada` após o usuário
parar de digitar. Valores vazios ou apenas espaços viram string vazia.

**Rationale**: Atende ao requisito de 300 ms sem acoplar o campo à requisição. Separar os
dois estados evita consultas a cada tecla e deixa claro qual termo está ativo.

**Alternatives considered**:
- Debounce dentro do `onChangeText`: mais difícil de cancelar e testar.
- Busca apenas no submit: não atende à atualização enquanto digita.

## D-106: Concorrência e respostas fora de ordem

**Decision**: Cada efeito de consulta cria um `AbortController` e uma verificação de
"requisição atual". O `cleanup` aborta a requisição anterior e ignora seu resultado. Uma
resposta cancelada não gera mensagem de erro.

**Rationale**: O usuário pode digitar ou trocar de categoria rapidamente. Sem esse
controle, uma resposta antiga poderia sobrescrever a lista atual.

**Alternatives considered**:
- Apenas debounce: reduz o problema, mas não elimina respostas lentas fora de ordem.
- Fila de requisições: complexidade desnecessária para duas consultas simples.

## D-107: Carregamento inicial e atualizações

**Decision**: Usar `carregandoInicial` para a primeira carga (tela cheia) e
`atualizando` para buscas/trocas de filtro (indicador discreto com a lista visível).

**Rationale**: Corresponde às clarificações da especificação e evita que a tela pisque
ou perca o conteúdo a cada ajuste de filtro.

**Alternatives considered**:
- Tela cheia em toda consulta: pior experiência e contraria a clarificação.
- Nenhum indicador nas atualizações: o usuário não saberia que a lista está mudando.

## D-108: Falha em consulta posterior

**Decision**: Se já existe uma lista carregada, uma falha em busca/filtro mantém os
produtos anteriores e mostra `MensagemErro` com "Tentar novamente" junto aos filtros.
Se a falha ocorre na primeira carga, o erro ocupa a tela inteira.

**Rationale**: Atende ao FR-026 e à clarificação de manter a lista anterior visível.

**Alternatives considered**:
- Limpar a lista no erro: esconderia conteúdo válido e contrariaria o requisito.
- Mostrar erro apenas em alerta: menos acessível e fora do padrão visual.

## D-109: Produtos e categorias independentes

**Decision**: Buscar produtos e categorias em efeitos separados. Falha de categorias
mostra erro na área de filtros e mantém os produtos; falha de produtos não impede a
exibição das categorias já carregadas.

**Rationale**: Os dois recursos são independentes e a especificação exige que uma falha
de categorias não esconda os produtos.

**Alternatives considered**:
- `Promise.all`: uma falha derrubaria os dois estados.
- Carregar categorias apenas depois dos produtos: atrasaria o filtro e não traria
  benefício.

## D-110: Seleção de categorias

**Decision**: Usar `SeletorCategorias` com `ScrollView` horizontal, chip "Todas" e um
chip por categoria retornada pela API.

**Rationale**: Não exige dependência de picker, exibe todas as categorias, funciona bem
no Expo Web e deixa o filtro ativo visível. Com 9 categorias, o scrolling horizontal é
adequado.

**Alternatives considered**:
- `Picker` nativo: dependência e comportamento diferente entre web e mobile.
- Modal com lista: mais passos para filtrar e mais código.
- Lista fixa na tela: divergiria das categorias retornadas pela API.

## D-111: Formatação de preço

**Decision**: Criar `Utils/formatacao.ts` com `formatarPrecoCentavos`, usando
`Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.

**Rationale**: Produz `R$ 49,90` e lida com separador de milhares. `Intl` está
disponível no Hermes/Expo Web modernos.

**Alternatives considered**:
- Concatenação manual: simples, mas não formata milhares e é mais fácil de errar.
- Biblioteca de formatação: dependência desnecessária.

## D-112: Navegação para detalhes

**Decision**: Passar o objeto `Produto` completo em `DetalhesProduto: { produto:
Produto }`.

**Rationale**: A tela provisória só precisa de imagem, nome e identificação. O objeto é
serializável, evita uma requisição extra e não adiciona estados de carregamento/erro.

**Alternatives considered**:
- Passar apenas `produtoId` e buscar `GET /produtos/:id`: mais fiel a uma futura tela de
  detalhes, mas adiciona complexidade fora do escopo provisório.

## D-113: Logout no cabeçalho

**Decision**: Manter um cabeçalho customizado na `CatalogoScreen` com o título, o e-mail
do usuário e um botão "Sair" que usa `useAuth().sair`, com estado de carregamento e erro.

**Rationale**: Atende ao FR-023 e reaproveita a lógica de logout já existente na Home,
sem depender de customização do header nativo.

**Alternatives considered**:
- `headerRight` do React Navigation: exigiria habilitar/estilizar o header nativo e
  comunicar erro de logout para a tela.
- Remover o logout: contraria o requisito.

## D-114: Proteção de acesso

**Decision**: Manter a decisão de pilha exclusivamente no `AppNavigator`, com base no
`AuthContext`. Nenhuma tela do catálogo verifica autenticação manualmente.

**Rationale**: A proteção existente já funciona e a constituição pede preservação do
código. A troca de pilha após logout remove o catálogo do histórico.

**Alternatives considered**:
- Verificar `usuario` na tela: duplicaria a regra e poderia divergir do navegador.

## D-115: Estratégia de testes

**Decision**: Não adicionar framework de testes. Validar com `npm run typecheck` e o
roteiro manual de `quickstart.md`.

**Rationale**: O projeto é acadêmico, não possui infraestrutura de testes e a
especificação não exige automação. O roteiro cobre carregamento, busca, filtros, erros,
navegação e logout.

**Alternatives considered**:
- Jest + React Native Testing Library: configuração e dependências adicionais;
  pode ser introduzido em uma etapa futura.

## Unknowns resolvidos

| Desconhecido | Resolução |
|--------------|-----------|
| Como acessar a API com segurança? | URL e chave em `EXPO_PUBLIC_*`, lidas por `Config/apiConfig.ts`; chave fora do Git. |
| Como representar categorias atualizadas? | Tipos exportados + union com as 9 categorias; opções vindas de `/categorias`. |
| Como evitar respostas antigas? | `AbortController` + verificação da requisição atual. |
| Como manter a lista em falhas posteriores? | Estado de erro separado e lista anterior preservada. |
| Como exibir categorias sem picker? | Chips horizontais com "Todas". |
| Como formatar centavos? | `Intl.NumberFormat` em `Utils/formatacao.ts`. |
| O que passar para os detalhes? | Objeto `Produto` completo. |
| Onde fica o logout? | Cabeçalho customizado da `CatalogoScreen`. |
