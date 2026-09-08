import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CENARIOS,
  ROTULO_CENARIO,
  SEMENTE_PADRAO,
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
import type { Produto } from "../dominio/produto";
import { cores, espaco } from "../tema";
import { Botao } from "./Botao";
import { Escolha } from "./Escolha";

type Fonte = "lista" | "sinteticos";

type Props = { produtos: Produto[]; versaoLista: number };

const MINIMO_PARA_COMPARAR = 2;

export function PainelComparacao({ produtos, versaoLista }: Props) {
  const [fonte, setFonte] = useState<Fonte>("sinteticos");
  const [tamanho, setTamanho] = useState<TamanhoEntrada>(100000);
  const [cenario, setCenario] = useState<Cenario>("pior_caso");
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoBenchmark | null>(null);
  const [resultado, setResultado] = useState<ResultadoBenchmark | null>(null);

  const assinatura =
    fonte === "lista"
      ? `lista:v${versaoLista}:n${produtos.length}:${cenario}`
      : `sinteticos:n${tamanho}:${cenario}:s${SEMENTE_PADRAO}`;

  const semDadosSuficientes = fonte === "lista" && produtos.length < MINIMO_PARA_COMPARAR;
  const desatualizado = resultado !== null && resultado.assinatura !== assinatura;

  const descricao =
    fonte === "lista"
      ? `Sua lista (${produtos.length} produtos), ${ROTULO_CENARIO[cenario].toLowerCase()}`
      : `${formatarNumero(tamanho)} produtos, ${ROTULO_CENARIO[cenario].toLowerCase()}`;

  async function comparar() {
    if (executando || semDadosSuficientes) return;

    setExecutando(true);
    setProgresso(null);
    setResultado(null);

    const baseProdutos = fonte === "lista" ? produtos.slice() : gerarProdutos(tamanho);
    const precoAlvo = obterPrecoAlvo(baseProdutos, cenario);

    try {
      setResultado(
        await executarBenchmark(baseProdutos, precoAlvo, descricao, assinatura, setProgresso),
      );
    } finally {
      setExecutando(false);
      setProgresso(null);
    }
  }

  const maiorComparacoes = resultado
    ? Math.max(...resultado.resultados.map((r) => r.comparacoes), 1)
    : 1;

  const maisRapido = resultado
    ? resultado.resultados.reduce((a, b) => (b.medianaMs < a.medianaMs ? b : a))
    : null;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={estilos.abertura}>
        Comparação prática entre <Text style={estilos.destaque}>Busca Linear</Text> e{" "}
        <Text style={estilos.destaque}>Busca Binária</Text>. Veja o impacto do crescimento de N
        sobre as classes assintóticas <Text style={estilos.tagLinear}>O(n)</Text> e{" "}
        <Text style={estilos.tagBinaria}>O(log n)</Text>.
      </Text>

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Origem dos dados</Text>
        <Escolha
          opcoes={[
            { valor: "sinteticos", rotulo: "Dados de teste" },
            { valor: "lista", rotulo: "Minha lista" },
          ]}
          selecionado={fonte}
          aoSelecionar={setFonte}
          desabilitado={executando}
        />
      </View>

      {fonte === "sinteticos" ? (
        <View style={estilos.bloco}>
          <Text style={estilos.rotulo}>Quantidade de produtos (N)</Text>
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
        <Text style={estilos.rotulo}>Posição do item procurado</Text>
        <Escolha
          opcoes={CENARIOS.map((c) => ({ valor: c, rotulo: ROTULO_CENARIO[c] }))}
          selecionado={cenario}
          aoSelecionar={setCenario}
          desabilitado={executando}
        />
      </View>

      {semDadosSuficientes ? (
        <Text style={estilos.aviso}>Cadastre pelo menos dois produtos ou use dados de teste.</Text>
      ) : null}

      <Botao
        titulo="Comparar busca"
        aoPressionar={comparar}
        desabilitado={semDadosSuficientes}
        carregando={executando}
      />

      {executando ? (
        <View style={estilos.progresso} accessibilityLiveRegion="polite">
          <ActivityIndicator color={cores.tinta} />
          <Text style={estilos.progressoTexto}>
            {progresso
              ? `Executando ${progresso.algoritmo} (amostra ${progresso.rodada}/${progresso.totalRodadas})...`
              : "Aquecendo CPU..."}
          </Text>
        </View>
      ) : null}

      {resultado ? (
        <View style={estilos.resultado}>
          <Text style={estilos.resultadoTitulo}>{resultado.descricaoEntrada}</Text>
          <Text style={estilos.meta}>
            Preço buscado: {formatarPreco(resultado.precoAlvoCentavos)} | {resultado.loteBuscas} buscas
            por medição (mediana)
          </Text>

          {desatualizado ? (
            <Text style={estilos.aviso}>
              Você alterou as opções após a medição. Clique em comparar novamente.
            </Text>
          ) : null}

          {resultado.resultados.map((r) => (
            <CardResultado
              key={r.id}
              resultado={r}
              proporcaoComparacoes={r.comparacoes / maiorComparacoes}
              vencedor={maisRapido?.id === r.id}
            />
          ))}

          <Text style={estilos.rodape}>
            Medido no dispositivo via performance.now(). No caso de 100.000 itens, a Busca Linear
            avalia item por item (100.000 passos), enquanto a Busca Binária divide o espaço ao meio
            em ~17 passos.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function CardResultado({
  resultado,
  proporcaoComparacoes,
  vencedor,
}: {
  resultado: ResultadoAlgoritmo;
  proporcaoComparacoes: number;
  vencedor: boolean;
}) {
  return (
    <View style={estilos.card}>
      <View style={estilos.cardTopo}>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.cardNome}>{resultado.nome}</Text>
          <View
            style={[
              estilos.badgeBigO,
              { backgroundColor: resultado.id === "binaria" ? "#DCFCE7" : "#FEF9C3" },
            ]}
          >
            <Text
              style={[
                estilos.badgeBigOTexto,
                { color: resultado.id === "binaria" ? "#166534" : "#854D0E" },
              ]}
            >
              {resultado.notacaoBigO}
            </Text>
          </View>
        </View>
        <Text style={estilos.cardTempo}>{formatarTempo(resultado.medianaMs)}</Text>
      </View>

      <View style={estilos.blocoComparacoes}>
        <Text style={estilos.comparacoesTexto}>
          Comparações realizadas:{" "}
          <Text style={estilos.comparacoesDestaque}>
            {formatarNumero(resultado.comparacoes)} passos
          </Text>
        </Text>
        <View style={estilos.barraTrilho}>
          <View
            style={[
              estilos.barraPreenchida,
              {
                width: `${Math.max(proporcaoComparacoes * 100, 2)}%`,
                backgroundColor: resultado.id === "binaria" ? "#22C55E" : "#EAB308",
              },
            ]}
          />
        </View>
      </View>

      <Text style={estilos.cardMeta}>
        Complexidade: {resultado.casoMedio} (médio), {resultado.piorCaso} (pior) | Memória:{" "}
        {resultado.memoriaAuxiliar}
      </Text>
      <Text style={estilos.cardPreRequisito}>
        Requisito: {resultado.preRequisito}
      </Text>
    </View>
  );
}

function formatarNumero(valor: number): string {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatarTempo(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 0.001) {
    return `${(ms * 1_000_000).toFixed(0)} ns`;
  }
  if (ms < 1) {
    return `${(ms * 1000).toFixed(1)} µs`;
  }
  return `${ms.toFixed(3)} ms`;
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingHorizontal: espaco.xl,
    paddingTop: espaco.xl,
    paddingBottom: espaco.xxl,
    gap: espaco.xl,
  },
  abertura: { fontSize: 15, lineHeight: 22, color: cores.tinta },
  destaque: { fontWeight: "700" },
  tagLinear: { color: "#854D0E", fontWeight: "700" },
  tagBinaria: { color: "#166534", fontWeight: "700" },
  bloco: { gap: espaco.xs },
  rotulo: { fontSize: 13, color: cores.suave },
  aviso: { fontSize: 13, lineHeight: 19, color: cores.alerta },
  progresso: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  progressoTexto: { fontSize: 14, color: cores.suave, flex: 1 },
  resultado: {
    gap: espaco.lg,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    paddingTop: espaco.lg,
  },
  resultadoTitulo: { fontSize: 17, fontWeight: "700", color: cores.tinta },
  meta: { fontSize: 13, color: cores.suave, marginTop: -espaco.md },
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 8,
    padding: espaco.lg,
    gap: espaco.sm,
    borderWidth: 1,
    borderColor: cores.linha,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linhaTitulo: { flexDirection: "row", alignItems: "center", gap: espaco.sm },
  cardNome: { fontSize: 16, fontWeight: "700", color: cores.tinta },
  badgeBigO: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeBigOTexto: { fontSize: 12, fontWeight: "700" },
  cardTempo: { fontSize: 18, fontWeight: "700", color: cores.tinta, fontVariant: ["tabular-nums"] },
  blocoComparacoes: { gap: 4, marginVertical: espaco.xs },
  comparacoesTexto: { fontSize: 13, color: cores.tinta },
  comparacoesDestaque: { fontWeight: "700" },
  barraTrilho: { height: 8, backgroundColor: cores.linha, borderRadius: 4, overflow: "hidden" },
  barraPreenchida: { height: 8, borderRadius: 4 },
  cardMeta: { fontSize: 12, color: cores.suave },
  cardPreRequisito: { fontSize: 11, color: cores.suave, fontStyle: "italic" },
  rodape: { fontSize: 12, lineHeight: 18, color: cores.suave },
});
