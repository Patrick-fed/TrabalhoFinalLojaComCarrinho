# Feature Specification: Carrinho de Compras

**Feature Branch**: `003-carrinho-compras`
**Created**: 2026-11-02
**Status**: Draft
**Input**: User description: "Implementar a funcionalidade de carrinho de compras no aplicativo de loja virtual."

## Clarifications

### Session 2026-11-02

- Q: Onde o usuário deve adicionar produtos ao carrinho nesta etapa? → A: Pelo card do catálogo, com quantidade inicial 1; os ajustes de quantidade são feitos na tela do carrinho.
- Q: Deve existir uma ação para limpar todo o carrinho? → A: Sim, com confirmação antes de esvaziar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar o carrinho (Priority: P1)

Um cliente autenticado acessa o carrinho pelo cabeçalho do catálogo e visualiza os
produtos que adicionou, com imagem, nome, preço unitário, quantidade e subtotal de cada
item. Também vê a quantidade total de itens e o valor total da compra. Enquanto os dados
são carregados, recebe um estado de carregamento; se houver falha, vê uma mensagem em
português com opção de tentar novamente; se o carrinho estiver vazio, vê uma mensagem
adequada.

**Why this priority**: É a base da funcionalidade: sem visualizar o carrinho e seus
valores, o usuário não consegue acompanhar ou revisar a compra.

**Independent Test**: Pode ser testada autenticando-se, adicionando itens previamente ou
usando um carrinho já existente, abrindo a tela do carrinho e conferindo itens,
quantidades, subtotais, totais, estado vazio, carregamento e erro com nova tentativa.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado no catálogo, **When** aciona a opção de carrinho,
   **Then** a tela do carrinho é aberta com os dados do carrinho desse usuário.
2. **Given** um carrinho com itens, **When** o carregamento termina, **Then** cada item
   exibe imagem, nome, preço unitário, quantidade e subtotal, e o resumo exibe a
   quantidade total e o valor total.
3. **Given** um preço unitário de `4990` centavos e quantidade 2, **When** o item é
   exibido, **Then** o preço unitário aparece como `R$ 49,90` e o subtotal como
   `R$ 99,80`.
4. **Given** um carrinho vazio, **When** o carregamento termina, **Then** é exibida uma
   mensagem informando que não há produtos no carrinho.
5. **Given** que a consulta do carrinho falhou, **When** a tela é exibida, **Then** é
   apresentada uma mensagem de erro em português com opção de tentar novamente.
6. **Given** que a nova tentativa é acionada e a API responde com sucesso, **When** o
   carregamento termina, **Then** os itens e totais são exibidos corretamente.
7. **Given** que o usuário retorna do carrinho para o catálogo, **When** o catálogo é
   exibido novamente, **Then** a busca, a categoria e a posição da lista continuam
   preservadas.

---

### User Story 2 - Adicionar produtos pelo catálogo (Priority: P1)

Um cliente autenticado adiciona um produto ao carrinho diretamente pelo card do
catálogo. A adição usa a quantidade inicial 1 e, se o produto já estiver no carrinho, a
quantidade existente é incrementada. Após a operação, o contador do carrinho e os totais
refletem o novo estado.

**Why this priority**: É a ação que abastece o carrinho e permite que todas as demais
funcionalidades de compra sejam utilizadas.

**Independent Test**: Pode ser testada acionando “Adicionar” em um card, verificando o
feedback de sucesso, o contador do cabeçalho e o item na tela do carrinho; repetindo a
adição para conferir o incremento e testando produto esgotado e falha de estoque.

**Acceptance Scenarios**:

1. **Given** um produto disponível no catálogo, **When** o usuário aciona “Adicionar” no
   card, **Then** o produto é adicionado com quantidade 1, o contador do carrinho é
   atualizado e o usuário recebe confirmação visual da operação.
2. **Given** um produto que já está no carrinho, **When** o usuário o adiciona novamente,
   **Then** a quantidade do item é incrementada pela API e a interface exibe o novo
   valor.
3. **Given** um produto sem estoque, **When** o usuário tenta adicioná-lo, **Then** a
   adição não é realizada e uma mensagem informa que o produto está esgotado.
4. **Given** que a API rejeita a adição por estoque insuficiente, **When** a operação
   termina em erro, **Then** o carrinho permanece no estado anterior e uma mensagem
   amigável é exibida.
