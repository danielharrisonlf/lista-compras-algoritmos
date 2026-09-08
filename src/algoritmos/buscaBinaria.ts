import type { Produto } from "../dominio/produto";
import type { ResultadoBusca } from "./buscaLinear";

/**
 * Busca Binária — Complexidade O(log n)
 *
 * Divide o espaço de busca pela metade a cada iteração.
 * - Melhor caso: O(1) — o item procurado é exatamente o elemento central da lista.
 * - Caso médio: O(log n) — em torno de log2(n) iterações.
 * - Pior caso: O(log n) — no máximo ceil(log2(n)) iterações.
 * - Memória auxiliar: O(1) — versão iterativa, sem pilha de recursão.
 * - Pré-requisito fundamental: A lista precisa estar ordenada previamente por preço.
 */
export function buscaBinaria(itens: Produto[], precoAlvoCentavos: number): ResultadoBusca {
  let inicio = 0;
  let fim = itens.length - 1;
  let comparacoes = 0;

  while (inicio <= fim) {
    comparacoes += 1;
    const meio = Math.floor((inicio + fim) / 2);
    const precoAtual = itens[meio].precoCentavos;

    if (precoAtual === precoAlvoCentavos) {
      return {
        indice: meio,
        produto: itens[meio],
        comparacoes,
      };
    }

    if (precoAtual < precoAlvoCentavos) {
      inicio = meio + 1;
    } else {
      fim = meio - 1;
    }
  }

  return {
    indice: -1,
    produto: null,
    comparacoes,
  };
}
