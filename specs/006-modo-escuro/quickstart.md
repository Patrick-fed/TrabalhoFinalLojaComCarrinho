# Quickstart: Modo Escuro

**Feature**: `006-modo-escuro` | **Date**: 2026-11-16

## Pré-requisitos

- Dependências instaladas em `Carrinho/`.
- Conta válida para acessar o catálogo.
- No Expo Web, DevTools do navegador para alternar `prefers-color-scheme`.

## Comandos

```powershell
cd Carrinho
npm run typecheck
npm run web
```

## Cenários de Validação

### 1. Alternância imediata

1. Entrar na conta e abrir o catálogo.
2. Tocar no controle de tema do cabeçalho.

Esperado: fundo, superfícies, textos e bordas de **todas** as telas mudam na mesma
sessão (testar catálogo → detalhes → carrinho → checkout → confirmação → logout →
login → cadastro), sem recarregar.

### 2. Ciclo de estados

1. Tocar várias vezes no controle.

Esperado: a sequência é Sistema (Auto) → Claro → Escuro → Sistema; o rótulo/emoji do
botão mostra sempre o estado atual e não “pula” o layout do cabeçalho.

### 3. Persistência

1. Escolher **Escuro**, fechar e reabrir o app.
2. Repetir com **Claro** e com **Sistema**.

Esperado: reabre exatamente com a preferência escolhida; sem preferência salva, usa o
tema do aparelho.

### 4. Modo Sistema

1. Selecionar **Sistema**.
2. Trocar o tema do sistema operacional (web: DevTools → rendering →
   `prefers-color-scheme`).

Esperado: o app acompanha a troca sem nenhum toque; com override Claro/Escuro ativo,
a troca do sistema **não** altera o app.

### 5. Barra de status

1. Alternar claro/escuro em dispositivo (ou observar a moldura no Expo Go).

Esperado: status clara sobre fundo escuro e status escura sobre fundo claro.

### 6. Estado preservado

1. Deixar itens no carrinho, formulário preenchido ou erro visível no checkout.
2. Alternar o tema.

Esperado: nada de dados se perde; apenas as cores mudam; a finalização da compra
continua funcionando.

### 7. Contraste

1. Em cada paleta, conferir: texto principal sobre fundo, texto secundário, mensagem
   de erro, botão principal e campos de entrada.

Esperado: tudo legível, sem texto “sumido” ou borda invisível.

### 8. Acessibilidade

1. Navegar por leitor de tela/foco até o controle de tema.

Esperado: papel `switch`, estado marcado/desmarcado coerente e rótulo em português
indicando o tema atual.

### 9. Gate estático

```powershell
npm run typecheck
```

E grep por `CORES\.` em `Carrinho/**/*.tsx` → **nenhuma ocorrência** (só `cores.ts`
pode usar `CORES`).

## Checklist Final

- [ ] `npm run typecheck` sem erros.
- [ ] Alternância reflete em todas as 15 telas/componentes.
- [ ] Ciclo Sistema → Claro → Escuro funciona com rótulo estável.
- [ ] Preferência persiste entre reinícios.
- [ ] Modo Sistema acompanha o aparelho.
- [ ] `StatusBar` acompanha o tema.
- [ ] Dados intactos após a troca.
- [ ] Contraste legível nas duas paletas.
- [ ] Controle com papel/estado/rótulo acessível.
- [ ] Grep `CORES\.` zerado fora de `Constants/cores.ts`.
