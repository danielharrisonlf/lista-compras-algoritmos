import type { Produto } from "../dominio/produto";

export type ResultadoBusca = {
  indice: number;
  produto: Produto | null;
  comparacoes: number;
};

/**
 * Busca Linear — Complexidade O(n)
 *
 * Percorre a lista elemento por elemento, do índice 0 até o final.
 * - Melhor caso: O(1) — o item está na primeira posição.
 * - Caso médio: O(n) — em média percorre metade da lista (n/2).
 * - Pior caso: O(n) — o item está no final ou não existe (percorre todos os n itens).
 * - Memória auxiliar: O(1) — não aloca memória adicional.
 * - Pré-requisito: Nenhum (funciona mesmo em coleções desordenadas).
 */
export function buscaLinear(itens: Produto[], precoAlvoCentavos: number): ResultadoBusca {
  let comparacoes = 0;

  for (let i = 0; i < itens.length; i += 1) {
    comparacoes += 1;
    if (itens[i].precoCentavos === precoAlvoCentavos) {
      return {
        indice: i,
        produto: itens[i],
        comparacoes,
      };
    }
  }

  return {
    indice: -1,
    produto: null,
    comparacoes,
  };
}
