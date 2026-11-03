# Feature Specification: Detalhes do Produto

**Feature Branch**: `004-detalhes-produto`
**Created**: 2026-11-03
**Status**: Draft
**Input**: User description: "Implementar uma tela de detalhes do produto no aplicativo de loja virtual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar detalhes completos do produto (Priority: P1)

Um cliente autenticado seleciona um produto no catálogo e é levado à tela de detalhes,
onde visualiza a imagem em tamanho maior, o nome, a descrição completa, o preço formatado
em reais e a quantidade disponível em estoque. Enquanto os detalhes são carregados, recebe
um estado de carregamento; se houver falha, vê uma mensagem em português com opção de
tentar novamente; se o produto não existir mais, vê uma mensagem específica e pode voltar.

**Why this priority**: É o núcleo da funcionalidade: sem visualizar as informações
completas e atualizadas do produto, o usuário não consegue decidir com segurança antes de
adicioná-lo ao carrinho.

**Independent Test**: Pode ser testada autenticando-se, selecionando um produto no
catálogo e conferindo todos os campos exibidos, o formato do preço, o estoque, o estado de
carregamento, a falha com nova tentativa, o produto não encontrado e a imagem
indisponível.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado no catálogo, **When** seleciona um produto, **Then**
   a tela de detalhes do produto selecionado é aberta.
2. **Given** a tela de detalhes aberta, **When** os dados ainda estão sendo carregados,
   **Then** um estado de carregamento é exibido e nenhum dado de outro produto aparece.
3. **Given** o carregamento concluído, **When** a tela é exibida, **Then** são mostrados
   imagem em tamanho maior, nome, descrição completa, preço em reais e estoque disponível.
4. **Given** um produto com preço de `19990` centavos, **When** o preço é exibido, **Then**
   aparece como `R$ 199,90`.
5. **Given** uma descrição longa, **When** o usuário rola a tela, **Then** consegue ler a
   descrição integralmente.
6. **Given** que a imagem do produto não pôde ser carregada, **When** a tela é exibida,
   **Then** um espaço reservado é mostrado sem esconder nome, descrição, preço e estoque.
7. **Given** que a consulta dos detalhes falhou, **When** a tela é exibida, **Then** uma
   mensagem de erro em português é apresentada com opção de tentar novamente.
8. **Given** que a nova tentativa é acionada e a consulta responde com sucesso, **When** o
   carregamento termina, **Then** os detalhes corretos são exibidos.
9. **Given** que o produto não existe mais, **When** a consulta responde com ausência,
   **Then** uma mensagem informa que o produto não está disponível e o usuário pode voltar
   ao catálogo.

---

### User Story 2 - Adicionar o produto ao carrinho pelos detalhes (Priority: P1)

Um cliente autenticado adiciona o produto ao carrinho diretamente pela tela de detalhes,
usando a integração de carrinho já existente. A adição usa quantidade inicial 1, incrementa
a quantidade se o produto já estiver no carrinho, atualiza o contador global e exibe
confirmação. Quando não há estoque, a adição é impedida e o usuário é informado.

**Why this priority**: É a ação que conecta a consulta detalhada à compra, completando o
fluxo de decisão do usuário.

**Independent Test**: Pode ser testada adicionando um produto com estoque, conferindo o
feedback e o contador do carrinho; repetindo a adição para verificar o incremento;
testando produto esgotado, falha de rede, rejeição por estoque e toques repetidos.

**Acceptance Scenarios**:

1. **Given** um produto com estoque disponível, **When** o usuário aciona "Adicionar ao
   carrinho", **Then** o produto é adicionado com quantidade 1, o contador do carrinho é
   atualizado e uma confirmação visual é exibida.
2. **Given** um produto que já está no carrinho, **When** o usuário o adiciona novamente,
   **Then** a quantidade existente é incrementada e a interface reflete o novo valor.
