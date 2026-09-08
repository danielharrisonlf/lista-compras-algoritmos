import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CENARIOS,
  ROTULO_CENARIO,
  SEMENTE_PADRAO,
  TAMANHOS_DISPONIVEIS,
  gerarProdutos,
  type Cenario,
  type TamanhoEntrada,
} from "../benchmark/dadosSinteticos";
import {
  executarBenchmark,
  type ProgressoBenchmark,
  type ResultadoAlgoritmo,
  type ResultadoBenchmark,
} from "../benchmark/protocolo";
import type { Produto } from "../dominio/produto";
import { cores, espaco } from "../tema";
import { Botao } from "./Botao";
import { Escolha } from "./Escolha";

type Fonte = "lista" | "sinteticos";

type Props = { produtos: Produto[]; versaoLista: number };

const MINIMO_PARA_COMPARAR = 2;

export function PainelComparacao({ produtos, versaoLista }: Props) {
  const [fonte, setFonte] = useState<Fonte>("sinteticos");
  const [tamanho, setTamanho] = useState<TamanhoEntrada>(1000);
  const [cenario, setCenario] = useState<Cenario>("aleatorio");
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoBenchmark | null>(null);
  const [resultado, setResultado] = useState<ResultadoBenchmark | null>(null);

  const assinatura =
    fonte === "lista"
      ? `lista:v${versaoLista}:n${produtos.length}`
      : `sinteticos:n${tamanho}:${cenario}:s${SEMENTE_PADRAO}`;

  const semDadosSuficientes = fonte === "lista" && produtos.length < MINIMO_PARA_COMPARAR;
  const desatualizado = resultado !== null && resultado.assinatura !== assinatura;

  const descricao =
    fonte === "lista"
      ? `Sua lista, ${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`
      : `${formatarNumero(tamanho)} produtos de teste, ${ROTULO_CENARIO[cenario].toLowerCase()}`;

  async function comparar() {
    if (executando || semDadosSuficientes) return;

    setExecutando(true);
    setProgresso(null);
    setResultado(null);

    const entrada = fonte === "lista" ? produtos.slice() : gerarProdutos(tamanho, cenario);

    try {
      setResultado(await executarBenchmark(entrada, descricao, assinatura, setProgresso));
    } finally {
      setExecutando(false);
      setProgresso(null);
    }
  }

  const maiorMediana = resultado
    ? Math.max(...resultado.resultados.map((r) => r.medianaMs))
    : 0;
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
        Os três algoritmos ordenam a mesma lista pelo mesmo critério. Aqui dá para ver quanto cada
        um demora quando a lista cresce.
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
        <>
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

          <View style={estilos.bloco}>
            <Text style={estilos.rotulo}>Ordem inicial</Text>
            <Escolha
              opcoes={CENARIOS.map((c) => ({ valor: c, rotulo: ROTULO_CENARIO[c] }))}
              selecionado={cenario}
              aoSelecionar={setCenario}
              desabilitado={executando}
            />
          </View>
        </>
      ) : (
        <Text style={estilos.aviso}>
          Usa uma cópia dos seus produtos. Os dados de teste servem para chegar a listas grandes.
        </Text>
      )}

      {semDadosSuficientes ? (
        <Text style={estilos.aviso}>Cadastre pelo menos dois produtos ou use dados de teste.</Text>
      ) : null}

      {fonte === "sinteticos" && tamanho === 5000 ? (
        <Text style={estilos.aviso}>
          Com 5.000 produtos a comparação leva dezenas de segundos e a tela trava a cada ordenação.
        </Text>
      ) : null}

      <Botao
        titulo="Comparar"
        aoPressionar={comparar}
        desabilitado={semDadosSuficientes}
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
            {resultado.repeticoes} medições por algoritmo, valor exibido: mediana
          </Text>

          {desatualizado ? (
            <Text style={estilos.aviso}>
              Você mudou as opções depois desta medição. Compare de novo.
            </Text>
          ) : null}

          {resultado.resultados.map((r) => (
            <Barra
              key={r.id}
              resultado={r}
              proporcao={maiorMediana > 0 ? r.medianaMs / maiorMediana : 0}
              vencedor={maisRapido?.id === r.id}
            />
          ))}

          {resultado.proximoDaResolucao ? (
            <Text style={estilos.aviso}>
              Os tempos são curtos demais para separar os algoritmos. Aumente a quantidade de
              produtos.
            </Text>
          ) : null}

          <Text style={estilos.rodape}>
            Medido neste aparelho, no Expo Go em modo de desenvolvimento. É o tempo do algoritmo,
            não o tempo de abertura do aplicativo.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Barra({
  resultado,
  proporcao,
  vencedor,
}: {
  resultado: ResultadoAlgoritmo;
  proporcao: number;
  vencedor: boolean;
}) {
  return (
    <View style={estilos.barraBloco}>
      <View style={estilos.barraTopo}>
        <Text style={estilos.barraNome}>{resultado.nome}</Text>
        <Text style={estilos.barraValor}>{formatarMs(resultado.medianaMs)} ms</Text>
      </View>
      <View style={estilos.barraTrilho}>
        <View
          style={[
            estilos.barraPreenchida,
            { width: `${Math.max(proporcao * 100, 1.5)}%` },
            vencedor && { backgroundColor: cores.etiqueta },
          ]}
        />
      </View>
      <Text style={estilos.barraMeta}>
        {resultado.casoMedio} no caso médio, memória {resultado.memoriaAuxiliar}
        {resultado.saidaValida ? "" : ", saída inválida"}
      </Text>
    </View>
  );
}

function formatarNumero(valor: number): string {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatarMs(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms >= 100) return ms.toFixed(0);
  if (ms >= 1) return ms.toFixed(1);
  return ms.toFixed(2);
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.xl, paddingTop: espaco.xl, paddingBottom: espaco.xxl, gap: espaco.xl },
  abertura: { fontSize: 16, lineHeight: 24, color: cores.tinta },
  bloco: { gap: espaco.xs },
  rotulo: { fontSize: 13, color: cores.suave },
  aviso: { fontSize: 13, lineHeight: 19, color: cores.alerta },
  progresso: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  progressoTexto: { fontSize: 14, color: cores.suave, flex: 1 },
  resultado: { gap: espaco.lg, borderTopWidth: 1, borderTopColor: cores.tinta, paddingTop: espaco.lg },
  resultadoTitulo: { fontSize: 17, fontWeight: "700", color: cores.tinta },
  meta: { fontSize: 13, color: cores.suave, marginTop: -espaco.md },
  barraBloco: { gap: espaco.xs },
  barraTopo: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  barraNome: { fontSize: 16, color: cores.tinta },
  barraValor: {
    fontSize: 22,
    fontWeight: "700",
    color: cores.tinta,
    fontVariant: ["tabular-nums"],
  },
  barraTrilho: { height: 10, backgroundColor: cores.superficie },
  barraPreenchida: { height: 10, backgroundColor: cores.linha },
  barraMeta: { fontSize: 12, color: cores.suave },
  rodape: { fontSize: 12, lineHeight: 18, color: cores.suave },
});