5. **Given** uma adição em andamento, **When** o usuário toca novamente no botão, **Then**
   nenhuma requisição duplicada é enviada e o botão permanece indisponível até o término.
6. **Given** uma falha de rede durante a adição, **When** a operação termina, **Then** o
   item não é adicionado, o carrinho anterior permanece e o usuário pode tentar
   novamente.
7. **Given** uma adição concluída com sucesso, **When** o usuário abre o carrinho,
   **Then** o produto aparece com nome, imagem, preço unitário, quantidade e subtotal
   corretos.

---

### User Story 3 - Alterar quantidade e remover itens (Priority: P2)

Um cliente autenticado aumenta ou diminui a quantidade de um produto no carrinho ou
remove o item individualmente. Os subtotais, a quantidade total e o valor total são
atualizados após cada operação, e a quantidade nunca fica abaixo de 1.

**Why this priority**: Permite ajustar a compra antes da finalização e corrigir escolhas
feitas no catálogo.

**Independent Test**: Pode ser testada alterando quantidades para mais e para menos,
tentando reduzir abaixo de 1, removendo itens e conferindo a atualização dos valores e do
estado vazio após remover o último item.

**Acceptance Scenarios**:

1. **Given** um item com quantidade 2, **When** o usuário aumenta a quantidade, **Then** a
   quantidade é atualizada pela API e o subtotal e os totais são recalculados.
2. **Given** um item com quantidade 1, **When** o usuário tenta diminuir, **Then** a
   operação é impedida e a quantidade permanece em 1.
3. **Given** um item no carrinho, **When** o usuário o remove, **Then** o item deixa de ser
   exibido e a quantidade total e o valor total são atualizados.
4. **Given** que o último item foi removido, **When** a operação termina, **Then** o
   carrinho exibe o estado vazio com totais zerados.
5. **Given** uma alteração de quantidade ou remoção em andamento, **When** o usuário
   repete a ação, **Then** apenas uma requisição é processada e os controles ficam
   indisponíveis durante a operação.
6. **Given** que a API rejeita a nova quantidade por falta de estoque, **When** a operação
   falha, **Then** a quantidade anterior é mantida e uma mensagem orienta o usuário.
7. **Given** uma falha de rede durante a alteração ou remoção, **When** a operação
   termina, **Then** os dados anteriores permanecem visíveis e o usuário pode tentar
   novamente.

---

### User Story 4 - Limpar o carrinho (Priority: P2)

Um cliente autenticado decide esvaziar todo o carrinho e, antes da remoção, recebe uma
confirmação para evitar perda acidental dos itens.

**Why this priority**: Evita remoções acidentais e oferece uma forma rápida de reiniciar a
compra, usando uma operação já prevista pela API.

**Independent Test**: Pode ser testada abrindo um carrinho com itens, acionando “Limpar
carrinho”, cancelando a confirmação e conferindo que nada mudou; depois confirmando e
verificando o estado vazio e os totais zerados.

**Acceptance Scenarios**:

1. **Given** um carrinho com itens, **When** o usuário aciona “Limpar carrinho”, **Then**
   uma confirmação é exibida antes de qualquer remoção.
2. **Given** a confirmação exibida, **When** o usuário confirma, **Then** todos os itens
   são removidos, os totais ficam zerados e o estado vazio é exibido.
3. **Given** a confirmação exibida, **When** o usuário cancela, **Then** o carrinho
   permanece inalterado.
4. **Given** um carrinho vazio, **When** a tela é exibida, **Then** a ação de limpar não
   é oferecida ou permanece indisponível.
5. **Given** uma falha ao limpar o carrinho, **When** a operação termina, **Then** os itens
   anteriores permanecem e uma mensagem de erro é exibida.

---

### User Story 5 - Garantir isolamento por usuário e continuidade (Priority: P3)

Cada cliente autenticado visualiza e modifica somente o próprio carrinho. Ao sair da
conta, o estado do carrinho é descartado, e um novo usuário não vê os dados do usuário
anterior.

**Why this priority**: Protege a privacidade e garante que o carrinho corresponda ao
usuário autenticado, mesmo com troca de conta no mesmo dispositivo.

