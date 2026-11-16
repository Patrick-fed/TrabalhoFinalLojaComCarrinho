# Implementation Plan: Modo Escuro

**Branch**: `006-modo-escuro` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-modo-escuro/spec.md`

## Summary

Adicionar um modo escuro com três estados (Sistema, Claro, Escuro) usando um novo
`TemaContext` como fonte única da paleta ativa. A paleta existente (`CORES`) ganha um
tipo `Paleta` e uma variante escura com as mesmas 11 chaves; os 15 arquivos que consomem
`CORES` (201 referências) passam a obter as cores do contexto e a criar seus estilos com
`useMemo` por renderização, permitindo troca de cor em runtime. O controle fica num
`Pressable` do cabeçalho do catálogo que cicla os três estados; a preferência é persistida
no AsyncStorage (`@carrinho/preferencia-tema`) e o `StatusBar` acompanha o tema. Nenhuma
dependência nova.

## Technical Context

**Language/Version**: TypeScript 6.0 (`strict: true`), React 19.3, React Native 0.88.1
**Primary Dependencies**: Expo 58, React Navigation 7, AsyncStorage 2.2 (já presente),
RN `useColorScheme` — **nenhuma dependência nova**
**Storage**: `@carrinho/preferencia-tema` no AsyncStorage; tema do sistema via
`useColorScheme()`
**Testing**: Sem framework automatizado; `npm run typecheck` + roteiro manual do
`quickstart.md`
**Target Platform**: Expo Android/iOS/Web (validação principal no Expo Web com
`prefers-color-scheme`)
**Project Type**: Aplicativo móvel single-project em `Carrinho/`
**Performance Goals**: troca de tema refletida em < 1 s; estilos não recriados fora de
mudanças de paleta (`useMemo`)
**Constraints**: sem novas dependências; mesmas 11 chaves de cor nas duas paletas;
estados de dados preservados na troca; acessibilidade do controle (`switch` + label PT)
**Scale/Scope**: 1 contexto novo, 1 arquivo de tipos, 1 paleta nova, 1 botão no header,
refatoração mecânica de 15 arquivos, docs da feature

Nenhum item marcado como `NEEDS CLARIFICATION`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Resultado | Justificativa |
|-----------|-----------|---------------|
| I. Simplicidade e Clareza | PASS | Um contexto, uma paleta, um botão; refatoração segue um único padrão. |
| II. Tecnologias e Dependências | PASS | Somente RN (`useColorScheme`) e AsyncStorage já existentes. |
| III. SOLID | PASS | `TemaContext` é a fonte única do tema; telas/componentes só consomem `cores`. |
| IV. Componentes Reutilizáveis | PASS | Reutiliza `Pressable`, `Text` e mensagens em `Constants/`. |
| V. TypeScript e Tipagem | PASS | `Paleta`, `PreferenciaTema` e `Tema` explícitos; sem `any`. |
| VI. Organização e Responsabilidades | PASS | `Context/TemaContext.tsx`, `Types/tema.ts`, paleta em `Constants/cores.ts`. |
| VII. Preservação do Código Existente | PASS | Mudança mecânica e justificada: cor em runtime exige estilos por renderização; nomes de chaves preservados. |
| VIII. Desenvolvimento por Etapas | PASS | Feature única (tema); componentes antes das telas, com typecheck incremental. |
| IX. Requisitos do Trabalho | PASS | Alternância, persistência, sistema, acessibilidade e validação cobertos. |
| X. Sem Funcionalidades Desnecessárias | PASS | Sem tela de configurações, temas personalizados ou dependências novas. |
| XI. Interface e Estilos | PASS | Mesma paleta azul como marca; dark derivado com contraste verificado. |
| XII. Aprendizado e Compreensão | PASS | Fluxo claro: botão → contexto → paleta → estilos memoizados. |

**Post-design re-check**: PASS. A refatoração dos 15 arquivos é pré-requisito técnico da
feature, não escopo adicional.

## Project Structure

### Documentation (this feature)

```text
specs/006-modo-escuro/
├── spec.md              # Este feature
├── plan.md              # Este arquivo
├── tasks.md             # Tarefas de implementação
└── quickstart.md        # Roteiro manual de validação
```

### Source Code (repository root)

```text
Carrinho/
├── Types/
│   └── tema.ts                   # NOVO: PreferenciaTema e Tema
├── Constants/
│   ├── cores.ts                  # ALTERAR: tipo Paleta + CORES_ESCUROS
│   └── mensagensCatalogo.ts      # ALTERAR: rótulos/a11y do controle de tema
├── Context/
│   └── TemaContext.tsx           # NOVO: useTema com preferência, tema e cores
├── App.tsx                       # ALTERAR: TemaProvider + StatusBar dinâmico
├── Components/ (7 arquivos)      # ALTERAR: useTema + estilos memoizados
├── Screens/ (8 arquivos)         # ALTERAR: idem; header do catálogo ganha o botão
└── AGENTS.md                     # ALTERAR: apontar para specs/006-modo-escuro/plan.md
```

**Structure Decision**: Single-project em `Carrinho/`, seguindo a separação por
responsabilidade existente. As cores passam a fluir **somente** pelo contexto; `CORES`
continua sendo o nome da paleta clara para preservar os 201 pontos de uso.

## Phase 0: Research Summary

| ID | Decisão |
|----|---------|
| D-501 | Preferência `"sistema" | "claro" | "escuro"` (padrão `sistema`); tema efetivo `Tema = "claro" | "escuro"`; `useColorScheme() ?? "claro"`. |
| D-502 | Persistência em `@carrinho/preferencia-tema`; leitura no mount (após estado inicial síncrono do sistema, sem flash); falha → mantém sistema. |
| D-503 | `Paleta` com as 11 chaves atuais; `CORES_ESCUROS` idem chaves; valores dark propostos: `fundo #0E141B`, superfície `#171F29`, `texto #E9EEF4`, `textoSecundario #9CABBA`, `borda #2B3644`, `primaria #3D7DD8`, `primariaEscura #2A5CA8`, `primariaClara #1A2A3F`, `erro #EF5350`, `erroFundo #3A1D1D`, `sucesso #66BB6A`; contraste revisado no quickstart. |
| D-504 | Padrão por arquivo: `const { cores } = useTema()` + `const estilos = useMemo(() => StyleSheet.create({...}), [cores])`; `CORES.` → `cores.`; gate final = grep `CORES\.` fora de `cores.ts` zerado. |
| D-505 | Controle no `Cabecalho` do catálogo: `Pressable` ciclando Sistema → Claro → Escuro → Sistema, mostrando estado atual, `accessibilityRole="switch"`, `accessibilityState.checked`, labels em `mensagensCatalogo.ts`; sem libs de ícone. |
| D-506 | `TemaProvider` envolve toda a árvore (antes de `AuthProvider`, pois `CarregandoScreen` é temático); `StatusBar style` derivado do tema. |
| D-507 | Troca de tema não toca em estado de dados: apenas re-render de estilos (`useMemo` muda quando `cores` muda). |
| D-508 | Sem testes automatizados; validar com `tsc --noEmit` + quickstart manual (web com `prefers-color-scheme`). |

