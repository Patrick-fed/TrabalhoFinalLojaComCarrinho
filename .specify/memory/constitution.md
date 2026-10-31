<!--
Sync Impact Report
Version change: (none) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (I–XII)
  - Restrições Técnicas e de Escopo
  - Fluxo de Desenvolvimento e Qualidade
  - Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (verificado, sem alteração necessária)
  ✅ .specify/templates/spec-template.md (verificado, sem alteração necessária)
  ✅ .specify/templates/tasks-template.md (verificado, sem alteração necessária)
Follow-up TODOs: Nenhum
-->

# Constituição do Projeto: Loja Virtual com Carrinho

## Core Principles

### I. Simplicidade e Clareza

O código DEVE priorizar soluções simples, corretas e fáceis de entender. Abstrações,
padrões arquiteturais ou automatizações excessivas NÃO DEVEM ser introduzidos quando
uma abordagem mais simples resolver o problema. Toda implementação DEVE ser
compreensível e explicável pelos integrantes da dupla.

### II. Tecnologias e Dependências

O projeto DEVE utilizar React Native com Expo e TypeScript. Recursos e bibliotecas já
disponíveis no projeto DEVEM ser priorizados. Novas dependências SÓ DEVEM ser
adicionadas após verificar que o problema não pode ser resolvido com recursos
existentes, e a justificativa DEVE ser registrada.

### III. SOLID

Os princípios SOLID DEVEM ser aplicados quando melhorarem a clareza e a separação de
responsabilidades. A aplicação de SOLID NÃO DEVE criar abstrações desnecessárias nem
aumentar a complexidade além do necessário para a escala do projeto.

### IV. Componentes Reutilizáveis

Blocos de interface que se repetem ou possuem potencial real de reutilização DEVEM ser
transformados em componentes reutilizáveis e tipados. Elementos usados uma única vez,
sem benefício real de reutilização, PODEM permanecer na própria tela. Componentização
excessiva NÃO DEVE ser praticada.

### V. TypeScript e Tipagem

Props de componentes, dados da API, navegação e demais estruturas importantes DEVEM
possuir tipos definidos. O uso de `any` DEVE ser evitado sempre que houver alternativa
adequada. Tipos existentes, como os de `Carrinho/Types/types.ts`, DEVEM ser
reutilizados para evitar duplicação.

### VI. Organização e Responsabilidades

As telas DEVEM priorizar apresentação e interação com o usuário. Chamadas à API DEVEM
ser centralizadas nos arquivos de serviço em `Carrinho/Service`. Rotas e URLs da API
DEVEM permanecer organizadas em constantes/configuração, como `Service/rotas.ts`.
Configurações externas, como Firebase e variáveis de ambiente, DEVEM permanecer
separadas da lógica das telas.

### VII. Preservação do Código Existente

Código existente que esteja funcionando NÃO DEVE ser modificado, apagado ou refatorado
sem necessidade relacionada à funcionalidade atual. As mudanças DEVEM ser focadas no
objetivo solicitado. Refatorações amplas para "melhorar" ou reorganizar o projeto sem
necessidade NÃO DEVEM ser realizadas.

### VIII. Desenvolvimento por Etapas

O desenvolvimento DEVE ocorrer em etapas pequenas e focadas. Uma funcionalidade DEVE
ser especificada, planejada e implementada antes de avançar para a próxima. Diversas
funcionalidades grandes NÃO DEVEM ser implementadas simultaneamente sem planejamento.

### IX. Requisitos do Trabalho

O fluxo obrigatório DEVE funcionar: Conta e Login → Catálogo → Detalhes do Produto →
Carrinho → Pagamento → Pedido Finalizado. Comportamentos de carregamento, erros,
validações e respostas da API DEVEM ser tratados. Requisitos obrigatórios NÃO DEVEM ser
substituídos por alternativas não solicitadas.

### X. Sem Funcionalidades Desnecessárias

Funcionalidades extras que não sejam necessárias aos requisitos atuais NÃO DEVEM ser
implementadas, salvo solicitação explícita. O foco DEVE permanecer no funcionamento
correto do trabalho antes de qualquer extra.

### XI. Interface e Estilos

Os estilos DEVEM ser limpos, organizados e fáceis de manter. A identidade visual DEVE
ser consistente e baseada principalmente em uma paleta azul. Espaçamento e organização
visual DEVEM ser adequados, priorizando clareza e facilidade de uso sem complexidade
visual desnecessária.

### XII. Aprendizado e Compreensão

As decisões de implementação DEVEM priorizar soluções que os integrantes consigam
compreender e explicar. Código desnecessariamente avançado ou automatizações que
dificultem o entendimento NÃO DEVEM ser utilizados. O fluxo entre componentes, telas,
serviços, tipos e configurações DEVE ser organizado de forma clara.

## Restrições Técnicas e de Escopo

- A aplicação DEVE ser desenvolvida em React Native com Expo e TypeScript.
- A autenticação DEVE utilizar Firebase Authentication.
- Produtos, categorias, formas de pagamento, carrinho e compras DEVEM ser obtidos da
  API externa configurada em `Carrinho/Service/rotas.ts`.
- Cada usuário DEVE possuir seu próprio carrinho, usando o UID autenticado como
  `usuarioId` nas chamadas à API.
- O pagamento DEVE ser apenas uma simulação; nenhuma transação financeira real DEVE
  ocorrer.
- A estrutura existente do projeto DEVE ser respeitada e aproveitada, evitando
  recriações ou alterações desnecessárias.

## Fluxo de Desenvolvimento e Qualidade

- Cada funcionalidade DEVE seguir o ciclo: especificação → plano → tarefas →
  implementação → validação.
- Estados de carregamento, mensagens de erro, validações de formulário e tratamento de
  respostas da API DEVEM ser verificados antes de considerar uma etapa concluída.
- Comandos de lint e verificação de tipos DEVEM ser executados quando disponíveis no
  projeto, antes de finalizar uma alteração.
- Antes de concluir uma funcionalidade, a conformidade com os princípios desta
  constituição DEVE ser revisada. Violações DEVEM ser justificadas no plano ou
  corrigidas.
- Mudanças DEVEM ser pequenas e restritas ao escopo da etapa atual.

## Governance

Esta constituição prevalece sobre outras práticas de desenvolvimento do projeto.
Emendas DEVEM ser documentadas, aprovadas pela dupla e acompanhadas de atualização de
versão e data. A versão DEVE seguir Versionamento Semântico:

- MAJOR: remoção ou redefinição incompatível de princípios ou regras de governança.
- MINOR: inclusão de novo princípio/seção ou expansão material das orientações.
- PATCH: esclarecimentos, correções de redação ou refinamentos não semânticos.

Toda revisão de código ou funcionalidade DEVE verificar conformidade com os princípios.
Violações DEVEM ser justificadas na seção de rastreamento de complexidade do plano ou
eliminadas. A orientação operacional do dia a dia DEVE permanecer em `AGENTS.md` e no
plano vigente.

**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31