**Independent Test**: Pode ser testada com duas contas diferentes, adicionando itens em
cada uma, alternando o login e verificando que cada usuário vê apenas o próprio carrinho.
Também pode ser testada saindo da conta durante o uso e conferindo que o carrinho não
reaparece para outro usuário.

**Acceptance Scenarios**:

1. **Given** dois usuários autenticados em momentos diferentes, **When** cada um acessa o
   carrinho, **Then** cada usuário vê somente os itens do próprio carrinho.
2. **Given** um usuário com itens no carrinho, **When** ele sai da conta, **Then** o estado
   do carrinho é descartado da sessão atual.
3. **Given** que outro usuário entra na sequência, **When** abre o carrinho, **Then** ele
   vê o próprio carrinho, sem itens do usuário anterior.
4. **Given** que a autenticação ou a chave de acesso é invalidada, **When** uma operação
   do carrinho é tentada, **Then** o acesso é negado com mensagem amigável, sem expor
   detalhes técnicos.
5. **Given** que o usuário fecha e reabre o aplicativo mantendo a sessão, **When** acessa o
   carrinho, **Then** os dados são carregados novamente da API para o usuário autenticado.

### Edge Cases

- Carrinho vazio retornado pela API: exibir mensagem de carrinho vazio e totais zerados.
- Produto com estoque zero: impedir a adição e informar que o produto está esgotado.
- Estoque menor que a quantidade solicitada: manter a quantidade anterior e informar a
  indisponibilidade.
- Estoque alterado entre a adição e uma nova operação: tratar o erro da API e preservar o
  carrinho exibido.
- Produto removido do catálogo, mas ainda presente no carrinho: continuar exibindo o item
  com os dados retornados pelo carrinho.
- Falha de rede durante o carregamento inicial: exibir erro em português com opção de
  tentar novamente.
- Falha de rede durante adição, alteração, remoção ou limpeza: manter os dados anteriores
  e permitir nova tentativa.
- Resposta da API em formato inesperado ou inválida: tratar como erro sem quebrar a tela.
- Chave de API ausente, inválida ou não autorizada: exibir mensagem amigável sem expor a
  chave ou detalhes técnicos.
- Toques repetidos em “Adicionar”, “Aumentar”, “Diminuir”, “Remover” ou “Limpar”: evitar
  requisições duplicadas e desabilitar a ação enquanto estiver em andamento.
- Remoção do último item: exibir estado vazio e totais zerados.
- Carrinho com muitos itens ou nomes longos: manter a lista rolável e legível.
- Imagem de produto indisponível: exibir placeholder sem esconder nome, preço e
  quantidades.
- Logout durante uma operação do carrinho: descartar o estado do usuário anterior e não
  aplicar respostas atrasadas à nova sessão.
- Reabertura do aplicativo: recarregar o carrinho da API, sem depender de dados locais.
- Valores monetários em centavos: converter corretamente para reais em todos os itens e
  totais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir o acesso ao carrinho apenas para usuários
  autenticados, direcionando visitantes para a área de autenticação.
- **FR-002**: O sistema DEVE identificar o carrinho pelo identificador único do usuário
  autenticado em todas as consultas e operações.
- **FR-003**: O sistema DEVE disponibilizar o acesso ao carrinho no cabeçalho da área
  principal autenticada, exibindo a quantidade total de itens.
- **FR-004**: O sistema DEVE buscar o carrinho do usuário na API ao abrir a tela ou quando
  os dados precisarem ser atualizados.
- **FR-005**: O sistema DEVE exibir cada item do carrinho com imagem, nome, preço
  unitário, quantidade e subtotal.
- **FR-006**: O sistema DEVE exibir a quantidade total de itens e o valor total do
  carrinho.
- **FR-007**: O sistema DEVE apresentar todos os valores monetários em reais no formato
  brasileiro, convertendo corretamente os centavos recebidos da API.
- **FR-008**: O sistema DEVE exibir uma mensagem adequada quando o carrinho estiver vazio.
- **FR-009**: O sistema DEVE permitir adicionar um produto ao carrinho a partir do card do
  catálogo, com quantidade inicial 1.
- **FR-010**: O sistema DEVE atualizar a quantidade de um produto já existente no carrinho
  quando ele for adicionado novamente.
- **FR-011**: O sistema DEVE fornecer confirmação visual após uma adição bem-sucedida e
  atualizar o contador do carrinho.