## Phase 1: Design Summary

### Modelo

- `PreferenciaTema`: `"sistema" | "claro" | "escuro"`.
- `Tema`: `"claro" | "escuro"`.
- `Paleta`: `{ primaria; primariaEscura; primariaClara; fundo; branco; texto; textoSecundario; borda; erro; erroFundo; sucesso }`.
- Valor do contexto: `{ preferencia, tema, cores, alternarPreferencia }`.
- Transições: `alternarPreferencia` cicla `sistema → claro → escuro → sistema`;
  com `sistema`, o tema efetivo acompanha `useColorScheme()`.

### Camada de contexto

- `Context/TemaContext.tsx`:
  - estado `preferencia` (inicia `"sistema"`), `sistema` (de `useColorScheme`);
  - `tema` e `cores` derivados (`useMemo`);
  - `useEffect` de carga (AsyncStorage) e de gravação (best-effort);
  - `alternarPreferencia()` com gravação otimista.

### Interface

- Header do catálogo: botão com rótulo do estado (`Auto`/`Claro`/`Escuro`) + emoji,
  largura estável (sem “pulo” no header), alvo de toque ≥ 40 px.
- `App.tsx`: `<TemaProvider><Aplicacao/></TemaProvider>`; `Aplicacao` renderiza
  `StatusBar` dinâmico e o restante inalterado.

### Navegação

- Nenhuma rota nova; o controle vive no cabeçalho existente do catálogo.

## Implementation Sequence

1. Escrever `specs/006-modo-escuro/` (spec, plan, tasks, quickstart).
2. Criar `Types/tema.ts` e alterar `Constants/cores.ts` (`Paleta` + `CORES_ESCUROS`).
3. Criar `Context/TemaContext.tsx` e alterar `App.tsx`.
4. Adicionar o controle em `Screens/CatalogoScreen.tsx` (header) + mensagens.
5. Refatorar os 7 componentes (`BotaoPrincipal`, `CampoTexto`, `CartaoProduto`,
   `ItemCarrinhoCard`, `ModalConfirmacao`, `MensagemErro`, `SeletorCategorias`).
6. Refatorar as 8 telas (Login, Cadastro, Carregando, Catálogo, Detalhes, Carrinho,
   Checkout, Confirmação + header já feito no passo 4).
7. Atualizar `AGENTS.md` para o plano 006.
8. `cd Carrinho; npm run typecheck` + grep `CORES\.` (só `cores.ts` pode restar).
9. Validar o `quickstart.md` no Expo Web (claro/escuro/sistema + reinício).

## Validation Strategy

- `npm run typecheck` sem erros.
- `grep CORES\.` → apenas `Constants/cores.ts`.
- Manual (quickstart):
  - alternância imediata em todas as telas e componentes;
  - persistência após reinício nos 3 estados;
  - modo Sistema acompanha o aparelho (web: `prefers-color-scheme`);
  - `StatusBar` clara/escura conforme o tema;
  - dados do checkout/carrinho intactos após a troca;
  - contraste legível nas duas paletas (texto, erro, botão);
  - controle acessível (`switch`, estado e rótulo PT).

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Tela esquecida com estilo estático | Padrão obrigatório por arquivo + grep `CORES\.` como gate final |
| Flash de tema errado na abertura | Estado inicial síncrono via `useColorScheme()`; override no primeiro effect |
| Contraste insuficiente no dark | Valores iniciais revisados + passo de contraste no quickstart |
| Recriação de styles a cada render | `useMemo` com dependência apenas de `cores` |
| Perda da preferência (AsyncStorage falha) | Gravação best-effort; estado em memória segue funcionando |
| Header “pulando” ao trocar rótulo | Largura mínima fixa no botão do controle |

## Complexity Tracking

Nenhuma violação da constituição. Uma mudança estrutural justificada:

| Alteração | Motivo | Alternativa rejeitada |
|-----------|--------|------------------------|
| 15 arquivos com estilos memoizados | Troca de cor em runtime exige styles por renderização | Duplicar telas/estilos claro-escuro ou overlay global de cores |
