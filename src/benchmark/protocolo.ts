import { ALGORITMOS, type Algoritmo, type IdAlgoritmo, type ResultadoBusca } from "../algoritmos";
import type { Produto } from "../dominio/produto";

export const REPETICOES = 10;
export const AQUECIMENTOS = 2;
// Lote de buscas por amostra para garantir precisão mensurável no performance.now()
export const LOTE_BUSCAS = 200;

export type ResultadoAlgoritmo = {
  id: IdAlgoritmo;
  nome: string;
  notacaoBigO: string;
  corGrafico: string;
  amostrasMs: number[];
  medianaMs: number;
  comparacoes: number; // Quantidade de comparações/passos efetuados
  indiceEncontrado: number;
  saidaValida: boolean;
  melhorCaso: string;
  casoMedio: string;
  piorCaso: string;
  memoriaAuxiliar: string;
  preRequisito: string;
};

export type ResultadoBenchmark = {
  descricaoEntrada: string;
  tamanho: number;
  precoAlvoCentavos: number;
  repeticoes: number;
  loteBuscas: number;
  resultados: ResultadoAlgoritmo[];
  assinatura: string;
};

export type ProgressoBenchmark = {
  rodada: number;
  totalRodadas: number;
  algoritmo: string;
};

const agora: () => number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

export function mediana(valores: number[]): number {
  if (valores.length === 0) return NaN;

  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);

  return ordenados.length % 2 === 1
    ? ordenados[meio]
    : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

function cederExecucao(): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, 0));
}

export async function executarBenchmark(
  produtos: Produto[],
  precoAlvoCentavos: number,
  descricaoEntrada: string,
  assinatura: string,
  aoProgredir?: (progresso: ProgressoBenchmark) => void,
): Promise<ResultadoBenchmark> {
  // Garantir que os produtos estejam ordenados por preço para o teste
  const listaOrdenada = [...produtos].sort((a, b) => a.precoCentavos - b.precoCentavos);

  const amostras = new Map<IdAlgoritmo, number[]>();
  const comparacoesMap = new Map<IdAlgoritmo, number>();
  const indicesMap = new Map<IdAlgoritmo, number>();

  for (const algoritmo of ALGORITMOS) {
    amostras.set(algoritmo.id, []);
  }

  // 1. Aquecimento do JIT/V8/Hermes
  for (const algoritmo of ALGORITMOS) {
    for (let i = 0; i < AQUECIMENTOS; i += 1) {
      for (let j = 0; j < LOTE_BUSCAS; j += 1) {
        algoritmo.buscar(listaOrdenada, precoAlvoCentavos);
      }
    }
    await cederExecucao();
  }

  // 2. Coleta de amostras medidas
  for (let rodada = 0; rodada < REPETICOES; rodada += 1) {
    // Alterna a ordem de execução para mitigar viés de cache
    const ordem = ALGORITMOS.slice().reverse();

    for (const algoritmo of ordem) {
      aoProgredir?.({
        rodada: rodada + 1,
        totalRodadas: REPETICOES,
        algoritmo: algoritmo.nome,
      });
      await cederExecucao();

      const inicio = agora();
      let resultadoBusca: ResultadoBusca | null = null;
      for (let k = 0; k < LOTE_BUSCAS; k += 1) {
        resultadoBusca = algoritmo.buscar(listaOrdenada, precoAlvoCentavos);
      }
      const fim = agora();

      // Tempo médio por busca individual em milissegundos
      const tempoIndividual = (fim - inicio) / LOTE_BUSCAS;
      amostras.get(algoritmo.id)!.push(tempoIndividual);

      if (resultadoBusca) {
        comparacoesMap.set(algoritmo.id, resultadoBusca.comparacoes);
        indicesMap.set(algoritmo.id, resultadoBusca.indice);
      }
    }
  }

  // Verificar se ambos os algoritmos encontraram exatamente o mesmo índice
  const indiceLinear = indicesMap.get("linear") ?? -1;
  const indiceBinario = indicesMap.get("binaria") ?? -1;
  const indicesConcordam = indiceLinear === indiceBinario;

  const resultados: ResultadoAlgoritmo[] = ALGORITMOS.map((algoritmo) => {
    const tempos = amostras.get(algoritmo.id)!;

    return {
      id: algoritmo.id,
      nome: algoritmo.nome,
      notacaoBigO: algoritmo.notacaoBigO,
      corGrafico: algoritmo.corGrafico,
      amostrasMs: tempos,
      medianaMs: mediana(tempos),
      comparacoes: comparacoesMap.get(algoritmo.id) ?? 0,
      indiceEncontrado: indicesMap.get(algoritmo.id) ?? -1,
      saidaValida: indicesConcordam,
      melhorCaso: algoritmo.melhorCaso,
      casoMedio: algoritmo.casoMedio,
      piorCaso: algoritmo.piorCaso,
      memoriaAuxiliar: algoritmo.memoriaAuxiliar,
      preRequisito: algoritmo.preRequisito,
    };
  });

  return {
    descricaoEntrada,
    tamanho: listaOrdenada.length,
    precoAlvoCentavos,
    repeticoes: REPETICOES,
    loteBuscas: LOTE_BUSCAS,
    resultados,
    assinatura,
  };
}
