# Tasks: Modo Escuro

**Feature**: `006-modo-escuro` | **Plan**: [plan.md](./plan.md)

## 1. Fundação

- [x] 1.1 Criar `Types/tema.ts` com `PreferenciaTema` e `Tema`.
- [x] 1.2 Alterar `Constants/cores.ts`: tipo `Paleta` (11 chaves), manter `CORES`
      (claro) e adicionar `CORES_ESCUROS` com os valores do D-503.
- [x] 1.3 Criar `Context/TemaContext.tsx`: estado `preferencia` (padrão `sistema`),
      `sistema` via `useColorScheme() ?? "claro"`, `tema` e `cores` derivados,
      carga/gravação best-effort no AsyncStorage (`@carrinho/preferencia-tema`) e
      `alternarPreferencia()` ciclando sistema → claro → escuro → sistema.
- [x] 1.4 Alterar `App.tsx`: `TemaProvider` envolvendo a árvore (antes de `AuthProvider`)
      e `StatusBar style={tema === "escuro" ? "light" : "dark"}`.
- [x] 1.5 `npm run typecheck`.

## 2. Controle no catálogo

- [x] 2.1 Adicionar rótulos/a11y em `Constants/mensagensCatalogo.ts`
      (estado atual, chamada para ação, `switch`).
- [x] 2.2 Adicionar o `Pressable` no `Cabecalho` de `Screens/CatalogoScreen.tsx`:
      ciclo de estados, rótulo `Auto/Claro/Escuro`, `accessibilityRole="switch"`,
      `accessibilityState.checked`, largura estável.
- [x] 2.3 `npm run typecheck`.

## 3. Componentes (base compartilhada)

- [x] 3.1 `Components/BotaoPrincipal.tsx`: `useTema` + estilos memoizados + `cores.`.
- [x] 3.2 `Components/CampoTexto.tsx`: idem.
- [x] 3.3 `Components/MensagemErro.tsx`: idem.
- [x] 3.4 `Components/CartaoProduto.tsx`: idem.
- [x] 3.5 `Components/ItemCarrinhoCard.tsx`: idem.
- [x] 3.6 `Components/ModalConfirmacao.tsx`: idem.
- [x] 3.7 `Components/SeletorCategorias.tsx`: idem.
- [x] 3.8 `npm run typecheck`.

## 4. Telas

- [x] 4.1 `Screens/LoginScreen.tsx`.
- [x] 4.2 `Screens/CadastroScreen.tsx`.
- [x] 4.3 `Screens/CarregandoScreen.tsx`.
- [x] 4.4 `Screens/CatalogoScreen.tsx` (estilos memoizados; header já feito na etapa 2).
- [x] 4.5 `Screens/DetalhesProdutoScreen.tsx`.
- [x] 4.6 `Screens/CarrinhoScreen.tsx`.
- [x] 4.7 `Screens/CheckoutScreen.tsx`.
- [x] 4.8 `Screens/ConfirmacaoCompraScreen.tsx`.
- [x] 4.9 `npm run typecheck`.

## 5. Fechamento

- [x] 5.1 Atualizar `AGENTS.md` para apontar `specs/006-modo-escuro/plan.md`.
- [x] 5.2 Gate: grep `CORES\.` sem ocorrências fora de `Constants/cores.ts`.
- [x] 5.3 `npm run typecheck` limpo.
- [ ] 5.4 Validar o roteiro de [quickstart.md](./quickstart.md) no Expo Web
      (claro, escuro, sistema, reinício, contraste, acessibilidade).