3. **Given** um produto sem estoque disponível, **When** a tela é exibida, **Then** a ação
   de adicionar fica indisponível e o estado "esgotado" é informado.
4. **Given** que a API rejeita a adição por estoque insuficiente, **When** a operação
   termina em erro, **Then** o carrinho permanece no estado anterior e uma mensagem
   amigável é exibida.
5. **Given** uma adição em andamento, **When** o usuário toca novamente no botão, **Then**
   nenhuma requisição duplicada é enviada e o botão permanece indisponível até o término.
6. **Given** uma falha de rede durante a adição, **When** a operação termina, **Then** o
   item não é adicionado, o carrinho anterior permanece e o usuário pode tentar novamente.
7. **Given** uma adição concluída com sucesso, **When** o usuário abre o carrinho, **Then**
   o produto aparece com os dados corretos.

---

### User Story 3 - Manter catálogo e carrinho consistentes (Priority: P2)

Ao voltar dos detalhes para o catálogo, o usuário encontra a busca, o filtro por categoria
e a posição da lista preservados. O carrinho continua funcionando normalmente, cada usuário
vê apenas o próprio carrinho e respostas atrasadas de uma consulta anterior não sobrescrevem
a tela atual.

**Why this priority**: Garante que a nova tela não degrade a experiência já existente nem a
consistência entre catálogo, detalhes e carrinho.

**Independent Test**: Pode ser testada aplicando busca e filtro, abrindo detalhes, voltando
e conferindo a preservação; alternando usuários; e navegando rapidamente entre produtos
para verificar que respostas atrasadas são descartadas.

**Acceptance Scenarios**:

1. **Given** um catálogo com busca, categoria e posição aplicadas, **When** o usuário abre
   os detalhes e retorna, **Then** a busca, a categoria e a posição são preservadas.
2. **Given** um produto adicionado pelos detalhes, **When** o usuário acessa o carrinho,
   **Then** as operações existentes do carrinho continuam funcionando normalmente.
3. **Given** dois usuários autenticados em momentos diferentes, **When** cada um acessa os
   detalhes e o carrinho, **Then** cada um vê somente os próprios dados.
4. **Given** que o usuário troca de produto antes da consulta anterior terminar, **When** a
   resposta atrasada chega, **Then** ela é descartada e os dados do produto atual
   permanecem.
5. **Given** que o usuário sai da conta durante o carregamento, **When** a resposta chega,
   **Then** o estado da sessão anterior é descartado.

### Edge Cases

- Produto removido do catálogo entre a seleção e a consulta: informar indisponibilidade e
  oferecer retorno ao catálogo.
- Estoque alterado entre o carregamento dos detalhes e a adição: tratar a rejeição da API
  e manter o carrinho anterior.
- Estoque zero: impedir a adição e indicar que o produto está esgotado.
- Estoque menor que a quantidade desejada: impedir a adição e informar a indisponibilidade.
- Produto já presente no carrinho: descontar as unidades já adicionadas ao indicar a
  disponibilidade para nova adição.
- Descrição vazia ou muito longa: exibir o conteúdo disponível com rolagem e sem quebrar o
  layout.
- Nome muito longo: manter a leitura e o layout legíveis.
- Imagem indisponível: exibir espaço reservado sem esconder as demais informações.
- Falha de rede no carregamento dos detalhes: exibir erro em português com nova tentativa.
- Resposta da API em formato inesperado ou inválida: tratar como erro sem quebrar a tela.
- Chave de acesso ausente, inválida ou não autorizada: exibir mensagem amigável sem expor a
  chave ou detalhes técnicos.
- Toques repetidos em "Adicionar ao carrinho": evitar requisições duplicadas.
- Navegação de volta durante o carregamento: cancelar ou descartar a consulta pendente.
- Logout durante uma operação: descartar o estado da sessão anterior.
- Valores monetários em centavos: converter corretamente para reais.
- Usuário não autenticado: direcionar para a área de autenticação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o usuário acesse os detalhes ao selecionar um
  produto no catálogo.
