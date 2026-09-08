import { ALGORITMOS } from "../src/algoritmos";
import { analisarPreco, formatarPreco, PRECO_MAXIMO_CENTAVOS } from "../src/dominio/preco";
import { compararPorPreco, type Produto } from "../src/dominio/produto";
import {
  CENARIOS,
  SEMENTE_PADRAO,
  TAMANHOS_DISPONIVEIS,
  gerarProdutos,
} from "../src/benchmark/dadosSinteticos";
import {
  AQUECIMENTOS,
  REPETICOES,
  executarBenchmark,
  mediana,
  saidaEstaCorreta,
} from "../src/benchmark/protocolo";

let passaram = 0;
const falhas: string[] = [];

function teste(nome: string, corpo: () => void) {
  try {
    corpo();
    passaram += 1;
  } catch (erro) {
    falhas.push(`${nome}\n    ${erro instanceof Error ? erro.message : String(erro)}`);
  }
}

function afirmar(condicao: boolean, mensagem: string) {
  if (!condicao) throw new Error(mensagem);
}

function afirmarIgual(recebido: unknown, esperado: unknown, mensagem: string) {
  const a = JSON.stringify(recebido);
  const b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${mensagem}\n    esperado: ${b}\n    recebido: ${a}`);
}

function produto(id: string, precoCentavos: number, nome = id): Produto {
  return { id, nome, precoCentavos };
}

teste("analisarPreco aceita vírgula, ponto e inteiro", () => {
  afirmarIgual(analisarPreco("12,50"), { ok: true, centavos: 1250 }, "vírgula");
  afirmarIgual(analisarPreco("12.50"), { ok: true, centavos: 1250 }, "ponto");
  afirmarIgual(analisarPreco("12"), { ok: true, centavos: 1200 }, "inteiro");
  afirmarIgual(analisarPreco("12,5"), { ok: true, centavos: 1250 }, "uma casa decimal");
  afirmarIgual(analisarPreco(" R$ 1.234,56 "), { ok: true, centavos: 123456 }, "milhar + moeda");
  afirmarIgual(analisarPreco("0,01"), { ok: true, centavos: 1 }, "menor preço válido");
});

teste("analisarPreco recusa entradas ambíguas ou inválidas", () => {
  const invalidos = ["", "abc", "12,345", "1.234", "-5", "0", "1,2,3", "12,5,6"];
  for (const entrada of invalidos) {
    const resultado = analisarPreco(entrada);
    afirmar(resultado.ok === false, `deveria recusar ${JSON.stringify(entrada)}`);
  }
});

teste("analisarPreco respeita o teto documentado", () => {
  afirmar(analisarPreco("999999,99").ok === true, "teto deve ser aceito");
  afirmar(analisarPreco("1000000,00").ok === false, "acima do teto deve ser recusado");
  afirmarIgual(PRECO_MAXIMO_CENTAVOS, 99999999, "teto em centavos");
});

teste("formatarPreco usa o padrão brasileiro", () => {
  afirmarIgual(formatarPreco(1250), "R$ 12,50", "valor simples");
  afirmarIgual(formatarPreco(5), "R$ 0,05", "centavos");
  afirmarIgual(formatarPreco(123456789), "R$ 1.234.567,89", "milhares");
});

const casos: { nome: string; entrada: Produto[] }[] = [
  { nome: "vazio", entrada: [] },
  { nome: "um item", entrada: [produto("a", 500)] },
  { nome: "dois itens fora de ordem", entrada: [produto("a", 900), produto("b", 100)] },
  {
    nome: "aleatório",
    entrada: [produto("a", 750), produto("b", 120), produto("c", 3000), produto("d", 99), produto("e", 750)],
  },
  {
    nome: "já ordenado",
    entrada: [produto("a", 100), produto("b", 200), produto("c", 300), produto("d", 400)],
  },
  {
    nome: "ordem inversa",
    entrada: [produto("a", 400), produto("b", 300), produto("c", 200), produto("d", 100)],
  },
  {
    nome: "todos com o mesmo preço",
    entrada: [produto("a", 250), produto("b", 250), produto("c", 250)],
  },
];

for (const algoritmo of ALGORITMOS) {
  for (const caso of casos) {
    teste(`${algoritmo.nome}: ${caso.nome}`, () => {
      const saida = algoritmo.ordenar(caso.entrada.slice(), compararPorPreco);
      afirmar(
        saidaEstaCorreta(caso.entrada, saida),
        "saída deve estar ordenada e conter exatamente os mesmos produtos",
      );
    });
  }

  teste(`${algoritmo.nome}: preserva a ordem original em preços iguais (estável)`, () => {
    const entrada = [
      produto("primeiro", 500),
      produto("segundo", 100),
      produto("terceiro", 500),
      produto("quarto", 100),
      produto("quinto", 500),
    ];
    const saida = algoritmo.ordenar(entrada.slice(), compararPorPreco);
    afirmarIgual(
      saida.map((p) => p.id),
      ["segundo", "quarto", "primeiro", "terceiro", "quinto"],
      "empates devem manter a ordem de cadastro",
    );
  });

  teste(`${algoritmo.nome}: não perde produtos com nome e preço repetidos`, () => {
    const entrada = [
      produto("id1", 300, "Arroz"),
      produto("id2", 300, "Arroz"),
      produto("id3", 100, "Arroz"),
    ];
    const saida = algoritmo.ordenar(entrada.slice(), compararPorPreco);
    afirmarIgual(saida.length, 3, "quantidade deve ser preservada");
    afirmarIgual(
      saida.map((p) => p.id).sort(),
      ["id1", "id2", "id3"],
      "todos os ids devem continuar presentes",
    );
  });

  teste(`${algoritmo.nome}: concorda com uma ordenação de referência (n = 500)`, () => {
    const entrada = gerarProdutos(500, "aleatorio");
    const saida = algoritmo.ordenar(entrada.slice(), compararPorPreco);
    const referencia = entrada.slice().sort((a, b) => a.precoCentavos - b.precoCentavos);
    afirmarIgual(
      saida.map((p) => p.precoCentavos),
      referencia.map((p) => p.precoCentavos),
      "a sequência de preços deve bater com a referência",
    );
  });
}

teste("os algoritmos não modificam o array original quando recebem uma cópia", () => {
  const original = [produto("a", 900), produto("b", 100)];
  for (const algoritmo of ALGORITMOS) {
    algoritmo.ordenar(original.slice(), compararPorPreco);
  }
  afirmarIgual(original.map((p) => p.id), ["a", "b"], "o array de origem deve continuar intacto");
});

teste("gerarProdutos é reproduzível com a mesma semente", () => {
  const a = gerarProdutos(200, "aleatorio", SEMENTE_PADRAO);
  const b = gerarProdutos(200, "aleatorio", SEMENTE_PADRAO);
  afirmarIgual(
    a.map((p) => p.precoCentavos),
    b.map((p) => p.precoCentavos),
    "mesma semente deve gerar exatamente os mesmos preços",
  );
  const c = gerarProdutos(200, "aleatorio", SEMENTE_PADRAO + 1);
  afirmar(
    JSON.stringify(a.map((p) => p.precoCentavos)) !== JSON.stringify(c.map((p) => p.precoCentavos)),
    "sementes diferentes devem gerar entradas diferentes",
  );
});

teste("gerarProdutos respeita tamanhos e cenários", () => {
  for (const tamanho of TAMANHOS_DISPONIVEIS) {
    for (const cenario of CENARIOS) {
      const dados = gerarProdutos(tamanho, cenario);
      afirmarIgual(dados.length, tamanho, `tamanho ${tamanho} no cenário ${cenario}`);
      const precos = dados.map((p) => p.precoCentavos);
      if (cenario === "ordenado") {
        afirmar(
          precos.every((v, i) => i === 0 || precos[i - 1] <= v),
          "cenário ordenado deve estar crescente",
        );
      }
      if (cenario === "inverso") {
        afirmar(
          precos.every((v, i) => i === 0 || precos[i - 1] >= v),
          "cenário inverso deve estar decrescente",
        );
      }
      afirmar(
        precos.every((v) => Number.isInteger(v) && v > 0 && v <= PRECO_MAXIMO_CENTAVOS),
        "preços sintéticos devem ser inteiros positivos dentro do limite",
      );
    }
  }
});

teste("mediana com amostra par é a média dos dois centrais", () => {
  afirmarIgual(mediana([10, 1, 3, 2, 8, 4, 5, 9, 6, 7]), 5.5, "10 amostras");
  afirmarIgual(mediana([1, 2, 3, 4]), 2.5, "4 amostras");
});

teste("mediana com amostra ímpar é o valor central", () => {
  afirmarIgual(mediana([5, 1, 3]), 3, "3 amostras");
  afirmarIgual(mediana([42]), 42, "1 amostra");
});

teste("saidaEstaCorreta rejeita saídas erradas", () => {
  const entrada = [produto("a", 300), produto("b", 100), produto("c", 200)];
  afirmar(
    saidaEstaCorreta(entrada, [produto("b", 100), produto("c", 200), produto("a", 300)]),
    "saída correta deve passar",
  );
  afirmar(
    !saidaEstaCorreta(entrada, [produto("a", 300), produto("b", 100), produto("c", 200)]),
    "fora de ordem deve falhar",
  );
  afirmar(
    !saidaEstaCorreta(entrada, [produto("b", 100), produto("c", 200)]),
    "item faltando deve falhar",
  );
  afirmar(
    !saidaEstaCorreta(entrada, [produto("b", 100), produto("b", 100), produto("a", 300)]),
    "item duplicado deve falhar",
  );
});

async function testarBenchmark() {
  const entrada = gerarProdutos(100, "aleatorio");
  const rodadasVistas: number[] = [];
  const resultado = await executarBenchmark(entrada, "teste", "assinatura-de-teste", (p) =>
    rodadasVistas.push(p.rodada),
  );

  teste("benchmark devolve um resultado por algoritmo", () => {
    afirmarIgual(resultado.resultados.length, ALGORITMOS.length, "quantidade de resultados");
  });

  teste("benchmark faz exatamente REPETICOES medições por algoritmo", () => {
    for (const r of resultado.resultados) {
      afirmarIgual(r.amostras.length, REPETICOES, `amostras de ${r.nome}`);
    }
    afirmarIgual(resultado.repeticoes, REPETICOES, "repetições declaradas");
    afirmarIgual(resultado.aquecimentos, AQUECIMENTOS, "aquecimentos declarados");
    afirmarIgual(
      rodadasVistas.length,
      REPETICOES * ALGORITMOS.length,
      "avisos de progresso (rodadas x algoritmos)",
    );
  });

  teste("benchmark confirma que as três saídas estão corretas", () => {
    for (const r of resultado.resultados) {
      afirmar(r.saidaValida, `${r.nome} deveria produzir saída válida`);
    }
  });

  teste("mediana informada bate com as amostras guardadas", () => {
    for (const r of resultado.resultados) {
      afirmarIgual(r.medianaMs, mediana(r.amostras), `mediana de ${r.nome}`);
      afirmarIgual(r.minimoMs, Math.min(...r.amostras), `mínimo de ${r.nome}`);
      afirmarIgual(r.maximoMs, Math.max(...r.amostras), `máximo de ${r.nome}`);
    }
  });

  teste("benchmark preserva a entrada original", () => {
    afirmarIgual(entrada.length, 100, "entrada não deve mudar de tamanho");
    afirmar(
      entrada.some((p, i) => i > 0 && entrada[i - 1].precoCentavos > p.precoCentavos),
      "a entrada aleatória não deve ter sido ordenada no lugar",
    );
  });

  teste("assinatura e descrição acompanham o resultado", () => {
    afirmarIgual(resultado.assinatura, "assinatura-de-teste", "assinatura");
    afirmarIgual(resultado.descricaoEntrada, "teste", "descrição");
    afirmarIgual(resultado.tamanho, 100, "tamanho");
  });
}

testarBenchmark().then(() => {
  console.log(`\n${passaram} teste(s) passaram.`);
  if (falhas.length > 0) {
    console.log(`${falhas.length} falha(s):\n`);
    for (const falha of falhas) console.log(`  - ${falha}`);
    process.exit(1);
  }
  console.log("Nenhuma falha.\n");
});
