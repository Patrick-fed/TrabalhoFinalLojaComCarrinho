# Feature Specification: Catálogo de Produtos

**Feature Branch**: `002-catalogo-produtos`
**Created**: 2026-11-01
**Status**: Draft
**Input**: User description: "Criar a funcionalidade de catálogo de produtos do aplicativo da loja virtual. O catálogo deve estar disponível apenas para usuários autenticados e deve utilizar a API fornecida para obter os produtos e as categorias disponíveis."

## Clarifications

### Session 2026-11-01

- Q: Quando uma nova consulta (busca ou filtro) falhar depois que o catálogo já carregou? → A: Manter a lista atual visível e exibir o erro com "Tentar novamente" junto aos filtros.
- Q: Qual o tempo de espera após o usuário parar de digitar para disparar a busca? → A: 300 ms.
- Q: Onde o catálogo deve ficar na navegação autenticada? → A: Substitui a Home provisória, com logout acessível no cabeçalho.
- Q: O que a tela provisória de detalhes deve exibir? → A: Imagem, nome do produto e aviso de que os detalhes serão implementados depois.
- Q: Como exibir o carregamento durante buscas e trocas de filtro? → A: Tela cheia apenas no carregamento inicial; nas trocas, manter a lista com indicador discreto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar o catálogo de produtos (Priority: P1)

Um usuário autenticado acessa a área principal da loja e visualiza a lista de produtos
disponíveis, com imagem, nome e preço formatado em reais. Enquanto os dados iniciais são
carregados, ele vê um estado de carregamento em tela cheia. Se o carregamento falhar, vê
uma mensagem de erro com a opção de tentar novamente. Se não houver produtos, vê uma
mensagem informando que o catálogo está vazio.

**Why this priority**: É a funcionalidade central do catálogo e a base para busca,
filtros e acesso aos detalhes do produto.

**Independent Test**: Pode ser testada autenticando-se, acessando a área principal e
verificando a lista de produtos com imagem, nome e preço em reais, além dos estados de
carregamento, erro com nova tentativa e catálogo vazio.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa o catálogo, **Then** é exibido um
   estado de carregamento em tela cheia enquanto os produtos são buscados.
2. **Given** que a API retornou produtos, **When** o carregamento termina, **Then** a
   lista é exibida com cada produto em um card contendo imagem, nome e preço no formato
   `R$ 0,00`.
3. **Given** que existem mais produtos do que cabem na tela, **When** o usuário rola a
   lista, **Then** os demais produtos ficam acessíveis sem perder a posição dos já
   exibidos.
4. **Given** que a API falha ao carregar os produtos, **When** o catálogo é aberto,
   **Then** é exibida uma mensagem de erro em português com uma opção para tentar
   carregar novamente.
5. **Given** que a primeira tentativa falhou, **When** o usuário aciona a nova
   tentativa e a API responde com sucesso, **Then** os produtos são exibidos
   normalmente.
6. **Given** que a API responde sem nenhum produto, **When** o carregamento termina,
   **Then** é exibida uma mensagem informando que não há produtos disponíveis.
7. **Given** um visitante não autenticado, **When** tenta acessar o catálogo, **Then**
   o acesso é bloqueado e ele é direcionado para a área de autenticação.
8. **Given** um produto cujo preço na API é `4990` (centavos), **When** o card é
   exibido, **Then** o preço aparece como `R$ 49,90`.

---

### User Story 2 - Buscar produtos pelo nome (Priority: P2)

Um usuário autenticado digita parte do nome de um produto e o catálogo passa a exibir
apenas os produtos correspondentes ao termo pesquisado, mantendo a possibilidade de
limpar a busca e voltar a ver todos os produtos.

**Why this priority**: A busca por nome é uma das formas principais de encontrar
produtos em um catálogo.

**Independent Test**: Pode ser testada digitando um termo conhecido e verificando que
apenas os produtos correspondentes aparecem, além do estado sem resultados e da
restauração da lista ao limpar o termo.

**Acceptance Scenarios**:

1. **Given** o catálogo carregado, **When** o usuário digita um termo no campo de
   busca, **Then** após 300 ms sem digitação a lista exibe apenas os produtos
   correspondentes ao termo.
2. **Given** que a busca não encontrou produtos, **When** o carregamento termina,
   **Then** é exibida uma mensagem informando que nenhum produto corresponde à busca.
3. **Given** uma busca ativa, **When** o usuário limpa o termo, **Then** o catálogo
   volta a exibir todos os produtos disponíveis.
4. **Given** uma busca ativa, **When** o usuário digita rapidamente e as respostas
   chegam fora de ordem, **Then** a lista exibe o resultado correspondente ao termo
   mais recente.
