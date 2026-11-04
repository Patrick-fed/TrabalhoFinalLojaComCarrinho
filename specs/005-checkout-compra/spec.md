# Feature Specification: Checkout e Confirmação de Compra

**Feature Branch**: `005-checkout-compra`
**Created**: 2026-11-03
**Status**: Draft
**Input**: User description: "Implementar o fluxo de checkout e confirmação de compra no aplicativo de loja virtual."

## Clarifications

### Session 2026-11-04

- Q: Após a loja confirmar a compra, como o carrinho deve ser esvaziado? → A: O app chama `DELETE /carrinho/:usuarioId` após o sucesso e atualiza o `CarrinhoContext`; se a limpeza falhar, mantém a confirmação e atualiza ao retornar.
- Q: Ao abrir o checkout, de onde devem vir os itens e valores exibidos? → A: Buscar o carrinho na API ao abrir o checkout e novamente antes de confirmar a compra.
- Q: Como tratar divergência entre os valores revisados e o carrinho atual? → A: Reconsultar o carrinho antes de confirmar e comparar itens/total; se divergir, atualizar o resumo e exigir nova confirmação.
- Q: Qual o formato das formas de pagamento retornadas pela loja? → A: Identificadores (`pix`, `cartao`, `boleto`); o app exibe rótulos fixos em português (Pix, Cartão, Boleto).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisar o carrinho e escolher a forma de pagamento (Priority: P1)

Um cliente autenticado, com produtos no carrinho, aciona a opção de finalizar a compra e
chega ao checkout. Lá revisa cada produto com nome, quantidade, preço unitário e subtotal,
confere o valor total e vê as formas de pagamento disponíveis carregadas pela loja. O
cliente escolhe apenas uma forma de pagamento e só consegue prosseguir depois de
selecioná-la. Se o carrinho estiver vazio, o acesso ao checkout é impedido.

**Why this priority**: É a etapa de revisão e decisão: sem conferir os valores e escolher
como pagar, o cliente não consegue concluir a compra com segurança.

**Independent Test**: Pode ser testada com o carrinho preenchido, abrindo o checkout e
conferindo itens, quantidades, preços, subtotais e total; verificando o carregamento das
formas de pagamento, a seleção única e o bloqueio sem seleção; e tentando abrir o checkout
com o carrinho vazio.

**Acceptance Scenarios**:

1. **Given** um cliente autenticado com itens no carrinho, **When** aciona a opção de
   finalizar a compra, **Then** o checkout é aberto com o resumo da compra.
2. **Given** um carrinho vazio, **When** o cliente tenta acessar o checkout, **Then** o
   acesso é impedido e uma mensagem informa que é necessário adicionar produtos.
3. **Given** o checkout aberto, **When** o resumo é exibido, **Then** cada produto mostra
   nome, quantidade, preço unitário e subtotal, e o total da compra é apresentado.
4. **Given** que o carrinho foi alterado antes de abrir o checkout, **When** o resumo é
   exibido, **Then** os valores correspondem ao estado atual do carrinho.
5. **Given** o checkout aberto, **When** as formas de pagamento são carregadas, **Then** as
   opções retornadas pela loja são apresentadas.
6. **Given** as formas de pagamento exibidas, **When** o cliente seleciona uma opção,
   **Then** somente essa opção permanece selecionada.
7. **Given** nenhuma forma de pagamento selecionada, **When** o cliente tenta finalizar,
   **Then** a finalização é impedida e uma mensagem solicita a seleção.
8. **Given** que o carregamento das formas de pagamento falha, **When** o checkout é
   exibido, **Then** uma mensagem em português é apresentada com opção de tentar novamente.
9. **Given** que as formas de pagamento estão sendo carregadas, **When** o checkout é
   exibido, **Then** um estado de carregamento é mostrado sem permitir a finalização.

---

### User Story 2 - Finalizar a compra e visualizar a confirmação (Priority: P1)

