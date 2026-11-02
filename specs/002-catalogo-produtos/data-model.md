# Data Model: Catálogo de Produtos

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02

## Entidades

### Produto

Representa um item retornado por `GET /produtos`. Reutiliza o tipo `Produto` de
`Carrinho/Types/types.ts`.

| Campo | Tipo | Obrigatório | Origem | Descrição |
|-------|------|-------------|--------|-----------|
| `id` | `number` | Sim | API | Identificador único do produto |
| `nome` | `string` | Sim | API | Nome exibido no card e nos detalhes |
| `descricao` | `string` | Sim | API | Descrição do produto (não exibida nesta etapa) |
| `preco` | `number` | Sim | API | Preço em centavos |
| `categoria` | `Categoria` | Sim | API | Identificador da categoria |
| `estoque` | `number` | Sim | API | Quantidade disponível (não bloqueia a listagem) |
| `imagem` | `string` | Sim | API | URL absoluta da imagem |

**Regras**:
- O preço é sempre tratado como centavos e convertido apenas na apresentação.
- Produtos com estoque zero continuam sendo exibidos.
- A imagem pode falhar; nesse caso o card mostra um placeholder e mantém nome/preço.
- O objeto `Produto` é serializável e pode ser passado como parâmetro de navegação.

### Categoria

Representa o identificador de classificação usado pelo produto.

```ts
type Categoria =
  | "eletronicos"
  | "roupas"
  | "casa"
  | "livros"
  | "cervejas"
  | "carnes"
  | "refrigerantes"
  | "chocolates"
  | "cachorro-quente";
```

**Regras**:
- A lista exibida no filtro vem de `GET /categorias`, não de uma constante local.
- A union serve para tipagem; se a API adicionar categorias, o tipo deve ser atualizado.
- Uma categoria inválida retorna HTTP 400 e é tratada como erro de consulta.

### CategoriaDisponivel

Item retornado por `GET /categorias`, usado para montar os chips.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `Categoria` | Sim | Identificador enviado em `?categoria=` |
| `nome` | `string` | Sim | Nome de exibição do chip |

### Filtros do Catálogo

Estado aplicado à consulta de produtos.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `busca` | `string` | Sim | Termo já aparado; vazio significa ausência de busca |
| `categoria` | `Categoria \| null` | Sim | Categoria selecionada; `null` significa "Todas" |

**Regras**:
- `busca` é aparada com `trim`; termos apenas com espaços viram `""`.
- A busca é enviada como digitada (sem remover acentos), pois a API é sensível a acentos
  e insensível a maiúsculas/minúsculas.
- `categoria` vazia (`null`) não é enviada na query.
- A consulta combina os dois filtros quando ambos estão ativos.
- Limpar os filtros restaura a consulta sem parâmetros.

### Erro de Catálogo

