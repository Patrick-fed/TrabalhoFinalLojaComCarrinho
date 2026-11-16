# Feature Specification: Modo Escuro

**Feature Branch**: `006-modo-escuro`
**Created**: 2026-11-16
**Status**: Draft
**Input**: User description: "Fazer ter a opção de um modo escuro."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alternar entre claro e escuro pelo catálogo (Priority: P1)

Um usuário que prefere interfaces escuras toca em um botão no cabeçalho do catálogo e vê
todo o aplicativo (catálogo, detalhes, carrinho, checkout, confirmação, login e cadastro)
mudar imediatamente para o modo escuro — e volta ao modo claro com novo toque.

**Why this priority**: É o núcleo do pedido: uma opção visível e acessível de modo escuro
com efeito imediato em toda a interface.

**Independent Test**: Pode ser testada tocando no botão do cabeçalho e verificando a
mudança de cores em todas as telas, sem recarregar.

**Acceptance Scenarios**:

1. **Given** o usuário está no catálogo em modo claro, **When** toca no botão de tema,
   **Then** a interface inteira adota a paleta escura na mesma tela, sem recarregar.
2. **Given** o aplicativo está em modo escuro, **When** toca no botão de tema novamente,
   **Then** a interface volta ao modo claro.
3. **Given** o usuário alterna o tema, **When** navega para detalhes, carrinho, checkout,
   confirmação, login e cadastro, **Then** todas as telas exibem o tema escolhido.
4. **Given** o tema foi alterado, **When** observa a barra de status do dispositivo,
   **Then** o estilo da barra acompanha o tema (clara em fundo escuro e vice-versa).

---

### User Story 2 - Preferência persistida entre sessões (Priority: P2)

A escolha de tema do usuário é salva e reabre o aplicativo com o mesmo tema, sem exigir
nova alternância.

**Why this priority**: Garante que a opção de modo escuro seja uma preferência real, não
um efeito temporário.

**Independent Test**: Pode ser testada alternando o tema, fechando e reabrindo o app e
conferindo o tema aplicado.

**Acceptance Scenarios**:

1. **Given** o usuário escolheu o modo escuro, **When** fecha e reabre o aplicativo,
   **Then** o app abre em modo escuro.
2. **Given** a preferência salva é o modo claro, **When** reabre o aplicativo, **Then**
   o app abre em modo claro.
3. **Given** o armazenamento local está indisponível, **When** abre o aplicativo,
   **Then** o tema do aparelho é usado e nada quebra.

---

### User Story 3 - Seguir o tema do aparelho por padrão (Priority: P3)

Na primeira abertura (e quando o usuário escolhe “Sistema”), o aplicativo acompanha a
preferência de claro/escuro do próprio aparelho e reage quando ela muda.

**Why this priority**: Alinha o app à expectativa do sistema operacional sem exigir
configuração do usuário.

**Independent Test**: Pode ser testada definindo o tema do sistema e abertando/trocando
o tema do aparelho com o app no modo “Sistema”.

**Acceptance Scenarios**:

1. **Given** o usuário nunca escolheu um tema manualmente, **When** o aparelho está em
   modo escuro, **Then** o app exibe o modo escuro.
2. **Given** a preferência é “Sistema”, **When** o tema do aparelho muda,
   **Then** o app acompanha a mudança sem toque adicional.
3. **Given** o usuário escolhe “Sistema” após ter forçado um tema, **When** o tema do
   aparelho muda, **Then** o app volta a seguir o aparelho.

### Edge Cases

- Primeira abertura sem preferência salva → usar o tema do aparelho (padrão “Sistema”).
- Falha ao ler/escrever o AsyncStorage → manter o tema atual em memória; tentar de novo
  na próxima alternância; nunca travar a tela.
- Alternância durante requisições em andamento (carrinho/checkout) → apenas cores mudam;
  nenhum estado de dados é reiniciado.
- Troca de tema no meio do fluxo de checkout → resumo, divergência e confirmação
  preservam o estado e refletem o novo tema.
- `useColorScheme()` nulo (plataforma sem suporte) → tratar como claro.
- Contraste insuficiente no modo escuro → ajustar valores da paleta (texto, erro e
  botão principal legíveis nas duas paletas).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um controle de tema no cabeçalho do catálogo com
  três estados: Sistema, Claro e Escuro, ciclando a cada toque.
- **FR-002**: O sistema MUST aplicar a paleta escura a todas as telas e componentes
  (catálogo, detalhes, carrinho, checkout, confirmação, login, cadastro e componentes
  compartilhados) sem recarregar a aplicação.
- **FR-003**: O sistema MUST persistir a preferência de tema no armazenamento local e
  restaurá-la na abertura do app.
- **FR-004**: O sistema MUST usar o tema do aparelho como padrão (estado “Sistema”) e
  reagir às mudanças do sistema enquanto esse estado estiver ativo.
- **FR-005**: O sistema MUST ajustar o estilo da barra de status ao tema ativo.
- **FR-006**: O sistema MUST manter os estados de dados (carrinho, formulários, erros,
  loading) intactos ao alternar o tema.
- **FR-007**: O controle de tema MUST expor papel/estado acessível (`switch`, estado
  marcado e rótulo em português) refletindo o tema atual.
- **FR-008**: O sistema MUST funcionar sem nenhuma dependência nova (RN `useColorScheme`
  + AsyncStorage já presentes).
- **FR-009**: O sistema MUST exibir as duas paletas com contraste legível para texto,
  texto secundário, erros e botões.

### Key Entities

- **Paleta**: conjunto dos 11 tokens de cor da interface (`primaria`, `primariaEscura`,
  `primariaClara`, `fundo`, `branco`, `texto`, `textoSecundario`, `borda`, `erro`,
  `erroFundo`, `sucesso`) com variantes clara e escura.
- **Preferência de tema**: `"sistema" | "claro" | "escuro"`; estado efetivo
  (`Tema`) é `"claro" | "escuro"` derivado da preferência + tema do aparelho.
- **Sessão de tema**: estado em memória do contexto (preferência, tema efetivo e paleta
  ativa) compartilhado por toda a árvore de componentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Alternar o tema reflete em todas as telas em menos de 1 segundo, sem
  recarregar.
- **SC-002**: 100% dos testes de reinício do app mantêm a preferência escolhida.
- **SC-003**: Com a preferência “Sistema”, 100% das trocas do tema do aparelho são
  refletidas sem toque adicional.
- **SC-004**: 100% das 15 telas/componentes exibem fundo, superfície, texto e bordas
  coerentes com o tema ativo (sem resquícios da paleta clara no escuro).
- **SC-005**: O controle de tema é alcançável em 1 toque a partir do catálogo e possui
  rótulo acessível em português.

## Out of Scope

- Tela de configurações, temas personalizados, escolha de cores ou modo de alto contraste.
- Alternância automática por horário.
- Alteração da paleta de marca (o azul permanece a cor primária nas duas paletas).
- Novas dependências (bibliotecas de ícones, theming etc.).

## Assumptions

- O catálogo é a tela inicial autenticada e o local natural de uma preferência global.
- A paleta escura é derivada da paleta clara existente mantendo as mesmas 11 chaves.
- “branco” representa a superfície dos cartões e muda de valor (não de nome) no escuro.
- O usuário-alvo usa aparelhos com preferência de tema do sistema disponível ou aceita
  o padrão claro.
