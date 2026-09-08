# Lista de Compras — comparador de algoritmos de ordenação

Trabalho da disciplina de Alta Performance Mobile. O aplicativo é uma lista de compras
com preços: o usuário cadastra produtos e os organiza do mais barato para o mais caro.
Essa mesma operação — ordenar por preço — é implementada por **três algoritmos**
escritos do zero, que o aplicativo mede e compara em tempo real.

Algoritmos implementados (todos da lista do enunciado):

- **Bubble Sort** (bolha), com parada antecipada
- **Insertion Sort** (ordenação por inserção)
- **Merge Sort** (ordenação por intercalação)

## Tabela de complexidades

Referente às implementações deste repositório, com `n` = quantidade de produtos.

| Algoritmo | Melhor caso | Caso médio | Pior caso | Memória auxiliar | Estável |
|---|---|---|---|---|---|
| Bubble Sort (com parada antecipada) | O(n) | O(n²) | O(n²) | O(1) | sim |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | sim |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | sim |

A coluna de memória auxiliar se refere ao **algoritmo**, não ao consumo total do
aplicativo nem às cópias feitas pelo benchmark antes de cronometrar.

O melhor caso O(n) do Bubble e do Insertion depende da entrada já estar ordenada:
o Bubble encerra na primeira passagem sem trocas e o laço interno do Insertion
nunca executa. O Merge Sort não tem esse atalho — ele divide e intercala do mesmo
jeito em qualquer ordem de entrada, e por isso paga O(n) de memória extra.

## Pré-requisitos e versões usadas

| Item | Versão |
|---|---|
| Node.js | 22.16.0 |
| npm | 11.5.2 |
| Expo SDK | 57.0.20 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | 6.0.3 |
| Expo Go | versão compatível com o SDK 57 (App Store / Play Store) |

## Como executar

```bash
npm install
npm start
```

O terminal mostra um QR Code. No celular:

- **Android:** abra o app **Expo Go** e leia o QR Code pela própria tela do app.
- **iOS:** leia o QR Code com a câmera do sistema e abra no Expo Go.

O celular e o computador precisam estar na **mesma rede Wi-Fi**. Se a rede bloquear
essa conexão (Wi-Fi corporativo, universidade, redes com isolamento de clientes),
use o modo túnel, que roteia por servidor externo e não depende da rede local:

```bash
npx expo start --tunnel
```

Outras formas de rodar:

```bash
npm run android   # emulador ou aparelho Android conectado via ADB
npm run web       # navegador, útil para usar o Chrome DevTools
```

## Estrutura dos arquivos

```
App.tsx                            tela principal, estado da lista e abas
src/
  algoritmos/
    bubbleSort.ts                  Bubble Sort com parada antecipada
    insertionSort.ts               Insertion Sort com deslocamentos
    mergeSort.ts                   Merge Sort com intercalação por índices
    index.ts                       registro dos algoritmos e complexidades
  benchmark/
    dadosSinteticos.ts             geração reproduzível de 100/1.000/5.000 produtos
    protocolo.ts                   medição, mediana e validação das saídas
  dominio/
    produto.ts                     tipo Produto e comparador por preço
    preco.ts                       leitura e formatação de preços em centavos
  armazenamento/
    repositorio.ts                 persistência local com AsyncStorage
  componentes/                     interface
  tema.ts                          cores e espaçamentos
testes/
  executar.ts                      testes dos algoritmos e do protocolo
```

Os algoritmos ficam em `src/algoritmos/` e o benchmark em `src/benchmark/protocolo.ts`.
Nenhum deles usa `Array.prototype.sort`. O `sort` nativo aparece apenas em três
lugares, sempre **fora** do trecho cronometrado: na preparação dos cenários
"ordenado" e "inverso", no cálculo da mediana dos tempos e como referência de
comparação nos testes.

## Metodologia de medição

Ao tocar em **Comparar**:

1. Uma única entrada é gerada e os três algoritmos recebem exatamente ela.
2. Cada execução recebe uma cópia independente dessa entrada, feita **fora** do
   cronômetro. As alocações internas do próprio algoritmo (o O(n) do Merge)
   continuam dentro do tempo medido, porque fazem parte do custo dele.
