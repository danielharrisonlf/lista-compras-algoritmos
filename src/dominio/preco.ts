export const PRECO_MAXIMO_CENTAVOS = 99_999_999;

export type ResultadoPreco =
  | { ok: true; centavos: number }
  | { ok: false; erro: string };

export function analisarPreco(textoOriginal: string): ResultadoPreco {
  const texto = textoOriginal.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");

  if (texto.length === 0) {
    return { ok: false, erro: "Informe o preço." };
  }

  let normalizado = texto;

  if (texto.includes(".") && texto.includes(",")) {
    if (texto.lastIndexOf(",") < texto.lastIndexOf(".")) {
      return { ok: false, erro: "Formato não reconhecido. Use 1.234,56 ou 1234.56." };
    }
    normalizado = texto.replace(/\./g, "");
  }

  normalizado = normalizado.replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
    return {
      ok: false,
      erro: "Preço inválido. Use até 2 casas decimais, por exemplo 12,50.",
    };
  }

  const [inteiros, decimais = ""] = normalizado.split(".");
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));

  if (centavos <= 0) {
    return { ok: false, erro: "O preço precisa ser maior que zero." };
  }

  if (centavos > PRECO_MAXIMO_CENTAVOS) {
    return {
      ok: false,
      erro: `O preço máximo aceito é ${formatarPreco(PRECO_MAXIMO_CENTAVOS)}.`,
    };
  }

  return { ok: true, centavos };
}

export function formatarPreco(centavos: number): string {
  const negativo = centavos < 0;
  const absoluto = Math.abs(Math.trunc(centavos));
  const inteiros = Math.floor(absoluto / 100).toString();
  const decimais = (absoluto % 100).toString().padStart(2, "0");
  const comMilhar = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${negativo ? "-" : ""}R$ ${comMilhar},${decimais}`;
}
