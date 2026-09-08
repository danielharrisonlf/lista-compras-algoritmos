# Lista de Compras — Comparador de Algoritmos de Busca

Trabalho da disciplina de Alta Performance Mobile. O aplicativo é uma lista de compras com controle de preços onde o usuário cadastra produtos e pode pesquisar itens por preço exato.

Para atender aos requisitos do enunciado, a operação de pesquisa de produtos foi implementada com **dois algoritmos da lista oficial**, confrontando duas classes de complexidade assintótica (Big-O) fundamentais:

- **Busca Linear**: classe linear **$O(n)$** (faixa amarela do gráfico de complexidade)
- **Busca Binária**: classe logarítmica **$O(\log n)$** (faixa verde do gráfico de complexidade)

Ambos foram escritos do zero em TypeScript (sem utilizar funções prontas de busca), e o aplicativo permite compará-los tanto de forma interativa quanto por meio de um módulo de benchmark em tempo real.

---

## Tabela de complexidades

Referente às implementações deste repositório, com `n` = quantidade de produtos cadastrados/avaliados.

| Algoritmo | Notação Big-O (Caso Médio / Pior) | Faixa no Gráfico | Melhor caso | Caso médio | Pior caso | Memória auxiliar | Pré-requisito |
|---|---|---|---|---|---|---|---|
| **Busca Linear** | **$O(n)$** | 🟡 Amarelo (Linear) | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ | Nenhum (funciona em lista desordenada) |
| **Busca Binária** | **$O(\log n)$** | 🟢 Verde (Sublinear) | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(1)$ | A lista precisa estar previamente ordenada |

### Análise teórica da comparação
1. **Busca Linear ($O(n)$):** Inicia no primeiro elemento e examina item por item sequencialmente.
   - Em uma lista de $100.000$ produtos, no pior caso (o item procurado é o último ou não existe), o algoritmo precisa realizar exatamente **$100.000$ comparações**.
2. **Busca Binária ($O(\log n)$):** Compara o elemento alvo com o valor central da lista. Se não for igual, descarta metade da lista e repete.
   - Em uma lista de $100.000$ produtos, no pior caso, o algoritmo realiza no máximo $\lceil \log_2(100.000) \rceil = \mathbf{17}$ **comparações**.
   - **Ganho de eficiência:** A Busca Binária reduz o esforço computacional em mais de **$5.800\times$** para $n = 100.000$.

---

## Pré-requisitos e versões usadas

| Item | Versão |
|---|---|
| Node.js | 22.16.0 |
| npm | 11.5.2 |
| Expo SDK | 57.0.20 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | 6.0.3 |
| Expo Go | Versão compatível com SDK 57 (App Store / Google Play) |

---

## Como executar o projeto

```bash
npm install
npm start
```

O terminal exibirá o QR Code para execução no celular via Expo Go:
- **Android:** Abra o app **Expo Go** e faça a leitura do QR Code pela câmera integrada do app.
- **iOS:** Abra a câmera do iPhone e aponte para o QR Code para abrir no Expo Go.

### Execução na Web (ideal para o Chrome DevTools)
```bash
npm run web
```
Abre a aplicação diretamente no navegador (porta `8081`), permitindo inspecionar CPU, memória e tempo de execução detalhados.

---

## Estrutura dos arquivos

```
App.tsx                            Navegação por abas e estado da lista
src/
  algoritmos/
    buscaLinear.ts                 Busca sequencial O(n) com contador de passos
    buscaBinaria.ts                Busca por divisão e conquista O(log n)
    index.ts                       Registro dos algoritmos e metadados de Big-O
  benchmark/
    dadosSinteticos.ts             Geração determinística de 1.000, 10.000 e 100.000 produtos
    protocolo.ts                   Protocolo de medição com performance.now() e contagem de passos
  dominio/
    produto.ts                     Modelo tipado Produto e comparador de preço
    preco.ts                       Leitura e formatação monetária (centavos em R$)
  armazenamento/
    repositorio.ts                 Persistência local no aparelho com AsyncStorage
  componentes/
    PainelLista.tsx                Interface de cadastro e busca interativa
    PainelComparacao.tsx           Painel com gráficos de barras e comparativo de Big-O
    FormularioProduto.tsx          Entrada com máscara e validação
    ItemProduto.tsx                Card do produto com botão de exclusão
    Escolha.tsx                    Seletor de opções em abas/segmentos
    Botao.tsx                      Botão acessível com estado de carregamento
  tema.ts                          Cores, tipografia e espaçamentos
```

---

## Metodologia de medição e comparação

Na aba **Comparação**:

1. O usuário escolhe o tamanho da entrada ($N = 1.000$, $10.000$ ou $100.000$ produtos) e o cenário da busca (Pior caso, Caso médio ou Melhor caso).
2. Uma única base de dados de teste ordenada é gerada em memória.
3. São descartadas 2 rodadas de aquecimento para que o JIT (V8 na web, Hermes no celular) estabilize.
4. São coletadas 10 rodadas de medição com `performance.now()`, alternando a ordem de execução dos algoritmos para eliminar viés de cache.
5. Cada medição executa um lote de buscas para garantir precisão temporal contra ruído de timer do sistema operacional.
6. A interface exibe:
   - O tempo medido (mediana das amostras).
   - O **número exato de comparações/passos** realizados.
   - A notação assintótica destacada com cores correspondentes ao gráfico de complexidade.

---

## Coleta de evidências com Chrome for Developers

Para a apresentação do trabalho em sala de aula e inclusão nos slides:

1. Execute `npm run web` e abra o aplicativo no Google Chrome.
2. Pressione `F12` para abrir o **Chrome DevTools** e selecione a aba **Performance**.
3. Clique no botão de Gravar (círculo vermelho).
4. Na aba **Comparação** do app, selecione $100.000$ produtos, cenário *Pior caso*, e clique em **Comparar busca**.
5. Interrompa a gravação do DevTools.
6. No painel de chama (**Flame Chart / Main Thread**):
   - Observe o bloco de execução da **Busca Linear**: veja a sequência contínua de iterações do laço `for`.
   - Em contraste, observe o tempo imperceptível da **Busca Binária**, que resolve o problema em apenas 17 saltos.
7. Na aba **Memory**, gere um Heap Snapshot para evidenciar que ambos os algoritmos possuem memória auxiliar $O(1)$, operando sem alocação de estruturas extras.

---

## Verificações realizadas

```bash
npm run typecheck   # tsc --noEmit
```

- `npx tsc --noEmit`: 0 erros de tipagem TypeScript.
- Execução na web (`npm run web`): cadastro de produtos, persistência, busca interativa e o módulo de benchmark funcionando perfeitamente em 1.000, 10.000 e 100.000 itens.
