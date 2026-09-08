import type { Comparador } from "../dominio/produto";

export function insertionSort<T>(itens: T[], comparar: Comparador<T>): T[] {
  for (let i = 1; i < itens.length; i += 1) {
    const chave = itens[i];
    let j = i - 1;

    while (j >= 0 && comparar(itens[j], chave) > 0) {
      itens[j + 1] = itens[j];
      j -= 1;
    }

    itens[j + 1] = chave;
  }

  return itens;
}
