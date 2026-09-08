import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CENARIOS,
  ROTULO_CENARIO,
  TAMANHOS_DISPONIVEIS,
  gerarProdutos,
  obterPrecoAlvo,
  type Cenario,
  type TamanhoEntrada,
} from "../benchmark/dadosSinteticos";
import {
  executarBenchmark,
  type ProgressoBenchmark,
  type ResultadoAlgoritmo,
  type ResultadoBenchmark,
} from "../benchmark/protocolo";
import { formatarPreco } from "../dominio/preco";
import { compararPorPreco, type Produto } from "../dominio/produto";
import { cores, espaco } from "../tema";
import { Botao } from "./Botao";
import { Escolha } from "./Escolha";

type Fonte = "lista" | "sinteticos";

type Props = { produtos: Produto[]; versaoLista: number };

const MINIMO_PARA_COMPARAR = 2;

export function PainelComparacao({ produtos, versaoLista }: Props) {
  const [fonte, setFonte] = useState<Fonte>("sinteticos");
  const [tamanho, setTamanho] = useState<TamanhoEntrada>(100000);
  const [cenario, setCenario] = useState<Cenario>("pior");
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoBenchmark | null>(null);
  const [resultado, setResultado] = useState<ResultadoBenchmark | null>(null);

  const assinatura =
    fonte === "lista"
      ? `lista:v${versaoLista}:n${produtos.length}:${cenario}`
      : `sinteticos:n${tamanho}:${cenario}`;

  const semDados = fonte === "lista" && produtos.length < MINIMO_PARA_COMPARAR;
  const desatualizado = resultado !== null && resultado.assinatura !== assinatura;

  const descricao =
    fonte === "lista"
      ? `Sua lista, ${produtos.length} produtos, ${ROTULO_CENARIO[cenario].toLowerCase()}`
      : `${formatarNumero(tamanho)} produtos, ${ROTULO_CENARIO[cenario].toLowerCase()}`;

  async function comparar() {
    if (executando || semDados) return;

    setExecutando(true);
    setProgresso(null);
    setResultado(null);

    const listaOrdenada =
      fonte === "lista" ? produtos.slice().sort(compararPorPreco) : gerarProdutos(tamanho);
    const precoAlvo = obterPrecoAlvo(listaOrdenada, cenario);

    try {
      setResultado(
        await executarBenchmark(listaOrdenada, precoAlvo, descricao, assinatura, setProgresso),
      );
    } finally {
      setExecutando(false);
      setProgresso(null);
    }
  }

  const maiorComparacoes = resultado
    ? Math.max(...resultado.resultados.map((r) => r.comparacoes), 1)
    : 1;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={estilos.abertura}>
        Os dois algoritmos procuram o mesmo preço na mesma lista. A diferença entre O(n) e
        O(log n) aparece na quantidade de passos.
      </Text>

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Dados</Text>
        <Escolha
          opcoes={[
            { valor: "sinteticos", rotulo: "De teste" },
            { valor: "lista", rotulo: "Minha lista" },
          ]}
          selecionado={fonte}
          aoSelecionar={setFonte}
          desabilitado={executando}
        />
      </View>

      {fonte === "sinteticos" ? (
        <View style={estilos.bloco}>
          <Text style={estilos.rotulo}>Quantidade de produtos</Text>
          <Escolha
            opcoes={TAMANHOS_DISPONIVEIS.map((t) => ({
              valor: String(t),
              rotulo: formatarNumero(t),
            }))}
            selecionado={String(tamanho)}
            aoSelecionar={(v) => setTamanho(Number(v) as TamanhoEntrada)}
            desabilitado={executando}
          />
        </View>
      ) : null}

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Onde está o produto procurado</Text>
        <Escolha
          opcoes={CENARIOS.map((c) => ({ valor: c, rotulo: ROTULO_CENARIO[c] }))}
          selecionado={cenario}
          aoSelecionar={setCenario}
          desabilitado={executando}
        />
      </View>

      {semDados ? (
        <Text style={estilos.aviso}>Cadastre pelo menos dois produtos ou use dados de teste.</Text>
      ) : null}

      <Botao
        titulo="Comparar"
        aoPressionar={comparar}
        desabilitado={semDados}
        carregando={executando}
      />

      {executando ? (
        <View style={estilos.progresso} accessibilityLiveRegion="polite">
          <ActivityIndicator color={cores.tinta} />
          <Text style={estilos.progressoTexto}>
            {progresso
              ? `Medição ${progresso.rodada} de ${progresso.totalRodadas}, ${progresso.algoritmo}`
              : "Aquecendo"}
          </Text>
        </View>
      ) : null}

      {resultado ? (
        <View style={estilos.resultado}>
          <Text style={estilos.resultadoTitulo}>{resultado.descricaoEntrada}</Text>
          <Text style={estilos.meta}>
            Preço procurado {formatarPreco(resultado.precoAlvoCentavos)}, {resultado.repeticoes}{" "}
            medições de {resultado.loteBuscas} buscas cada, valor exibido: mediana
          </Text>

          {desatualizado ? (
            <Text style={estilos.aviso}>
              Você mudou as opções depois desta medição. Compare de novo.
            </Text>
          ) : null}

          {!resultado.resultadosConcordam ? (
            <Text style={estilos.aviso}>
              Os dois algoritmos chegaram a preços diferentes. Confira a implementação.
            </Text>
          ) : null}

          {resultado.resultados.map((r) => (
            <Linha key={r.id} resultado={r} proporcao={r.comparacoes / maiorComparacoes} />
          ))}

          <Text style={estilos.rodape}>
            Medido neste aparelho, no Expo Go em modo de desenvolvimento. A busca binária só é
            possível porque a lista está ordenada.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Linha({ resultado, proporcao }: { resultado: ResultadoAlgoritmo; proporcao: number }) {
  const cor = resultado.id === "binaria" ? cores.preco : cores.etiqueta;
  const corTexto = resultado.id === "binaria" ? cores.preco : cores.alerta;

  return (
    <View style={estilos.linha}>
      <View style={estilos.linhaTopo}>
        <Text style={estilos.linhaNome}>
          {resultado.nome}{" "}
          <Text style={[estilos.notacao, { color: corTexto }]}>{resultado.notacaoBigO}</Text>
        </Text>
        <Text style={estilos.passos}>{formatarNumero(resultado.comparacoes)} passos</Text>
      </View>

      <View style={estilos.trilho}>
        <View
          style={[
            estilos.preenchida,
            { width: `${Math.max(proporcao * 100, 1.5)}%`, backgroundColor: cor },
          ]}
        />
      </View>

      <Text style={estilos.linhaMeta}>
        {formatarTempo(resultado.medianaMs)} por busca, memória {resultado.memoriaAuxiliar},{" "}
        {resultado.preRequisito}
      </Text>
    </View>
  );
}

function formatarNumero(valor: number): string {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatarTempo(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 0.001) return `${(ms * 1_000_000).toFixed(0)} ns`;
  if (ms < 1) return `${(ms * 1000).toFixed(1)} µs`;
  return `${ms.toFixed(2)} ms`;
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingHorizontal: espaco.xl,
    paddingTop: espaco.xl,
    paddingBottom: espaco.xxl,
    gap: espaco.xl,
  },
  abertura: { fontSize: 16, lineHeight: 24, color: cores.tinta },
  bloco: { gap: espaco.xs },
  rotulo: { fontSize: 13, color: cores.suave },
  aviso: { fontSize: 13, lineHeight: 19, color: cores.alerta },
  progresso: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  progressoTexto: { fontSize: 14, color: cores.suave, flex: 1 },
  resultado: {
    gap: espaco.lg,
    borderTopWidth: 1,
    borderTopColor: cores.tinta,
    paddingTop: espaco.lg,
  },
  resultadoTitulo: { fontSize: 17, fontWeight: "700", color: cores.tinta },
  meta: { fontSize: 13, lineHeight: 19, color: cores.suave, marginTop: -espaco.md },
  linha: { gap: espaco.xs },
  linhaTopo: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  linhaNome: { fontSize: 16, color: cores.tinta },
  notacao: { fontSize: 14, fontWeight: "700" },
  passos: {
    fontSize: 22,
    fontWeight: "700",
    color: cores.tinta,
    fontVariant: ["tabular-nums"],
  },
  trilho: { height: 10, backgroundColor: cores.superficie },
  preenchida: { height: 10 },
  linhaMeta: { fontSize: 12, color: cores.suave },
  rodape: { fontSize: 12, lineHeight: 18, color: cores.suave },
});
