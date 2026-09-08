import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRECO_MAXIMO_CENTAVOS } from "../dominio/preco";
import type { Produto } from "../dominio/produto";

const CHAVE = "lista-compras:produtos:v1";

function ehProdutoValido(valor: unknown): valor is Produto {
  if (typeof valor !== "object" || valor === null) return false;

  const p = valor as Record<string, unknown>;

  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    typeof p.nome === "string" &&
    typeof p.precoCentavos === "number" &&
    Number.isInteger(p.precoCentavos) &&
    p.precoCentavos > 0 &&
    p.precoCentavos <= PRECO_MAXIMO_CENTAVOS
  );
}

export async function carregarProdutos(): Promise<Produto[]> {
  const bruto = await AsyncStorage.getItem(CHAVE);
  if (!bruto) return [];

  try {
    const analisado: unknown = JSON.parse(bruto);
    if (!Array.isArray(analisado)) return [];
    return analisado.filter(ehProdutoValido);
  } catch {
    return [];
  }
}

export async function salvarProdutos(produtos: Produto[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(produtos));
}