5. **Given** um termo composto apenas por espaços, **When** a busca é processada,
   **Then** ele é tratado como ausência de busca e todos os produtos são exibidos.

---

### User Story 3 - Filtrar produtos por categoria (Priority: P2)

Um usuário autenticado visualiza todas as categorias disponíveis e seleciona uma para
ver apenas os produtos daquela categoria, podendo trocar ou remover o filtro depois.

**Why this priority**: O filtro por categoria permite navegar pelo catálogo de forma
direcionada, sem depender de conhecer o nome exato de um produto.

**Independent Test**: Pode ser testada abrindo a lista de categorias, selecionando uma
categoria e verificando que apenas os produtos dela aparecem, além de trocar e remover
o filtro.

**Acceptance Scenarios**:

1. **Given** o catálogo carregado, **When** o usuário abre a seleção de categorias,
   **Then** todas as categorias disponíveis retornadas pela API são exibidas.
2. **Given** as categorias exibidas, **When** o usuário seleciona uma categoria,
   **Then** a lista exibe apenas os produtos daquela categoria.
3. **Given** uma categoria selecionada, **When** o usuário seleciona outra categoria,
   **Then** a lista passa a exibir apenas os produtos da nova categoria.
4. **Given** uma categoria selecionada, **When** o usuário remove o filtro ou escolhe
   visualizar todas as categorias, **Then** o catálogo volta a exibir todos os
   produtos.
5. **Given** uma categoria sem produtos correspondentes, **When** o filtro é aplicado,
   **Then** é exibida uma mensagem informando que nenhum produto foi encontrado para
   os filtros atuais.
6. **Given** que as categorias não puderam ser carregadas, **When** o usuário tenta
   filtrar, **Then** é exibida uma mensagem de erro em português com opção de tentar
   novamente, sem esconder os produtos já exibidos.

---

### User Story 4 - Combinar busca e filtro por categoria (Priority: P3)

Um usuário autenticado utiliza simultaneamente a busca por nome e o filtro por
categoria para encontrar produtos específicos e, depois, limpa os filtros para voltar
a visualizar o catálogo completo.

**Why this priority**: A combinação dos filtros torna a busca mais precisa, mas depende
de a busca e o filtro por categoria já funcionarem isoladamente.

**Independent Test**: Pode ser testada aplicando uma busca e uma categoria ao mesmo
tempo e verificando que apenas os produtos que atendem aos dois critérios aparecem, e
que limpar os filtros restaura a lista completa.

**Acceptance Scenarios**:

1. **Given** uma categoria selecionada, **When** o usuário informa um termo de busca,
   **Then** a lista exibe apenas os produtos daquela categoria que correspondem ao
   termo.
2. **Given** busca e categoria ativas sem resultados em conjunto, **When** o
   carregamento termina, **Then** é exibida uma mensagem informando que nenhum produto
   corresponde aos filtros utilizados.
3. **Given** busca e categoria ativas, **When** o usuário limpa os dois filtros,
   **Then** o catálogo volta a exibir todos os produtos disponíveis.
4. **Given** filtros ativos, **When** o usuário altera apenas um dos filtros, **Then**
   o outro filtro continua aplicado.
5. **Given** que uma nova busca ou filtro falha após a lista já estar exibida, **When**
   a consulta termina em erro, **Then** a lista anterior permanece visível e um erro em
   português com opção de tentar novamente é exibido junto aos filtros.

---

### User Story 5 - Abrir os detalhes de um produto (Priority: P3)

Um usuário autenticado toca em um produto do catálogo e é direcionado para a
funcionalidade de detalhes daquele produto.

**Why this priority**: Conecta o catálogo ao restante do fluxo de compra; a tela de
detalhes será especificada e implementada separadamente.

**Independent Test**: Pode ser testada tocando em um produto e verificando que a
navegação ocorre para os detalhes do produto correto.

**Acceptance Scenarios**:

1. **Given** um produto exibido no catálogo, **When** o usuário toca no card, **Then**
   ele é direcionado para a tela provisória de detalhes com a identificação daquele
   produto, exibindo imagem, nome e aviso de que os detalhes serão implementados depois.
2. **Given** que o usuário retorna dos detalhes para o catálogo, **When** a tela é
   exibida novamente, **Then** a busca e o filtro por categoria anteriores continuam
   aplicados.
3. **Given** toques repetidos no mesmo card, **When** a navegação já foi iniciada,
   **Then** não são abertas várias telas de detalhes.

### Edge Cases

- A API responde com erro de acesso (chave ausente, inválida ou não autorizada): o
  catálogo exibe mensagem de erro em português e permite nova tentativa.
- A API responde com erro de recurso não encontrado, erro interno ou indisponibilidade:
  o catálogo exibe mensagem de erro compreensível e permite nova tentativa.
