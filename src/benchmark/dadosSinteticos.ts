import type { Produto } from "../dominio/produto";

export const SEMENTE_PADRAO = 20260908;

export const TAMANHOS_DISPONIVEIS = [1000, 10000, 100000] as const;
export type TamanhoEntrada = (typeof TAMANHOS_DISPONIVEIS)[number];

export const CENARIOS = ["pior_caso", "caso_medio", "melhor_caso"] as const;
export type Cenario = (typeof CENARIOS)[number];

export const ROTULO_CENARIO: Record<Cenario, string> = {
  pior_caso: "Pior caso (último item)",
  caso_medio: "Caso médio (item central)",
  melhor_caso: "Melhor caso (primeiro item)",
};

export const DESCRICAO_CENARIO: Record<Cenario, string> = {
  pior_caso: "Item na última posição: a busca linear precisa percorrer todos os N elementos.",
  caso_medio: "Item no meio da lista: a busca linear percorre N/2 elementos; a binária resolve rapidamente.",
  melhor_caso: "Item na primeira posição: a busca linear encontra logo na primeira verificação.",
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

/**
 * Gera uma lista de produtos ordenados crescentemente por preço para teste de busca.
 */
export function gerarProdutos(tamanho: number): Produto[] {
  const produtos: Produto[] = new Array(tamanho);

  // Preços iniciam em R$ 1,00 (100 centavos) e crescem de 5 em 5 centavos
  for (let i = 0; i < tamanho; i += 1) {
    produtos[i] = {
      id: `prod-${i}`,
      nome: `${CATEGORIAS[i % CATEGORIAS.length]} #${i + 1}`,
      precoCentavos: 100 + i * 5,
    };
  }

  return produtos;
}

/**
 * Determina o preço alvo a ser buscado com base no cenário escolhido.
 */
export function obterPrecoAlvo(produtos: Produto[], cenario: Cenario): number {
  if (produtos.length === 0) return 100;

  switch (cenario) {
    case "melhor_caso":
      // Primeiro item
      return produtos[0].precoCentavos;

    case "caso_medio": {
      // Item do meio da lista
      const meio = Math.floor(produtos.length / 2);
      return produtos[meio].precoCentavos;
    }

    case "pior_caso":
    default:
      // Último item da lista
      return produtos[produtos.length - 1].precoCentavos;
  }
}
