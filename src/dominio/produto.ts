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

export const PRODUTOS_MOCK: Produto[] = [
  { id: "mock-1", nome: "Detergente líquido 500ml", precoCentavos: 245 },
  { id: "mock-2", nome: "Molho de tomate 300g", precoCentavos: 289 },
  { id: "mock-3", nome: "Macarrão espaguete 500g", precoCentavos: 415 },
  { id: "mock-4", nome: "Açúcar refinado 1kg", precoCentavos: 460 },
  { id: "mock-5", nome: "Leite integral 1L", precoCentavos: 549 },
  { id: "mock-6", nome: "Óleo de soja 900ml", precoCentavos: 720 },
  { id: "mock-7", nome: "Feijão carioca 1kg", precoCentavos: 875 },
  { id: "mock-8", nome: "Sabão em pó 1kg", precoCentavos: 1350 },
  { id: "mock-9", nome: "Café torrado 500g", precoCentavos: 1890 },
  { id: "mock-10", nome: "Arroz tipo 1 5kg", precoCentavos: 2990 },
];
