import type { Comparador } from "../dominio/produto";
import { bubbleSort } from "./bubbleSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";

export { bubbleSort, insertionSort, mergeSort };

export type IdAlgoritmo = "bubble" | "insertion" | "merge";

export type FuncaoOrdenacao = <T>(itens: T[], comparar: Comparador<T>) => T[];

export type Algoritmo = {
  id: IdAlgoritmo;
  nome: string;
  ordenar: FuncaoOrdenacao;
  melhorCaso: string;
  casoMedio: string;
  piorCaso: string;
  memoriaAuxiliar: string;
  resumo: string;
};

export const ALGORITMOS: Algoritmo[] = [
  {
    id: "bubble",
    nome: "Bubble Sort",
    ordenar: bubbleSort,
    melhorCaso: "O(n)",
    casoMedio: "O(n²)",
    piorCaso: "O(n²)",
    memoriaAuxiliar: "O(1)",
    resumo:
      "Troca vizinhos fora de ordem a cada passagem. Com parada antecipada, uma lista já ordenada custa uma única passagem.",
  },
  {
    id: "insertion",
    nome: "Insertion Sort",
    ordenar: insertionSort,
    melhorCaso: "O(n)",
    casoMedio: "O(n²)",
    piorCaso: "O(n²)",
    memoriaAuxiliar: "O(1)",
    resumo:
      "Mantém um trecho ordenado no começo e insere cada novo elemento no lugar certo, deslocando os maiores para a direita.",
  },
  {
    id: "merge",
    nome: "Merge Sort",
    ordenar: mergeSort,
    melhorCaso: "O(n log n)",
    casoMedio: "O(n log n)",
    piorCaso: "O(n log n)",
    memoriaAuxiliar: "O(n)",
    resumo:
      "Divide ao meio até sobrar um elemento e depois intercala as metades ordenadas. Gasta memória extra para ganhar tempo.",
  },
];

export function algoritmoPorId(id: IdAlgoritmo): Algoritmo {
  const encontrado = ALGORITMOS.find((a) => a.id === id);

  if (!encontrado) {
    throw new Error(`Algoritmo desconhecido: ${id}`);
  }

  return encontrado;
}
