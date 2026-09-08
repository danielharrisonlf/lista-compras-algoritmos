import { ALGORITMOS, type Algoritmo, type IdAlgoritmo } from "../algoritmos";
import { compararPorPreco, type Produto } from "../dominio/produto";

export const REPETICOES = 10;
export const AQUECIMENTOS = 1;

export type ResultadoAlgoritmo = {
  id: IdAlgoritmo;
  nome: string;
  amostras: number[];
  medianaMs: number;
  minimoMs: number;
  maximoMs: number;
  saidaValida: boolean;
  melhorCaso: string;
  casoMedio: string;
  piorCaso: string;
  memoriaAuxiliar: string;
};

export type ResultadoBenchmark = {
  descricaoEntrada: string;
  tamanho: number;
  repeticoes: number;
  aquecimentos: number;
  resolucaoRelogioMs: number;
  proximoDaResolucao: boolean;
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

export function medirResolucaoRelogio(): number {
  let menor = Infinity;

  for (let tentativa = 0; tentativa < 50; tentativa += 1) {
    const inicio = agora();
    let fim = agora();
    let giros = 0;

    while (fim === inicio && giros < 1_000_000) {
      fim = agora();
      giros += 1;
    }

    const delta = fim - inicio;
    if (delta > 0 && delta < menor) menor = delta;
  }

  return Number.isFinite(menor) ? menor : 1;
}

export function saidaEstaCorreta(entrada: Produto[], saida: Produto[]): boolean {
  if (saida.length !== entrada.length) return false;

  for (let i = 1; i < saida.length; i += 1) {
    if (saida[i - 1].precoCentavos > saida[i].precoCentavos) return false;
  }

  const contagem = new Map<string, number>();

  for (const produto of entrada) {
    contagem.set(produto.id, (contagem.get(produto.id) ?? 0) + 1);
  }

  for (const produto of saida) {
    const restante = contagem.get(produto.id);
    if (restante === undefined || restante === 0) return false;
    contagem.set(produto.id, restante - 1);
  }

  return true;
}

function cederExecucao(): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, 0));
}

export async function executarBenchmark(
  entrada: Produto[],
  descricaoEntrada: string,
  assinatura: string,
  aoProgredir?: (progresso: ProgressoBenchmark) => void,
): Promise<ResultadoBenchmark> {
  const resolucaoRelogioMs = medirResolucaoRelogio();
  const amostras = new Map<IdAlgoritmo, number[]>();
  const validade = new Map<IdAlgoritmo, boolean>();

  for (const algoritmo of ALGORITMOS) {
    amostras.set(algoritmo.id, []);
    validade.set(algoritmo.id, true);
  }

  for (const algoritmo of ALGORITMOS) {
    for (let i = 0; i < AQUECIMENTOS; i += 1) {
      algoritmo.ordenar(entrada.slice(), compararPorPreco);
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

      const copia = entrada.slice();

      const inicio = agora();
      const saida = algoritmo.ordenar(copia, compararPorPreco);
      const fim = agora();

      amostras.get(algoritmo.id)!.push(fim - inicio);

      if (!saidaEstaCorreta(entrada, saida)) {
        validade.set(algoritmo.id, false);
      }
    }
  }

  const resultados: ResultadoAlgoritmo[] = ALGORITMOS.map((algoritmo) => {
    const tempos = amostras.get(algoritmo.id)!;

    return {
      id: algoritmo.id,
      nome: algoritmo.nome,
      amostras: tempos,
      medianaMs: mediana(tempos),
      minimoMs: Math.min(...tempos),
      maximoMs: Math.max(...tempos),
      saidaValida: validade.get(algoritmo.id)!,
      melhorCaso: algoritmo.melhorCaso,
      casoMedio: algoritmo.casoMedio,
      piorCaso: algoritmo.piorCaso,
      memoriaAuxiliar: algoritmo.memoriaAuxiliar,
    };
  });

  const menorMediana = Math.min(...resultados.map((r) => r.medianaMs));

  return {
    descricaoEntrada,
    tamanho: entrada.length,
    repeticoes: REPETICOES,
    aquecimentos: AQUECIMENTOS,
    resolucaoRelogioMs,
    proximoDaResolucao: menorMediana < resolucaoRelogioMs * 10,
    resultados,
    assinatura,
  };
}
