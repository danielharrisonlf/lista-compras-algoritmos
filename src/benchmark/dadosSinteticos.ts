import { PRECO_MAXIMO_CENTAVOS } from "../dominio/preco";
import type { Produto } from "../dominio/produto";

export const SEMENTE_PADRAO = 20260908;

export const TAMANHOS_DISPONIVEIS = [100, 1000, 5000] as const;
export type TamanhoEntrada = (typeof TAMANHOS_DISPONIVEIS)[number];

export const CENARIOS = ["aleatorio", "ordenado", "inverso"] as const;
export type Cenario = (typeof CENARIOS)[number];

export const ROTULO_CENARIO: Record<Cenario, string> = {
  aleatorio: "Aleatório",
  ordenado: "Já ordenado",
  inverso: "Ordem inversa",
};

export const DESCRICAO_CENARIO: Record<Cenario, string> = {
  aleatorio: "Preços embaralhados: o caso médio, o mais parecido com uma lista real.",
  ordenado: "Preços já em ordem crescente: o melhor caso de Bubble e Insertion.",
  inverso: "Preços em ordem decrescente: o pior caso de Bubble e Insertion.",
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

const PRECO_MINIMO_SINTETICO = 50;
const PRECO_MAXIMO_SINTETICO = Math.min(19_999, PRECO_MAXIMO_CENTAVOS);

function criarGeradorDeterministico(semente: number): () => number {
  let estado = semente >>> 0;

  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gerarProdutos(
  tamanho: number,
  cenario: Cenario,
  semente: number = SEMENTE_PADRAO,
): Produto[] {
  const sortear = criarGeradorDeterministico(semente + tamanho);
  const faixa = PRECO_MAXIMO_SINTETICO - PRECO_MINIMO_SINTETICO;
  const produtos: Produto[] = new Array(tamanho);

  for (let i = 0; i < tamanho; i += 1) {
    produtos[i] = {
      id: `teste-${i}`,
      nome: `${CATEGORIAS[i % CATEGORIAS.length]} ${i + 1}`,
      precoCentavos: PRECO_MINIMO_SINTETICO + Math.floor(sortear() * (faixa + 1)),
    };
  }

  if (cenario === "ordenado") {
    produtos.sort((a, b) => a.precoCentavos - b.precoCentavos);
  } else if (cenario === "inverso") {
    produtos.sort((a, b) => b.precoCentavos - a.precoCentavos);
  }

  return produtos;
}