- **FR-012**: O sistema DEVE impedir a adição de produto sem estoque e informar o usuário.
- **FR-013**: O sistema DEVE tratar a rejeição da API por estoque insuficiente sem alterar
  o carrinho exibido.
- **FR-014**: O sistema DEVE impedir requisições duplicadas enquanto uma adição estiver em
  andamento.
- **FR-015**: O sistema DEVE permitir aumentar ou diminuir a quantidade de cada item do
  carrinho.
- **FR-016**: O sistema DEVE impedir que a quantidade de um item fique abaixo de 1.
- **FR-017**: O sistema DEVE atualizar a quantidade do item na API e refletir o novo
  subtotal, a quantidade total e o valor total.
- **FR-018**: O sistema DEVE tratar a rejeição da API quando a quantidade solicitada
  exceder o estoque disponível, mantendo a quantidade anterior.
- **FR-019**: O sistema DEVE permitir remover individualmente um item do carrinho.
- **FR-020**: O sistema DEVE permitir limpar todo o carrinho somente após uma confirmação
  do usuário.
- **FR-021**: O sistema DEVE atualizar a quantidade total, os subtotais e o valor total
  após cada adição, alteração, remoção ou limpeza bem-sucedida.
- **FR-022**: O sistema DEVE exibir estado de carregamento durante a consulta inicial do
  carrinho e indicar operações em andamento durante adições, alterações, remoções e
  limpeza.
- **FR-023**: O sistema DEVE exibir mensagens de erro em português para falhas de rede,
  erros da API, estoque insuficiente, acesso não autorizado e respostas inválidas, sem
  expor detalhes técnicos ou a chave de acesso.
- **FR-024**: O sistema DEVE oferecer opção de nova tentativa quando o carregamento do
  carrinho falhar e permitir repetir operações que falharem.
- **FR-025**: O sistema DEVE preservar os dados anteriores do carrinho quando uma adição,
  alteração, remoção ou limpeza falhar, evitando atualizações parciais.
- **FR-026**: O sistema DEVE manter uma visão única e consistente do carrinho entre o
  catálogo, o cabeçalho e a tela do carrinho, evitando cópias divergentes.
- **FR-027**: O sistema DEVE atualizar o contador de itens do cabeçalho após cada operação
  bem-sucedida no carrinho.
- **FR-028**: O sistema DEVE descartar o estado do carrinho ao sair da conta e impedir que
  um novo usuário visualize dados do usuário anterior.
- **FR-029**: O sistema DEVE preservar a busca, o filtro por categoria e a posição da lista
  do catálogo ao navegar para o carrinho e retornar.
- **FR-030**: O sistema DEVE desabilitar as ações de adicionar, alterar, remover e limpar
  enquanto a respectiva operação estiver em andamento.
- **FR-031**: O sistema DEVE exibir uma indicação visual quando a imagem de um item não
  puder ser carregada, mantendo nome, preço e quantidades visíveis.
- **FR-032**: O sistema DEVE continuar exibindo um item presente no carrinho mesmo que ele
  não esteja mais disponível no catálogo, usando os dados retornados pela API do carrinho.
- **FR-033**: O sistema DEVE tratar um carrinho vazio retornado pela API como sucesso, e
  não como erro.
- **FR-034**: O sistema DEVE impedir que uma resposta atrasada de uma operação anterior
  sobrescreva o estado atual do carrinho ou de outra sessão.

### Key Entities

- **Carrinho**: representa a compra em andamento de um usuário; possui o identificador do
  usuário, a lista de itens, a quantidade total de itens e o valor total.
- **Item do Carrinho**: representa um produto dentro do carrinho; possui identificador do
  produto, nome, preço unitário, imagem, quantidade e subtotal.
- **Produto**: representa o item do catálogo que pode ser adicionado ao carrinho; fornece
  identificador, nome, imagem, preço e estoque disponível para a operação de adição.
- **Operação do Carrinho**: representa uma ação de adicionar, alterar quantidade, remover
  ou limpar; possui estado de andamento, resultado e eventual mensagem de erro.
- **Estado do Carrinho**: representa a situação atual da funcionalidade; inclui itens,
  totais, carregamento, erros e operações em andamento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente autenticado consegue adicionar um produto ao carrinho em no
  máximo 2 toques a partir do catálogo.