Falha compreensível para o usuário, no mesmo formato aceito por
`Utils/erros.ts`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo` | `string` | Código interno (`rede`, `http_400`, `http_404`, `http_500`, `resposta_invalida`, etc.) |
| `mensagem` | `string` | Mensagem em português exibida na tela |

**Regras**:
- Mensagens não incluem stack trace, corpo bruto da API ou a chave de acesso.
- Erros de cancelamento (`AbortError`) não são convertidos em erro de tela.
- O código é útil para depuração e não precisa ser exibido ao usuário.

### Estado do Catálogo

Estado mantido pela `CatalogoScreen`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `busca` | `string` | Texto atual do campo de busca |
| `buscaAplicada` | `string` | Termo efetivamente usado na consulta após o debounce |
| `categoriaSelecionada` | `Categoria \| null` | Categoria ativa ou "Todas" |
| `produtos` | `Produto[]` | Última lista carregada com sucesso |
| `categorias` | `CategoriaDisponivel[]` | Categorias disponíveis para o filtro |
| `carregandoInicial` | `boolean` | Primeira carga de produtos em andamento |
| `atualizando` | `boolean` | Busca/filtro em andamento com lista já visível |
| `erroProdutos` | `string \| null` | Erro atual de produtos |
| `erroCategorias` | `string \| null` | Erro atual de categorias |
| `saindo` | `boolean` | Logout em andamento |
| `erroLogout` | `string \| null` | Falha ao sair |

**Regras**:
- `carregandoInicial` e `atualizando` nunca devem ser `true` ao mesmo tempo.
- `erroProdutos` pode coexistir com uma lista não vazia (falha posterior).
- `erroCategorias` não impede a exibição dos produtos.
- `busca` pode divergir de `buscaAplicada` durante os 300 ms de debounce.
- `categorias` vazio sem erro significa "não há categorias para filtrar".

## Relacionamentos

```text
CategoriaDisponivel 1 ─── 0..N Produto       (pelo identificador `categoria`)
Filtros do Catálogo 1 ─── 0..N Produto       (consulta aplicada na API)
Estado do Catálogo  1 ─── 1 Filtros          (filtros ativos)
Estado do Catálogo  1 ─── 0..N Produto       (última lista carregada)
Estado do Catálogo  1 ─── 0..N CategoriaDisponivel
Estado do Catálogo  1 ─── 0..1 Erro de Catálogo (produtos)
Estado do Catálogo  1 ─── 0..1 Erro de Catálogo (categorias)
```

- Um produto pertence a exatamente uma categoria.
- Uma categoria pode ter zero ou vários produtos.
- A lista de categorias pode estar vazia sem impedir a listagem de produtos.
- O objeto passado para os detalhes é o mesmo `Produto` da lista.

## Regras de validação

| Regra | Campo | Condição | Comportamento |
|-------|-------|----------|---------------|
| RV-101 | Busca | Apenas espaços | Tratar como ausência de busca |
| RV-102 | Categoria | `null` | Não enviar `?categoria=` |
| RV-103 | Resposta de produtos | Não é array | Lançar `ErroCatalogo` de resposta inválida |
| RV-104 | Item de produto | Campo obrigatório ausente ou tipo incorreto | Lançar `ErroCatalogo` de resposta inválida |
| RV-105 | Resposta de categorias | Não é array de `{ id, nome }` | Lançar `ErroCatalogo` de resposta inválida |
| RV-106 | Preço | Número de centavos | Formatar como `R$ 0,00`; não alterar o valor original |
| RV-107 | Tentativa duplicada | Requisição já em andamento | Ignorar novo toque em "Tentar novamente" |
| RV-108 | Logout | Já em andamento | Ignorar novo toque em "Sair" |

## Transições de estado

### Carregamento de produtos

```text
[inicial]
   │ acessa o catálogo
   ▼
[carregandoInicial] ── sucesso ──▶ [lista exibida]
   │                                   │
   │ falha                             │ busca/filtro
   ▼                                   ▼
[erro em tela cheia]              [atualizando + lista visível]
   │                                   │
   │ tentar novamente                  ├── sucesso ──▶ [lista atualizada]
   └──────────────▶ [carregandoInicial]└── falha ────▶ [lista anterior + erro inline]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Inicial | Acesso ao catálogo | Carregando inicial | Indicador em tela cheia |
| Carregando inicial | Sucesso | Lista exibida | Renderiza cards ou estado vazio |
| Carregando inicial | Falha | Erro em tela cheia | Mensagem + "Tentar novamente" |
| Lista exibida | Busca/filtro | Atualizando | Mantém a lista e mostra indicador discreto |
| Atualizando | Sucesso | Lista atualizada | Substitui os produtos e limpa o erro |
| Atualizando | Falha | Lista anterior + erro | Mantém os produtos e mostra erro inline |
| Lista anterior + erro | "Tentar novamente" | Atualizando | Reaplica os filtros atuais |
| Lista exibida | Texto/filtro limpo | Atualizando | Consulta sem parâmetros |

### Carregamento de categorias

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Inicial | Acesso ao catálogo | Carregando categorias | Chips ficam indisponíveis |
| Carregando categorias | Sucesso | Categorias disponíveis | Exibe "Todas" + categorias |
| Carregando categorias | Falha | Erro de categorias | Erro na área de filtros, produtos intactos |
| Erro de categorias | "Tentar novamente" | Carregando categorias | Nova requisição de categorias |
| Categorias disponíveis | Lista vazia | Sem categorias | Informa que não há categorias para filtrar |

### Autenticação

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Autenticado | Logout com sucesso | Não autenticado | `AuthContext` troca a pilha e descarta o catálogo |
| Autenticado | Logout com falha | Autenticado | Mantém a tela e exibe mensagem de erro |
| Autenticado | Sessão invalidada | Não autenticado | Retorna à autenticação |

## Observações de implementação

- `Produto` e `Categoria` serão exportados de `Types/types.ts`.
- `CategoriaDisponivel`, `FiltrosCatalogo` e `ErroCatalogo` ficarão em
  `Types/catalogo.ts`.
- O estado fica na `CatalogoScreen`; não há contexto global para o catálogo.
- A lista anterior é preservada porque `produtos` só é substituído em caso de sucesso.
- A posição da `FlatList` é mantida ao voltar dos detalhes, pois a tela permanece na
  pilha de navegação.