- Falha de conectividade durante o carregamento inicial, a busca ou a aplicação de
  filtros: o usuário vê mensagem de erro e pode tentar novamente.
- Falha em uma nova busca ou filtro depois que a lista já está exibida: a lista anterior
  permanece visível e o erro com opção de nova tentativa aparece junto aos filtros.
- Falha ao carregar as categorias: os produtos já exibidos permanecem visíveis e a área
  de filtros informa o erro com opção de nova tentativa.
- Resposta da API em formato inesperado ou inválido: o catálogo trata como erro, sem
  quebrar a tela.
- Busca com acentos, maiúsculas e minúsculas: o resultado segue o comportamento da API,
  sem tratamento local divergente.
- Produto com imagem indisponível ou com URL inválida: o card continua exibindo nome e
  preço, com indicação visual de imagem ausente.
- Nome de produto muito longo: o texto permanece legível no card sem sobrepor o preço.
- Lista de categorias vazia: o catálogo continua exibindo os produtos e informa que não
  há categorias para filtrar.
- Mudança de filtro enquanto uma requisição anterior está em andamento: apenas o
  resultado do filtro atual é exibido.
- Toques repetidos em “Tentar novamente” não devem gerar requisições simultâneas
  duplicadas.
- Logout ou perda de autenticação durante o uso do catálogo: o usuário deixa de acessar
  a funcionalidade e retorna à área de autenticação.
- Catálogo com produtos de estoque zero: os produtos continuam sendo exibidos conforme
  retornados pela API, pois o controle de disponibilidade para compra pertence a outra
  funcionalidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir o acesso ao catálogo apenas para usuários
  autenticados, redirecionando visitantes para a área de autenticação.
- **FR-002**: O sistema MUST buscar os produtos e as categorias disponíveis na API ao
  acessar o catálogo.
- **FR-003**: O sistema MUST exibir cada produto em um card com imagem, nome e preço.
- **FR-004**: O sistema MUST exibir o preço convertendo os centavos recebidos da API
  para o formato brasileiro `R$ 0,00`.
- **FR-005**: O sistema MUST apresentar os produtos em uma lista rolável capaz de
  exibir todos os itens retornados pela API.
- **FR-006**: O sistema MUST exibir um estado de carregamento em tela cheia durante o
  carregamento inicial e um indicador discreto, mantendo a lista visível, durante buscas
  e trocas de filtro.
- **FR-007**: O sistema MUST exibir um estado de erro em português quando não for
  possível carregar os produtos.
- **FR-008**: O sistema MUST disponibilizar, no estado de erro, uma opção para tentar
  carregar os produtos novamente.
- **FR-009**: O sistema MUST reaplicar os filtros ativos ao tentar carregar novamente.
- **FR-010**: O sistema MUST tratar respostas de erro da API, incluindo acesso não
  autorizado, recurso não encontrado, erro interno, indisponibilidade, falha de
  conectividade e resposta inválida, sem expor detalhes técnicos ao usuário.
- **FR-011**: O sistema MUST exibir uma mensagem adequada quando não houver produtos
  disponíveis ou quando nenhum produto corresponder aos filtros utilizados.
- **FR-012**: O sistema MUST permitir buscar produtos pelo nome.
- **FR-013**: O sistema MUST atualizar os resultados da busca enquanto o usuário digita,
  aguardando 300 ms sem digitação antes de consultar a API.
- **FR-014**: O sistema MUST tratar termos de busca vazios ou compostos apenas por
  espaços como ausência de busca.
- **FR-015**: O sistema MUST exibir todas as categorias disponíveis retornadas pela API
  para seleção do filtro.
- **FR-016**: O sistema MUST exibir apenas os produtos da categoria selecionada.
- **FR-017**: O sistema MUST permitir combinar a busca por nome com o filtro por
  categoria na mesma consulta.
- **FR-018**: O sistema MUST permitir remover, alterar ou limpar os filtros ativos,
  restaurando a lista de produtos correspondente ao estado dos filtros.
- **FR-019**: O sistema MUST indicar ao usuário quando houver busca ou categoria ativa.
- **FR-020**: O sistema MUST direcionar o usuário para a tela provisória de detalhes ao
  tocar em um produto, informando qual produto foi selecionado e exibindo imagem, nome e
  aviso de que os detalhes serão implementados depois.
- **FR-021**: O sistema MUST preservar a busca e o filtro por categoria ao retornar da
  tela de detalhes para o catálogo.
- **FR-022**: O sistema MUST evitar requisições duplicadas e descartar respostas de
  filtros que não correspondam ao estado atual da tela.
- **FR-023**: O sistema MUST manter acessível a saída da conta (logout) no cabeçalho da
  tela principal autenticada.
- **FR-024**: O sistema MUST exibir uma indicação visual quando a imagem de um produto
  não puder ser carregada, mantendo nome e preço visíveis.
