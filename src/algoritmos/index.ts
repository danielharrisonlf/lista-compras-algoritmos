import type { Produto } from "../dominio/produto";
import { buscaLinear, type ResultadoBusca } from "./buscaLinear";
import { buscaBinaria } from "./buscaBinaria";

export { buscaLinear, buscaBinaria, type ResultadoBusca };

export type IdAlgoritmo = "linear" | "binaria";

export type FuncaoBusca = (itens: Produto[], precoAlvoCentavos: number) => ResultadoBusca;

export type Algoritmo = {
  id: IdAlgoritmo;
  nome: string;
  buscar: FuncaoBusca;
  notacaoBigO: string;
  corGrafico: string; // Amarelo para O(n), Verde para O(log n)
  melhorCaso: string;
  casoMedio: string;
  piorCaso: string;
  memoriaAuxiliar: string;
  preRequisito: string;
  resumo: string;
};

export const ALGORITMOS: Algoritmo[] = [
  {
    id: "linear",
    nome: "Busca Linear",
    buscar: buscaLinear,
    notacaoBigO: "O(n)",
    corGrafico: "#EAB308", // Amarelo (faixa O(n) do Big-O Cheat Sheet)
    melhorCaso: "O(1)",
    casoMedio: "O(n)",
    piorCaso: "O(n)",
    memoriaAuxiliar: "O(1)",
    preRequisito: "Nenhum (aceita lista em qualquer ordem)",
    resumo:
      "Percorre a lista elemento por elemento a partir do início. Em 100.000 itens, pode precisar de até 100.000 comparações.",
  },
  {
    id: "binaria",
    nome: "Busca Binária",
    buscar: buscaBinaria,
    notacaoBigO: "O(log n)",
    corGrafico: "#22C55E", // Verde (faixa O(log n) do Big-O Cheat Sheet)
    melhorCaso: "O(1)",
    casoMedio: "O(log n)",
    piorCaso: "O(log n)",
    memoriaAuxiliar: "O(1)",
    preRequisito: "A lista precisa estar ordenada por preço",
    resumo:
      "Divide a lista pela metade a cada passo. Em 100.000 itens, encontra qualquer elemento em no máximo 17 comparações.",
  },
];

export function algoritmoPorId(id: IdAlgoritmo): Algoritmo {
  const encontrado = ALGORITMOS.find((a) => a.id === id);

  if (!encontrado) {
    throw new Error(`Algoritmo desconhecido: ${id}`);
  }

  return encontrado;
}
