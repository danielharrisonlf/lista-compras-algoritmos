import type { Produto } from "../dominio/produto";

export const TAMANHOS_DISPONIVEIS = [1000, 10000, 100000] as const;
export type TamanhoEntrada = (typeof TAMANHOS_DISPONIVEIS)[number];

export const CENARIOS = ["pior", "medio", "melhor"] as const;
export type Cenario = (typeof CENARIOS)[number];

export const ROTULO_CENARIO: Record<Cenario, string> = {
  pior: "Último item",
  medio: "Item do meio",
  melhor: "Primeiro item",
};

const CATEGORIAS = [
  "Arroz",
  "Feijão",
  "Macarrão",
  "Café",
  "Leite",
  "Açúcar",
  "Farinha",
  "Óleo",
  "Sabão",
  "Detergente",
  "Biscoito",
  "Molho",
  "Queijo",
  "Presunto",
];

export function gerarProdutos(tamanho: number): Produto[] {
  const produtos: Produto[] = new Array(tamanho);

  for (let i = 0; i < tamanho; i += 1) {
    produtos[i] = {
      id: `teste-${i}`,
      nome: `${CATEGORIAS[i % CATEGORIAS.length]} ${i + 1}`,
      precoCentavos: 100 + i * 5,
    };
  }

  return produtos;
}

export function obterPrecoAlvo(listaOrdenada: Produto[], cenario: Cenario): number {
  if (listaOrdenada.length === 0) return 100;

  switch (cenario) {
    case "melhor":
      return listaOrdenada[0].precoCentavos;
    case "medio":
      return listaOrdenada[Math.floor(listaOrdenada.length / 2)].precoCentavos;
    default:
      return listaOrdenada[listaOrdenada.length - 1].precoCentavos;
  }
}
