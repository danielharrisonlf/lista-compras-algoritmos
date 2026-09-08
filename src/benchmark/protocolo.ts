import { ALGORITMOS, type Algoritmo, type IdAlgoritmo, type ResultadoBusca } from "../algoritmos";
import type { Produto } from "../dominio/produto";

export const REPETICOES = 10;
export const AQUECIMENTOS = 2;

export function loteDeBuscas(tamanho: number): number {
  if (tamanho <= 1_000) return 2_000;
  if (tamanho <= 10_000) return 500;
  return 100;
}

export type ResultadoAlgoritmo = {
  id: IdAlgoritmo;
  nome: string;
  notacaoBigO: string;
  amostrasMs: number[];
  medianaMs: number;
  comparacoes: number;
  indiceEncontrado: number;
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
  resultadosConcordam: boolean;
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
  listaOrdenada: Produto[],
  precoAlvoCentavos: number,
  descricaoEntrada: string,
  assinatura: string,
  aoProgredir?: (progresso: ProgressoBenchmark) => void,
): Promise<ResultadoBenchmark> {
  const loteBuscas = loteDeBuscas(listaOrdenada.length);

  const amostras = new Map<IdAlgoritmo, number[]>();
  const comparacoesPorAlgoritmo = new Map<IdAlgoritmo, number>();
  const indicePorAlgoritmo = new Map<IdAlgoritmo, number>();

  for (const algoritmo of ALGORITMOS) {
    amostras.set(algoritmo.id, []);
  }

  for (const algoritmo of ALGORITMOS) {
    for (let i = 0; i < AQUECIMENTOS; i += 1) {
      for (let j = 0; j < loteBuscas; j += 1) {
        algoritmo.buscar(listaOrdenada, precoAlvoCentavos);
      }
    }
    await cederExecucao();
  }

  for (let rodada = 0; rodada < REPETICOES; rodada += 1) {
    const ordemDaRodada: Algoritmo[] = ALGORITMOS.map(
      (_, indice) => ALGORITMOS[(indice + rodada) % ALGORITMOS.length],
    );

    for (const algoritmo of ordemDaRodada) {
      aoProgredir?.({
        rodada: rodada + 1,
        totalRodadas: REPETICOES,
        algoritmo: algoritmo.nome,
      });
      await cederExecucao();

      const inicio = agora();
      let ultimo: ResultadoBusca | null = null;
      for (let k = 0; k < loteBuscas; k += 1) {
        ultimo = algoritmo.buscar(listaOrdenada, precoAlvoCentavos);
      }
      const fim = agora();

      amostras.get(algoritmo.id)!.push((fim - inicio) / loteBuscas);

      if (ultimo) {
        comparacoesPorAlgoritmo.set(algoritmo.id, ultimo.comparacoes);
        indicePorAlgoritmo.set(algoritmo.id, ultimo.indice);
      }
    }
  }

  const precosEncontrados = ALGORITMOS.map((a) => {
    const indice = indicePorAlgoritmo.get(a.id) ?? -1;
    return indice >= 0 ? listaOrdenada[indice].precoCentavos : null;
  });
  const resultadosConcordam = precosEncontrados.every((p) => p === precosEncontrados[0]);

  const resultados: ResultadoAlgoritmo[] = ALGORITMOS.map((algoritmo) => {
    const tempos = amostras.get(algoritmo.id)!;

    return {
      id: algoritmo.id,
      nome: algoritmo.nome,
      notacaoBigO: algoritmo.notacaoBigO,
      amostrasMs: tempos,
      medianaMs: mediana(tempos),
      comparacoes: comparacoesPorAlgoritmo.get(algoritmo.id) ?? 0,
      indiceEncontrado: indicePorAlgoritmo.get(algoritmo.id) ?? -1,
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
    loteBuscas,
    resultadosConcordam,
    resultados,
    assinatura,
  };
}