Um cliente autenticado confirma a compra com a forma de pagamento escolhida. A loja
registra o pedido e devolve os dados da compra. O cliente é levado a uma tela de
confirmação com o identificador do pedido, os produtos comprados, as quantidades, o valor
total, a forma de pagamento e o status. O carrinho fica vazio somente depois que a loja
confirma o sucesso, e o cliente pode retornar ao catálogo. Toques repetidos não geram
compras duplicadas e falhas mantêm o carrinho para nova tentativa.

**Why this priority**: É a entrega de valor do fluxo: concluir a compra e receber a
confirmação oficial da loja.

**Independent Test**: Pode ser testada selecionando uma forma de pagamento, confirmando a
compra e verificando o registro, os dados da confirmação, o carrinho vazio, o retorno ao
catálogo, o bloqueio de envios duplicados e o comportamento em falhas.

**Acceptance Scenarios**:

1. **Given** uma forma de pagamento selecionada e o carrinho preenchido, **When** o cliente
   confirma a compra, **Then** a compra é registrada pela loja com o usuário autenticado e
   a forma de pagamento escolhida.
2. **Given** a compra registrada com sucesso, **When** a confirmação é exibida, **Then** o
   identificador do pedido, os produtos, as quantidades, o total, a forma de pagamento e o
   status vêm dos dados retornados pela loja.
3. **Given** a compra registrada com sucesso, **When** o cliente retorna ao catálogo,
   **Then** o carrinho está vazio e o catálogo funciona normalmente.
4. **Given** uma compra em andamento, **When** o cliente toca novamente em confirmar,
   **Then** nenhuma compra adicional é enviada e a ação permanece bloqueada até o término.
5. **Given** que a loja rejeita a compra, **When** a operação termina em erro, **Then** o
   carrinho permanece inalterado e uma mensagem compreensível é exibida.
6. **Given** uma falha de rede durante a finalização, **When** a operação termina, **Then**
   a compra não é confirmada, o carrinho permanece e o cliente pode tentar novamente.
7. **Given** que a confirmação é exibida, **When** o cliente aciona "Voltar ao catálogo",
   **Then** é levado ao catálogo sem retornar ao checkout da compra concluída.
8. **Given** que o cliente sai da conta durante a finalização, **When** a resposta chega,
   **Then** o estado da sessão anterior é descartado e nenhuma confirmação é exibida.

---

### User Story 3 - Manter a consistência do checkout com o carrinho e a sessão (Priority: P2)

O checkout reflete alterações do carrinho, impede compras com carrinho vazio ou desatualizado
e não perde nem duplica dados em falhas, navegação ou troca de usuário. Autenticação,
catálogo, detalhes e carrinho continuam funcionando como antes.

**Why this priority**: Evita compras incorretas, cobranças duplicadas e vazamento de estado
entre usuários, preservando a confiança no fluxo.

**Independent Test**: Pode ser testada alterando o carrinho antes de finalizar, esvaziando o
carrinho, simulando falhas e respostas atrasadas, alternando usuários e voltando ao
catálogo.

**Acceptance Scenarios**:

1. **Given** o checkout aberto, **When** o carrinho muda antes da finalização, **Then** o
   resumo e o total refletem o estado atual e, se os valores divergirem dos revisados, o
   cliente deve confirmar novamente.
2. **Given** que o carrinho fica vazio antes da finalização, **When** o cliente tenta
   confirmar, **Then** a compra é impedida e o cliente é informado.
3. **Given** uma falha na finalização, **When** o cliente retorna ao checkout, **Then** os
   itens e valores anteriores permanecem disponíveis.
4. **Given** dois usuários autenticados em momentos diferentes, **When** cada um acessa o
   checkout, **Then** cada um vê somente o próprio carrinho e os próprios pedidos.
5. **Given** que o cliente sai da conta durante o checkout, **When** retorna autenticado,
   **Then** nenhum dado da sessão anterior é exibido.
6. **Given** que o cliente volta durante uma finalização em andamento, **When** a operação
   termina, **Then** nenhuma confirmação ou compra duplicada é apresentada.
7. **Given** as telas de autenticação, catálogo, detalhes e carrinho, **When** o checkout é
   adicionado, **Then** todas continuam funcionando normalmente.