- **FR-025**: O sistema MUST exibir mensagem de erro em português com opção de nova
  tentativa quando as categorias não puderem ser carregadas, sem esconder os produtos já
  exibidos.
- **FR-026**: O sistema MUST manter a lista anterior visível e exibir o erro com opção
  de nova tentativa junto aos filtros quando uma nova busca ou filtro falhar.

### Key Entities

- **Produto**: representa um item do catálogo; possui identificador, nome, descrição,
  preço em centavos, categoria, estoque e endereço da imagem. É exibido no card e
  identificado ao abrir os detalhes.
- **Categoria**: representa uma classificação disponível para filtrar produtos; possui
  um identificador e um nome de exibição, fornecidos pela API.
- **Filtros do Catálogo**: representa o estado atual de pesquisa; combina o termo de
  busca por nome e a categoria selecionada, podendo estar vazio, parcial ou completo.
- **Estado do Catálogo**: representa a situação atual da tela; inclui carregamento,
  erro, lista de produtos exibida, categorias disponíveis e filtros ativos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário autenticado consegue visualizar a lista de produtos ao abrir o
  catálogo em até 3 segundos em condições normais de conexão.
- **SC-002**: 100% dos preços exibidos seguem o formato `R$ 0,00`, com conversão correta
  de centavos para reais.
- **SC-003**: A busca é disparada após 300 ms sem digitação, e os resultados são
  atualizados em até 1 segundo depois disso.
- **SC-004**: 100% dos testes de seleção de categoria exibem apenas produtos da
  categoria escolhida.
- **SC-005**: 100% dos testes com busca e categoria combinadas exibem apenas produtos
  que atendem aos dois critérios.
- **SC-006**: 100% dos cenários de erro testados exibem mensagem em português e a opção
  de tentar novamente, sem quebrar a tela.
- **SC-007**: Após uma falha, a nova tentativa carrega os produtos quando a API volta a
  responder com sucesso.
- **SC-008**: 100% dos testes sem produtos ou sem correspondência exibem uma mensagem
  adequada ao usuário.
- **SC-009**: Limpar todos os filtros restaura a lista completa de produtos em 100% dos
  testes.
- **SC-010**: 100% dos toques em produtos abrem os detalhes do produto correto.
- **SC-011**: 100% dos testes de acesso ao catálogo sem autenticação são bloqueados e
  redirecionam para a autenticação.
- **SC-012**: Em 100% dos testes de falha após a lista já estar exibida, a lista anterior
  permanece visível com erro em português e opção de nova tentativa.

## Out of Scope

- Especificação e implementação completas da tela de detalhes do produto.
- Carrinho, pagamento, finalização de pedido e histórico de compras.
- Ordenação, paginação, favoritos, avaliações, recomendações e produtos relacionados.
- Cadastro, edição ou remoção de produtos e categorias.
- Cache offline, sincronização em segundo plano e notificações.
- Recuperação de senha, edição de perfil ou outras alterações na autenticação.

## Assumptions

- A autenticação e a proteção das telas internas já estão implementadas; esta feature
  reaproveita essa proteção e substitui a área principal provisória pelo catálogo,
  mantendo o logout acessível no cabeçalho.
- A API fornecida expõe a listagem de produtos com possibilidade de busca por nome e
  filtro por categoria, inclusive de forma combinada, e a listagem de categorias.
- A chave de acesso à API está configurada no ambiente do aplicativo e foi validada
  contra os endpoints de produtos e categorias.
- Os preços são fornecidos pela API em centavos e devem ser apresentados em reais no
  padrão brasileiro.
- A API retorna a lista completa de produtos, sem necessidade de paginação nesta etapa.
- A busca considera o comportamento da API para acentos e diferenças entre maiúsculas e
  minúsculas.
- Por requisito do trabalho e padrão do projeto, a listagem será implementada com
  `FlatList` e cada produto será exibido em um card tipado.
- A comunicação com a API permanece centralizada na camada de serviços do projeto, sem
  chamadas espalhadas pelas telas, e as rotas continuam organizadas na configuração
  existente.
- A tela de detalhes será especificada separadamente; nesta etapa existirá apenas uma
  rota/tela provisória que recebe o produto selecionado e exibe sua imagem, seu nome e um
  aviso de que os detalhes serão implementados depois.
- A busca aguarda 300 ms sem digitação antes de consultar a API.
- O carregamento inicial usa tela cheia; buscas e trocas de filtro mantêm a lista
  visível com um indicador discreto.
- Os usuários possuem conectividade com a internet ao utilizar o catálogo.
- A interface segue a paleta azul e os componentes visuais já existentes no projeto.
- Existe apenas um tipo de usuário: o cliente autenticado da loja.
