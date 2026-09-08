# Prompt para Geração de Slides da Apresentação

> **Instruções:** Copie o texto abaixo e envie para a IA de sua preferência (ex: ChatGPT, Claude, Gamma App, Copilot) para gerar a apresentação de slides do trabalho.

---

```markdown
Você é um especialista em Ciência da Computação, Engenharia de Software e Design de Apresentações Acadêmicas e Profissionais.

Crie o conteúdo completo e a estrutura visual de uma apresentação de slides (cerca de 10 a 12 slides) para um trabalho universitário da disciplina de **Alta Performance Mobile**.

---

### CONTEXTO DO PROJETO E REQUISITOS DO ENUNCIADO:
1. **Objetivo:** Desenvolver uma aplicação em **React Native** que implementa dois algoritmos da lista oficial fornecida pelo professor, confronta suas performances em tempo real e exibe a análise de complexidade assintótica (Big-O).
2. **Algoritmos Selecionados:**
   - **Busca Linear:** Complexidade **O(n)** (faixa amarela no gráfico de Big-O).
   - **Busca Binária:** Complexidade **O(log n)** (faixa verde no gráfico de Big-O).
3. **Aplicação Prática:** "Lista de Compras / Catálogo de Produtos" desenvolvida em React Native com Expo SDK 57 e TypeScript.
4. **Ferramenta de Profiling:** Análise de desempenho com **Chrome for Developers (Chrome DevTools)** na aba *Performance* (Flame Chart / Thread Principal) e na aba *Memory* (Heap Snapshot).

---

### DADOS TÉCNICOS E EVIDÊNCIAS COLETADAS:
- **Busca Linear O(n):**
  - Percorre item por item da lista sequencialmente.
  - Melhor caso: O(1) (primeiro item). Caso médio e pior caso: O(n).
  - Memória auxiliar: O(1).
  - Pré-requisito: Nenhum (funciona mesmo em coleções desordenadas).
  - Em 100.000 produtos: realiza até 100.000 comparações no pior caso.
- **Busca Binária O(log n):**
  - Divide o espaço de busca pela metade a cada iteração (divisão e conquista).
  - Melhor caso: O(1) (item central). Caso médio e pior caso: O(log n).
  - Memória auxiliar: O(1).
  - Pré-requisito fundamental: a lista precisa estar previamente ordenada por preço.
  - Em 100.000 produtos: realiza no máximo 17 comparações (ceil(log2(100.000)) = 17). Redução de esforço em mais de 5.800x!
- **Protocolo de Benchmark Implementado no App:**
  - Testes com N = 1.000, 10.000 e 100.000 produtos.
  - Aquecimento de JIT (V8/Hermes) antes de cronometrar.
  - Medição temporal com `performance.now()` em lote de repetições e cálculo da mediana das amostras.
  - Validação estrita dos resultados encontrados para garantir integridade.

---

### ESTRUTURA REQUISITADA PARA CADA SLIDE:

Para cada um dos slides abaixo, forneça:
- **Título do Slide** (curto e chamativo);
- **Objetivo do Slide** (o que o apresentador deve transmitir);
- **Bullet Points e Conteúdo Textual** (conciso, direto, sem blocos longos de texto);
- **Sugestão de Elemento Visual/Gráfico** (ex: tabela comparativa, diagrama de blocos, gráfico de barras, print do app, print do Chrome DevTools);
- **Roteiro de Fala do Apresentador** (um parágrafo objetivo com o que falar na hora).

---

### ROTEIRO SUGERIDO DOS SLIDES:

- **Slide 1: Capa**
  - Título do Projeto: *Análise de Performance Mobile: Busca Linear O(n) vs Busca Binária O(log n)*.
  - Subtítulo: *Estudo Prático em React Native com Profiling no Chrome DevTools*.
  - Disciplina: Alta Performance Mobile.
  - Nomes dos integrantes do grupo.

- **Slide 2: Introdução e Motivação**
  - O desafio da performance e responsividade em dispositivos móveis.
  - Por que a complexidade assintótica (Big-O) dita a fluidez da UI quando o volume de dados (N) cresce.
  - Apresentação do app: Lista de Compras / Catálogo com persistência local e busca interativa.

- **Slide 3: Fundamentação Teórica — O Gráfico de Complexidade (Big-O)**
  - O que significa cada faixa de complexidade.
  - Destaque para a faixa amarela ($O(n)$) vs faixa verde ($O(\log n)$ e $O(1)$).
  - A diferença conceitual entre crescimento linear e logarítmico.

- **Slide 4: Algoritmo 1 — Busca Linear (Sequencial)**
  - Como funciona: verificação de item a item a partir do índice 0.
  - Tabela de complexidades: Melhor caso $O(1)$, Caso médio $O(n)$, Pior caso $O(n)$, Espaço $O(1)$.
  - Vantagem: simplicidade e tolerância a dados desordenados.
  - Gargalo: degradação proporcional ao tamanho da lista.

- **Slide 5: Algoritmo 2 — Busca Binária (Divisão e Conquista)**
  - Como funciona: divide o espaço ao meio a cada comparação.
  - Tabela de complexidades: Melhor caso $O(1)$, Caso médio $O(\log n)$, Pior caso $O(\log n)$, Espaço $O(1)$.
  - O "preço a pagar" (Trade-off): a obrigatoriedade da ordenação prévia.
  - A matemática do $\log_2(n)$: por que $100.000$ itens são resolvidos em apenas $17$ passos.

- **Slide 6: Arquitetura da Solução em React Native**
  - Stack utilizada: Expo SDK 57, React 19, TypeScript, AsyncStorage.
  - Abas da aplicação: Aba da Lista (cadastro e busca interativa) e Aba de Comparação (benchmark em tempo real).
  - Algoritmos desenvolvidos do zero, sem bibliotecas externas de busca.

- **Slide 7: Metodologia Científica de Medição (Protocolo de Benchmark)**
  - Como garantir medições justas e confiáveis em JavaScript/Mobile:
    - Aquecimento de JIT (elimina warm-up overhead).
    - Execução em lotes com `performance.now()`.
    - 10 rodadas alternadas com cálculo da mediana (evita viés de cache e spikes do SO).
    - Validação de saída (concordância de índices).

- **Slide 8: Resultados Práticos — O Impacto de N no Número de Comparações**
  - Tabela com resultados reais nos 3 tamanhos de entrada:
    - $N = 1.000$: Linear = $1.000$ passos | Binária = $10$ passos.
    - $N = 10.000$: Linear = $10.000$ passos | Binária = $14$ passos.
    - $N = 100.000$: Linear = $100.000$ passos | Binária = $17$ passos.
  - Gráfico comparativo de barras evidenciando a estagnação do tempo na busca binária.

- **Slide 9: Evidências com Chrome for Developers (DevTools)**
  - Análise na aba **Performance**: visualização do Flame Chart da thread JavaScript. O laço longo da Busca Linear vs a execução instantânea da Busca Binária.
  - Análise na aba **Memory**: Heap Snapshots provando a estabilidade de memória auxiliar $O(1)$ de ambas as abordagens.

- **Slide 10: Discussão Técnica & Trade-offs**
  - Quando usar Busca Linear? (Listas pequenas, buscas esporádicas ou dados que mudam constantemente).
  - Quando vale a pena ordenar a lista para usar Busca Binária? (Múltiplas consultas em catálogos volumosos).

- **Slide 11: Conclusão**
  - Síntese dos aprendizados obtidos.
  - A importância da medição empírica aliada à teoria da computação para engenharia de software mobile.
  - Encerramento e abertura para perguntas.
```