### Edge Cases

- Carrinho vazio ao tentar abrir o checkout: impedir o acesso e orientar a adicionar itens.
- Carrinho esvaziado por outra ação enquanto o checkout está aberto: impedir a finalização.
- Carrinho alterado entre a revisão e a confirmação: reconsultar o carrinho, comparar
  itens e total e, se divergir, atualizar o resumo e exigir nova confirmação antes de
  registrar a compra.
- Formas de pagamento indisponíveis, vazias ou em formato inesperado: informar e permitir
  nova tentativa sem quebrar a tela.
- Falha de rede ao carregar formas de pagamento: mensagem em português e nova tentativa.
- Nenhuma forma de pagamento selecionada: bloquear a finalização e solicitar a seleção.
- Forma de pagamento removida da lista após ser selecionada: limpar a seleção inválida.
- Forma de pagamento com identificador desconhecido: não selecionar automaticamente nem
  inventar rótulo; exibir o valor retornado ou tratar como indisponível.
- Toques repetidos em confirmar: enviar no máximo uma compra.
- Rejeição da loja por estoque, dados inválidos ou indisponibilidade: manter o carrinho e
  exibir mensagem amigável.
- Tempo esgotado ou conexão interrompida durante a compra: não limpar o carrinho e permitir
  nova tentativa.
- Resposta da compra em formato inesperado: não exibir confirmação inventada; informar erro.
- Compra confirmada, mas falha no `DELETE /carrinho/:usuarioId`: exibir a confirmação com os
  dados da loja e atualizar o carrinho ao retornar.
- Saída da conta durante a compra: descartar o estado da sessão anterior.
- Voltar durante a finalização: não duplicar a compra nem perder a confirmação.
- Valores monetários em centavos: apresentar corretamente em reais.
- Produtos com nomes longos ou muitos itens: manter o layout legível e permitir rolagem.
- Status de compra desconhecido: exibir o valor retornado pela loja sem inventar dados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar, no carrinho, uma opção para avançar ao
  checkout.
- **FR-002**: O sistema DEVE impedir o acesso ao checkout quando o carrinho estiver vazio,
  informando o cliente.
- **FR-003**: O sistema DEVE exibir no checkout todos os produtos presentes no carrinho.
- **FR-004**: O sistema DEVE exibir, para cada produto, nome, quantidade, preço unitário e
  subtotal.
- **FR-005**: O sistema DEVE exibir o valor total da compra.
- **FR-006**: O sistema DEVE consultar o carrinho na API ao abrir o checkout e novamente
  antes de confirmar, garantindo que os valores exibidos correspondam ao estado atual do
  carrinho.
- **FR-007**: O sistema DEVE buscar as formas de pagamento disponíveis na loja.
- **FR-008**: O sistema DEVE apresentar as formas de pagamento retornadas pela loja. As
  formas são identificadas por `pix`, `cartao` e `boleto` e exibidas com os rótulos em
  português Pix, Cartão e Boleto.
- **FR-009**: O sistema DEVE permitir a seleção de somente uma forma de pagamento por vez.
- **FR-010**: O sistema DEVE exigir uma forma de pagamento selecionada antes de permitir a
  finalização.
- **FR-011**: O sistema DEVE registrar a compra na loja usando o identificador do usuário
  autenticado e a forma de pagamento selecionada. A forma de pagamento é enviada pelo
  identificador retornado pela loja.
- **FR-012**: O sistema DEVE impedir o envio de compras duplicadas enquanto uma finalização
  estiver em andamento.
- **FR-013**: O sistema DEVE tratar erros da loja durante o carregamento de formas de
  pagamento e durante a finalização, exibindo mensagens compreensíveis em português.
- **FR-014**: O sistema DEVE utilizar os dados retornados pela loja para compor a
  confirmação da compra, sem inventar informações.
- **FR-015**: O sistema DEVE apresentar o identificador do pedido na confirmação.
- **FR-016**: O sistema DEVE apresentar os produtos comprados e suas quantidades na
  confirmação.
