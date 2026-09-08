import type { Comparador } from "../dominio/produto";

export function mergeSort<T>(itens: T[], comparar: Comparador<T>): T[] {
  if (itens.length <= 1) {
    return itens;
  }

  const meio = Math.floor(itens.length / 2);
  const esquerda = mergeSort(itens.slice(0, meio), comparar);
  const direita = mergeSort(itens.slice(meio), comparar);

  return intercalar(esquerda, direita, comparar);
}

function intercalar<T>(esquerda: T[], direita: T[], comparar: Comparador<T>): T[] {
  const saida: T[] = new Array(esquerda.length + direita.length);
  let e = 0;
  let d = 0;
  let s = 0;

  while (e < esquerda.length && d < direita.length) {
    if (comparar(esquerda[e], direita[d]) <= 0) {
      saida[s] = esquerda[e];
      e += 1;
    } else {
      saida[s] = direita[d];
      d += 1;
    }
    s += 1;
  }

  while (e < esquerda.length) {
    saida[s] = esquerda[e];
    e += 1;
    s += 1;
  }

  while (d < direita.length) {
    saida[s] = direita[d];
    d += 1;
    s += 1;
  }

  return saida;
}
