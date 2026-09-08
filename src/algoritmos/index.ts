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
    melhorCaso: "O(1)",
    casoMedio: "O(n)",
    piorCaso: "O(n)",
    memoriaAuxiliar: "O(1)",
    preRequisito: "aceita a lista em qualquer ordem",
    resumo: "Percorre a lista item por item, do começo ao fim.",
  },
  {
    id: "binaria",
    nome: "Busca Binária",
    buscar: buscaBinaria,
    notacaoBigO: "O(log n)",
    melhorCaso: "O(1)",
    casoMedio: "O(log n)",
    piorCaso: "O(log n)",
    memoriaAuxiliar: "O(1)",
    preRequisito: "exige a lista ordenada por preço",
    resumo: "Corta o espaço de busca ao meio a cada passo.",
  },
];

export function algoritmoPorId(id: IdAlgoritmo): Algoritmo {
  const encontrado = ALGORITMOS.find((a) => a.id === id);

  if (!encontrado) {
    throw new Error(`Algoritmo desconhecido: ${id}`);
  }

  return encontrado;
}
