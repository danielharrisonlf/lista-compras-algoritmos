export type Produto = {
  id: string;
  nome: string;
  precoCentavos: number;
};

export type Comparador<T> = (a: T, b: T) => number;

let contadorIds = 0;

export function novoId(prefixo = "p"): string {
  contadorIds += 1;
  return `${prefixo}-${Date.now().toString(36)}-${contadorIds.toString(36)}`;
}

export function compararPorPreco(a: Produto, b: Produto): number {
  return a.precoCentavos - b.precoCentavos;
}