- **FR-002**: O sistema DEVE consultar as informações atualizadas do produto selecionado
  por meio do identificador do produto.
- **FR-003**: O sistema DEVE exibir a imagem do produto em tamanho maior.
- **FR-004**: O sistema DEVE exibir o nome do produto.
- **FR-005**: O sistema DEVE exibir a descrição completa do produto, permitindo rolagem
  quando necessário.
- **FR-006**: O sistema DEVE exibir o preço formatado em reais no padrão brasileiro,
  convertendo corretamente os centavos recebidos.
- **FR-007**: O sistema DEVE exibir a quantidade disponível em estoque de forma clara.
- **FR-008**: O sistema DEVE apresentar a disponibilidade para nova adição considerando as
  unidades do produto já presentes no carrinho, quando essa informação estiver disponível.
- **FR-009**: O sistema DEVE exibir um estado de carregamento durante a consulta dos
  detalhes e evitar exibir dados parciais ou de outro produto.
- **FR-010**: O sistema DEVE exibir uma mensagem de erro em português com opção de tentar
  novamente quando a consulta dos detalhes falhar.
- **FR-011**: O sistema DEVE tratar o caso de produto não encontrado com mensagem
  específica e opção de retornar ao catálogo.
- **FR-012**: O sistema DEVE exibir uma indicação visual quando a imagem não puder ser
  carregada, mantendo nome, descrição, preço e estoque visíveis.
- **FR-013**: O sistema DEVE disponibilizar uma ação para adicionar o produto ao carrinho a
  partir da tela de detalhes.
- **FR-014**: O sistema DEVE reutilizar a funcionalidade e o serviço de carrinho existentes
  para adicionar o produto, sem criar uma nova integração.
- **FR-015**: O sistema DEVE adicionar o produto com quantidade inicial 1 e incrementar a
  quantidade existente quando o produto já estiver no carrinho.
- **FR-016**: O sistema DEVE impedir a adição quando não houver estoque disponível e
  informar que o produto está esgotado.
- **FR-017**: O sistema DEVE impedir requisições duplicadas enquanto uma adição estiver em
  andamento e indicar visualmente a operação.
- **FR-018**: O sistema DEVE exibir confirmação visual após uma adição bem-sucedida e
  atualizar o contador do carrinho.
- **FR-019**: O sistema DEVE tratar a rejeição da API por estoque insuficiente sem alterar
  o carrinho exibido e com mensagem amigável.
- **FR-020**: O sistema DEVE tratar falhas de rede ou da API durante a adição com mensagem
  em português e possibilidade de nova tentativa.
- **FR-021**: O sistema DEVE preservar a busca, o filtro por categoria e a posição da lista
  do catálogo ao navegar para os detalhes e retornar.
- **FR-022**: O sistema DEVE preservar o funcionamento existente do catálogo e do carrinho.
- **FR-023**: O sistema DEVE descartar respostas atrasadas de consultas anteriores quando o
  usuário troca de produto, sai da tela ou encerra a sessão.
- **FR-024**: O sistema DEVE permitir o acesso aos detalhes apenas para usuários
  autenticados, direcionando visitantes para a área de autenticação.
- **FR-025**: O sistema DEVE enviar a credencial de acesso configurada em todas as
  requisições protegidas, sem expor a chave ou detalhes técnicos na interface.
- **FR-026**: O sistema DEVE manter o isolamento por usuário nas operações de carrinho
  acionadas a partir dos detalhes.

### Key Entities

- **Produto**: representa o item do catálogo exibido nos detalhes; possui identificador,
  nome, descrição, preço em centavos, categoria, estoque e imagem.
- **Estado dos Detalhes**: representa a situação atual da tela; inclui produto carregado,
  carregamento, erro, disponibilidade de estoque e operação de adição em andamento.