- **FR-017**: O sistema DEVE apresentar o valor total da compra na confirmação.
- **FR-018**: O sistema DEVE apresentar a forma de pagamento utilizada na confirmação.
- **FR-019**: O sistema DEVE apresentar o status da compra retornado pela loja.
- **FR-020**: O sistema DEVE disponibilizar uma opção para retornar ao catálogo a partir da
  confirmação.
- **FR-021**: O sistema DEVE esvaziar o carrinho via `DELETE /carrinho/:usuarioId` somente
  após a confirmação de sucesso da compra pela loja e atualizar o estado local; se a
  limpeza falhar, a confirmação permanece e o carrinho é atualizado ao retornar.
- **FR-022**: O sistema DEVE preservar o carrinho quando a finalização falhar ou for
  cancelada.
- **FR-023**: O sistema DEVE exibir estados de carregamento durante a busca de formas de
  pagamento e durante a finalização.
- **FR-024**: O sistema DEVE permitir nova tentativa quando o carregamento das formas de
  pagamento falhar.
- **FR-025**: O sistema NÃO DEVE solicitar, armazenar ou exibir dados de cartão, senhas
  bancárias ou informações financeiras reais.
- **FR-026**: O sistema DEVE permitir o acesso ao checkout apenas para usuários
  autenticados.
- **FR-027**: O sistema DEVE enviar a credencial de acesso configurada em todas as
  requisições protegidas, sem expor a chave ou detalhes técnicos na interface.
- **FR-028**: O sistema DEVE preservar o funcionamento da autenticação, catálogo, detalhes
  do produto e carrinho.
- **FR-029**: O sistema DEVE refletir no checkout alterações feitas no carrinho antes da
  finalização.
- **FR-030**: O sistema DEVE descartar respostas atrasadas ou de sessões anteriores que não
  correspondam ao usuário e ao checkout atuais.
- **FR-031**: O sistema DEVE impedir a finalização quando o carrinho estiver vazio no
  momento da confirmação.
- **FR-032**: O sistema DEVE apresentar valores monetários no padrão brasileiro.
- **FR-033**: O sistema DEVE indicar claramente a forma de pagamento selecionada.
- **FR-034**: O sistema DEVE tratar respostas da loja em formato inesperado como erro, sem
  quebrar a tela nem exibir dados inventados.
- **FR-035**: O sistema DEVE permitir que o cliente revise a compra antes de confirmar,
  sem iniciar a finalização automaticamente.
- **FR-036**: O sistema DEVE comparar itens e total revisados com o carrinho reconsultado
  antes da confirmação; se houver divergência, atualizar o resumo e exigir nova confirmação
  explícita.

### Key Entities

- **Carrinho**: conjunto atual de produtos do cliente autenticado; é a fonte da verdade
  para itens, quantidades, subtotais e total exibidos no checkout.
- **Item do Carrinho**: produto no carrinho, com identificador, nome, preço unitário,
  quantidade e subtotal.
- **Forma de Pagamento**: opção disponibilizada pela loja para pagar a compra; possui
  identificador retornado pela loja (`pix`, `cartao`, `boleto`) e rótulo em português
  exibido pelo app; o cliente escolhe exatamente uma entre as disponíveis.
- **Compra**: pedido registrado pela loja ao finalizar; contém identificador, usuário,
  itens, quantidade total, valor total, forma de pagamento, status e data de criação.
- **Estado do Checkout**: situação atual da tela; inclui carregamento das formas de
  pagamento, forma selecionada, finalização em andamento, erros e confirmação.
- **Confirmação da Compra**: apresentação dos dados oficiais da compra retornados pela
  loja após o sucesso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente autenticado acessa o checkout a partir do carrinho preenchido em
  até 1 toque.
- **SC-002**: 100% dos itens, quantidades, preços unitários, subtotais e total exibidos no
  checkout correspondem ao carrinho atual.
- **SC-003**: 100% dos valores monetários são exibidos no padrão brasileiro `R$ 0,00`.
- **SC-004**: Em condições normais de conexão, as formas de pagamento ficam disponíveis em
  até 3 segundos.