- **SC-002**: 100% dos subtotais, da quantidade total e do valor total exibidos após uma
  operação correspondem aos valores retornados pela API.
- **SC-003**: 100% dos valores monetários são exibidos no formato brasileiro `R$ 0,00`.
- **SC-004**: Em 100% dos testes, a quantidade de um item nunca fica abaixo de 1.
- **SC-005**: Operações bem-sucedidas de adicionar, alterar, remover ou limpar são
  refletidas na interface em até 1 segundo em condições normais de conexão.
- **SC-006**: 100% dos usuários autenticados visualizam e modificam somente o próprio
  carrinho.
- **SC-007**: 100% dos cenários de erro testados exibem mensagem em português sem quebrar
  a tela e permitem nova tentativa quando aplicável.
- **SC-008**: Em 100% dos testes de estoque insuficiente, o carrinho anterior permanece
  inalterado.
- **SC-009**: 100% dos testes de carrinho vazio, remoção do último item e limpeza exibem o
  estado vazio com totais zerados.
- **SC-010**: 100% das adições de um produto já existente incrementam a quantidade
  existente em vez de criar um item duplicado.
- **SC-011**: Toques repetidos durante uma operação geram no máximo uma requisição
  efetiva.
- **SC-012**: 100% dos retornos do carrinho para o catálogo preservam busca, categoria e
  posição da lista.
- **SC-013**: Após logout, 100% dos novos acessos de outro usuário exibem apenas o
  carrinho dele, sem dados da sessão anterior.
- **SC-014**: Ao reabrir o aplicativo com a sessão ativa, o carrinho é recarregado da API
  em 100% dos testes com conectividade disponível.

## Out of Scope

- Seleção de formas de pagamento.
- Finalização da compra e criação ou confirmação de pedidos.
- Histórico de compras.
- Especificação e implementação completas da tela de detalhes do produto.
- Cupons, descontos, frete, impostos e cálculo de promoções.
- Reserva de estoque entre a adição ao carrinho e a finalização da compra.
- Persistência local ou uso offline do carrinho.
- Edição, cadastro ou remoção de produtos e categorias.
- Notificações, recomendações e produtos relacionados.
- Múltiplos carrinhos por usuário.

## Assumptions

- A autenticação e a proteção das telas internas já estão implementadas; esta feature
  reaproveita a sessão existente e o identificador único do usuário autenticado.
- A API fornecida é a fonte da verdade para o carrinho e expõe consulta, adição de item,
  atualização de quantidade, remoção individual e limpeza total.
- A consulta do carrinho retorna o identificador do usuário, a lista de itens, a
  quantidade total e o valor total; cada item inclui identificador do produto, nome,
  preço unitário, imagem, quantidade e subtotal.
- Para adicionar um item, o aplicativo envia o identificador do produto e a quantidade
  desejada; para atualizar, envia a nova quantidade. Os formatos exatos dos dados serão
  confirmados na etapa de planejamento.
- A adição pelo catálogo usa quantidade inicial 1; o usuário ajusta a quantidade na tela
  do carrinho.
- A limpeza total do carrinho exige confirmação do usuário.
- O carrinho é acessado pelo cabeçalho da área principal autenticada, com indicação da
  quantidade total de itens.
- Não haverá persistência local do carrinho: os dados ficam em memória durante o uso e são
  recarregados da API usando o usuário autenticado. A sessão do Firebase continua
  persistindo normalmente.
- Os preços são fornecidos pela API em centavos e devem ser apresentados em reais no
  padrão brasileiro.
- A chave de acesso à API está configurada no ambiente do aplicativo e é enviada em todas
  as requisições protegidas.
- As chamadas à API permanecem centralizadas na camada de serviços e as rotas continuam
  organizadas na configuração existente, sem chamadas diretas nas telas.
- O catálogo, a autenticação e os componentes visuais existentes devem ser preservados e
  reaproveitados quando fizer sentido.
- A interface segue a paleta azul e os padrões visuais já usados no aplicativo.
- Existe apenas um tipo de usuário: o cliente autenticado da loja.
- O usuário possui conectividade com a internet ao utilizar o carrinho.
- O volume de itens por carrinho é pequeno e não requer paginação nesta etapa.