3. 1 execução de aquecimento por algoritmo é descartada.
4. 10 execuções são medidas com `performance.now()`.
5. A ordem dos algoritmos é alternada a cada rodada, para diluir viés de ordem.
6. O valor comparado é a **mediana** (com 10 amostras, a média entre a 5ª e a 6ª
   depois de ordenadas). As 10 amostras ficam guardadas no resultado para conferência.
7. A saída é validada fora da medição: ordem crescente, mesma quantidade e
   exatamente os mesmos produtos da entrada.
8. Nenhum log ou atualização de tela acontece dentro do trecho cronometrado.

O aplicativo também estima a resolução do relógio e avisa quando a diferença
entre as medianas fica dentro dessa margem. Nesse caso a comparação não separa
os algoritmos e o `n` precisa aumentar.

Os dados de teste são gerados por um gerador pseudoaleatório com semente fixa
(`20260908`), então a mesma opção produz sempre a mesma entrada, em qualquer
aparelho e em qualquer execução.

### Limitações

- As medidas são feitas com o aplicativo em **modo de desenvolvimento no Expo Go**.
  Não equivalem a uma build de produção (release), que costuma ser mais rápida.
- Cada ordenação é síncrona e ocupa a thread JavaScript. O aplicativo cede
  execução **entre** as rodadas para a tela se atualizar, mas isso não move o
  cálculo para outra thread. Por isso o `n` máximo é limitado a 5.000.
- O tempo medido é o tempo do algoritmo. **Não** é o tempo de inicialização do
  aplicativo, nem medida de CPU, memória, bateria ou FPS.
- Os números valem para o aparelho, o cenário e o tamanho testados. Não existe
  vencedor universal.

## Coleta de evidências com ferramentas de análise

Separe claramente o que foi medido na web e o que foi medido no nativo.

**Web (Chrome DevTools):** rode `npm run web`, abra o DevTools (F12), vá em
**Performance**, clique em gravar, toque em *Comparar*, pare a gravação
e observe o bloco longo de tarefa da thread principal. A aba **Memory** permite
tirar snapshots do heap JavaScript antes e depois de gerar 5.000 produtos.

**Nativo (React Native DevTools):** com o app aberto no Expo Go, pressione `j` no
terminal do Expo para abrir o DevTools. As abas de Performance e Memory refletem o
Hermes no aparelho. Confira quais painéis existem na versão instalada em vez de
supor que todos os da aula estão disponíveis.

Números coletados na web e no celular não devem ser misturados na mesma tabela.

## Dados de teste e a lista real

A lista real fica em `AsyncStorage`, sob a chave `lista-compras:produtos:v1`.
Os dados sintéticos do benchmark **nunca** passam por ali: são criados em memória
no momento da comparação e descartados depois. Gerar 5.000 produtos de teste não
apaga, não altera e não mistura nada com os produtos cadastrados pelo usuário.

Na aba **Comparação**, a opção *De teste* usa os dados sintéticos e a opção
*Minha lista* usa uma cópia dos produtos reais. A origem dos dados aparece
sempre junto do resultado.

## Verificações realizadas

```bash
npm run typecheck   # tsc --noEmit
npm test            # testes dos algoritmos e do protocolo
```

Executados neste projeto:

- `npx tsc --noEmit` sem erros.
- 46 testes passando, cobrindo: entrada vazia, um item, aleatória, já ordenada,
  ordem inversa, preços repetidos, estabilidade em empates, preservação de todos os
  produtos, concordância com uma ordenação de referência em n = 500, leitura e
  formatação de preços, geração reproduzível dos dados sintéticos, cálculo da
  mediana, detecção de saídas erradas e execução ponta a ponta do benchmark
  (10 amostras por algoritmo, mediana conferida contra as amostras guardadas).
- `npx expo export --platform android` concluído: o bundle Metro é gerado sem erros.
- Execução no navegador com `npm run web`: as duas abas renderizam, o cadastro e a
  ordenação funcionam e a comparação com 1.000 produtos aleatórios produziu medianas
  reais nas três implementações.

Não verificado: a execução em celular ou emulador. Nenhum aparelho Android ou iOS
estava disponível no ambiente onde o projeto foi montado, então o comportamento da
interface no Expo Go e os tempos de cada algoritmo em aparelho ainda precisam ser
conferidos pelo grupo antes da apresentação.
