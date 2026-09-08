import type { Comparador } from "../dominio/produto";

export function bubbleSort<T>(itens: T[], comparar: Comparador<T>): T[] {
  let fim = itens.length - 1;
  let houveTroca = true;

  while (houveTroca && fim > 0) {
    houveTroca = false;

    for (let i = 0; i < fim; i += 1) {
      if (comparar(itens[i], itens[i + 1]) > 0) {
        const temporario = itens[i];
        itens[i] = itens[i + 1];
        itens[i + 1] = temporario;
        houveTroca = true;
      }
    }

    fim -= 1;
  }

  return itens;
}