- **Item do Carrinho**: representa o produto dentro do carrinho após a adição; possui
  identificador do produto, nome, preço unitário, imagem, quantidade e subtotal.
- **Operação de Adição**: representa a ação de adicionar o produto pelos detalhes; possui
  estado de andamento, resultado e eventual mensagem de erro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente autenticado acessa os detalhes de um produto em 1 toque a partir
  do catálogo.
- **SC-002**: 100% das informações exibidas nos detalhes correspondem ao produto
  selecionado.
- **SC-003**: 100% dos preços são exibidos no formato brasileiro `R$ 0,00`.
- **SC-004**: Em condições normais de conexão, os detalhes ficam visíveis em até 3 segundos.
- **SC-005**: Adições bem-sucedidas são refletidas na interface em até 1 segundo.
- **SC-006**: 100% das tentativas de adicionar produto sem estoque são impedidas.
- **SC-007**: 100% dos cenários de erro testados exibem mensagem em português sem quebrar a
  tela e permitem nova tentativa quando aplicável.
- **SC-008**: 100% dos retornos dos detalhes para o catálogo preservam busca, categoria e
  posição da lista.
- **SC-009**: 100% das operações de carrinho existentes continuam funcionando após a
  inclusão da tela de detalhes.
- **SC-010**: Toques repetidos durante uma adição geram no máximo uma requisição efetiva.
- **SC-011**: 100% das descrições longas podem ser lidas integralmente por rolagem.

## Out of Scope

- Implementar novas funcionalidades de carrinho.
- Alterar o checkout, formas de pagamento ou histórico de compras.
- Criar seleção de quantidade na tela de detalhes (a quantidade inicial é 1 e os ajustes
  ocorrem no carrinho).
- Edição, cadastro ou remoção de produtos e categorias.
- Avaliações, comentários, recomendações e produtos relacionados.
- Reserva de estoque entre a visualização e a finalização da compra.
- Persistência local, cache ou uso offline dos detalhes.
- Cupons, descontos, frete, impostos e cálculo de promoções.

## Assumptions

- A autenticação e a proteção das telas internas já estão implementadas; esta feature
  reaproveita a sessão existente e o identificador único do usuário autenticado.
- A API expõe a consulta de um produto por identificador (`GET /produtos/:id`) e retorna
  identificador, nome, descrição, preço em centavos, categoria, estoque e imagem.
- Todas as requisições protegidas enviam o cabeçalho `x-api-key` com a chave configurada no
  ambiente do aplicativo.
- Os preços são fornecidos pela API em centavos e devem ser apresentados em reais no padrão
  brasileiro.
- A adição pelos detalhes usa quantidade inicial 1; os ajustes de quantidade são feitos na
  tela do carrinho.
- A tela de detalhes considera as unidades já presentes no carrinho ao indicar a
  disponibilidade para nova adição, mantendo consistência com o catálogo.
- Após uma adição bem-sucedida, o usuário permanece na tela de detalhes e recebe
  confirmação visual, sem redirecionamento automático para o carrinho.
- O carrinho é a fonte da verdade para os itens e totais; não haverá persistência local dos
  detalhes.
- As chamadas à API permanecem centralizadas na camada de serviços e as rotas continuam
  organizadas na configuração existente, sem chamadas diretas nas telas.
- A tela de detalhes existente deve ser preservada e evoluída, reaproveitando a navegação,
  os componentes e os padrões visuais já presentes no aplicativo.
- O catálogo, a autenticação, o carrinho e os componentes visuais existentes devem ser
  preservados e reaproveitados quando fizer sentido.
- A interface segue a paleta azul e os padrões visuais já usados no aplicativo.
- Existe apenas um tipo de usuário: o cliente autenticado da loja.
- O usuário possui conectividade com a internet ao utilizar a tela de detalhes.