- **SC-005**: Em condições normais de conexão, a compra é confirmada e apresentada em até
  3 segundos após a finalização.
- **SC-006**: 100% das tentativas de finalizar sem forma de pagamento selecionada são
  impedidas.
- **SC-007**: 100% das tentativas de acessar ou finalizar com carrinho vazio são impedidas.
- **SC-008**: Toques repetidos durante a finalização geram no máximo uma compra registrada.
- **SC-009**: 100% das confirmações exibem dados retornados pela loja, sem informações
  inventadas.
- **SC-010**: 100% das compras concluídas com sucesso resultam em carrinho vazio; falhas
  preservam o carrinho anterior.
- **SC-011**: 100% dos cenários de erro testados exibem mensagem em português sem quebrar a
  tela e permitem nova tentativa quando aplicável.
- **SC-012**: 100% dos retornos da confirmação levam ao catálogo sem reabrir o checkout da
  compra concluída.
- **SC-013**: 100% das funcionalidades existentes de autenticação, catálogo, detalhes e
  carrinho continuam operando após a inclusão do checkout.
- **SC-014**: 100% das divergências detectadas entre revisão e confirmação exigem nova
  confirmação antes de registrar a compra.
- **SC-015**: 100% das formas de pagamento retornadas pela loja são exibidas com rótulo em
  português para os identificadores conhecidos.

## Assumptions

- A autenticação e a proteção das telas internas já estão implementadas; esta feature
  reaproveita a sessão existente e o identificador único do usuário autenticado.
- A loja expõe a consulta de formas de pagamento e o registro de compras; as requisições
  protegidas enviam o cabeçalho `x-api-key` com a chave configurada no ambiente.
- A compra é registrada com o identificador do usuário autenticado e a forma de pagamento
  escolhida.
- A loja retorna identificadores (`pix`, `cartao`, `boleto`) e o app exibe os rótulos fixos
  em português Pix, Cartão e Boleto.
- O pagamento é apenas uma simulação; não há integração com bancos, gateways ou cobranças
  reais.
- Nenhum dado de cartão, senha bancária ou informação financeira real é solicitado,
  armazenado ou exibido.
- O carrinho existente é a fonte da verdade para itens e valores; o checkout não mantém uma
  cópia independente.
- O carrinho é esvaziado via `DELETE /carrinho/:usuarioId` apenas após a loja confirmar o
  sucesso da compra, e o estado local é atualizado em seguida.
- A confirmação usa exclusivamente os dados retornados pela loja.
- O checkout e a confirmação são telas internas, acessíveis somente a usuários
  autenticados.
- Após a confirmação, o cliente permanece na tela de confirmação até escolher voltar ao
  catálogo; não há redirecionamento automático.
- A confirmação não deve ser reaberta pelo histórico de navegação após retornar ao catálogo.
- Os preços são fornecidos em centavos e apresentados em reais no padrão brasileiro.
- Existe apenas um tipo de usuário: o cliente autenticado da loja.
- O cliente possui conectividade com a internet ao utilizar o checkout.
- A interface segue a paleta azul e os padrões visuais já usados no aplicativo.
- Não há histórico de compras, cancelamento, estorno, cupons, frete, impostos ou cálculo de
  promoções nesta feature.
- O catálogo, os detalhes do produto, o carrinho, a autenticação e os componentes visuais
  existentes devem ser preservados e reaproveitados quando fizer sentido.

## Out of Scope

- Pagamentos reais ou integração com instituições financeiras e gateways.
- Solicitação, armazenamento ou validação de dados de cartão ou credenciais bancárias.
- Histórico de compras, cancelamento, estorno ou reembolso.
- Edição de produtos, quantidades ou cupons dentro do checkout.
- Frete, impostos, descontos e promoções.
- Cadastro de formas de pagamento ou preferências de pagamento.
- Notificações por e-mail, SMS ou push sobre a compra.
- Persistência local, cache ou uso offline do checkout e da confirmação.
