import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { ALGORITMOS } from "../algoritmos";
import {
  CENARIOS,
  DESCRICAO_CENARIO,
  ROTULO_CENARIO,
  SEMENTE_PADRAO,
  TAMANHOS_DISPONIVEIS,
  gerarProdutos,
  type Cenario,
  type TamanhoEntrada,
} from "../benchmark/dadosSinteticos";
import {
  AQUECIMENTOS,
  REPETICOES,
  executarBenchmark,
  type ProgressoBenchmark,
  type ResultadoBenchmark,
} from "../benchmark/protocolo";
import { formatarPreco } from "../dominio/preco";
import type { Produto } from "../dominio/produto";
import { cores, espaco, raio } from "../tema";
import { Botao } from "./Botao";
import { Cartao } from "./Cartao";
import { SeletorSegmentado } from "./SeletorSegmentado";

type Fonte = "lista" | "sinteticos";

type Props = {
  produtos: Produto[];
  versaoLista: number;
};

const MINIMO_PARA_COMPARAR = 2;
const ITENS_NA_AMOSTRA = 5;

export function PainelComparacao({ produtos, versaoLista }: Props) {
  const [fonte, setFonte] = useState<Fonte>("sinteticos");
  const [tamanho, setTamanho] = useState<TamanhoEntrada>(1000);
  const [cenario, setCenario] = useState<Cenario>("aleatorio");
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoBenchmark | null>(null);
  const [resultado, setResultado] = useState<ResultadoBenchmark | null>(null);

  const assinaturaAtual =
    fonte === "lista"
      ? `lista:v${versaoLista}:n${produtos.length}`
      : `sinteticos:n${tamanho}:${cenario}:s${SEMENTE_PADRAO}`;

  const entradaInsuficiente = fonte === "lista" && produtos.length < MINIMO_PARA_COMPARAR;
  const resultadoDesatualizado = resultado !== null && resultado.assinatura !== assinaturaAtual;

  const amostra = useMemo(() => {
    if (fonte === "lista") return produtos.slice(0, ITENS_NA_AMOSTRA);
    return gerarProdutos(tamanho, cenario).slice(0, ITENS_NA_AMOSTRA);
  }, [fonte, produtos, tamanho, cenario]);

  const descricaoEntrada =
    fonte === "lista"
      ? `Minha lista — ${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`
      : `Dados de teste — ${formatarNumero(tamanho)} produtos, cenário ${ROTULO_CENARIO[
          cenario
        ].toLowerCase()} (semente ${SEMENTE_PADRAO})`;

  async function comparar() {
    if (executando || entradaInsuficiente) return;

    setExecutando(true);
    setProgresso(null);
    setResultado(null);

    const entrada = fonte === "lista" ? produtos.slice() : gerarProdutos(tamanho, cenario);

    try {
      const saida = await executarBenchmark(
        entrada,
        descricaoEntrada,
        assinaturaAtual,
        setProgresso,
      );
      setResultado(saida);
    } finally {
      setExecutando(false);
      setProgresso(null);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Cartao
        titulo="Dados da comparação"
        descricao="Os três algoritmos recebem exatamente a mesma entrada. Os dados de teste são gerados à parte e não alteram a sua lista de compras."
      >
        <SeletorSegmentado
          opcoes={[
            { valor: "sinteticos", rotulo: "Dados de teste" },
            { valor: "lista", rotulo: "Minha lista" },
          ]}
          selecionado={fonte}
          aoSelecionar={setFonte}
          desabilitado={executando}
        />

        {fonte === "sinteticos" ? (
          <>
            <Rotulo texto="Quantidade de produtos (n)" />
            <SeletorSegmentado
              opcoes={TAMANHOS_DISPONIVEIS.map((t) => ({
                valor: String(t),
                rotulo: formatarNumero(t),
              }))}
              selecionado={String(tamanho)}
              aoSelecionar={(v) => setTamanho(Number(v) as TamanhoEntrada)}
              desabilitado={executando}
            />

            <Rotulo texto="Cenário" />
            <SeletorSegmentado
              opcoes={CENARIOS.map((c) => ({ valor: c, rotulo: ROTULO_CENARIO[c] }))}
              selecionado={cenario}
              aoSelecionar={setCenario}
              desabilitado={executando}
            />
            <Text style={estilos.ajuda}>{DESCRICAO_CENARIO[cenario]}</Text>
          </>
        ) : (
          <Text style={estilos.ajuda}>
            Usa uma cópia dos produtos cadastrados no aparelho. Com poucos itens os tempos ficam
            pequenos demais para comparar; os dados de teste servem para aumentar o n.
          </Text>
        )}

        <View style={estilos.blocoEntrada}>
          <Text style={estilos.entradaTitulo}>{descricaoEntrada}</Text>
          {amostra.length > 0 ? (
            <>
              <Text style={estilos.entradaLegenda}>
                Amostra dos {amostra.length} primeiros itens da entrada:
              </Text>
              {amostra.map((p) => (
                <Text key={p.id} style={estilos.entradaItem} numberOfLines={1}>
                  {"•"} {p.nome} — {formatarPreco(p.precoCentavos)}
                </Text>
              ))}
            </>
          ) : (
            <Text style={estilos.entradaLegenda}>Nenhum produto cadastrado ainda.</Text>
          )}
        </View>

        {entradaInsuficiente ? (
          <Aviso
            tom="alerta"
            texto={`Cadastre pelo menos ${MINIMO_PARA_COMPARAR} produtos para comparar usando a sua lista, ou escolha "Dados de teste".`}
          />
        ) : null}

        {fonte === "sinteticos" && tamanho === 5000 ? (
          <Aviso
            tom="alerta"
            texto="Com 5.000 produtos os algoritmos O(n²) levam bem mais tempo; a comparação inteira pode demorar dezenas de segundos e a tela fica presa durante cada ordenação."
          />
        ) : null}

        <Botao
          titulo={executando ? "Medindo..." : "Comparar algoritmos"}
          aoPressionar={comparar}
          desabilitado={entradaInsuficiente}
          carregando={executando}
        />

        {executando ? (
          <View style={estilos.progresso} accessibilityLiveRegion="polite">
            <ActivityIndicator color={cores.primaria} />
            <Text style={estilos.progressoTexto}>
              {progresso
                ? `Rodada ${progresso.rodada} de ${progresso.totalRodadas} — ${progresso.algoritmo}`
                : "Aquecendo o motor JavaScript..."}
            </Text>
          </View>
        ) : null}
      </Cartao>

      {resultado ? (
        <Cartao titulo="Resultado da medição">
          {resultadoDesatualizado ? (
            <Aviso
              tom="alerta"
              texto={
                "Resultado anterior: a entrada ou as opções mudaram depois desta medição. Toque em Comparar algoritmos novamente."
              }
            />
          ) : null}

          <Text style={estilos.metaEntrada}>{resultado.descricaoEntrada}</Text>
          <Text style={estilos.ajuda}>
            n = {formatarNumero(resultado.tamanho)} · {resultado.repeticoes} execuções medidas ·{" "}
            {resultado.aquecimentos} de aquecimento descartada · valor comparado: mediana
          </Text>

          <View style={estilos.tabela}>
            <View style={[estilos.tabelaLinha, estilos.tabelaCabecalho]}>
              <Text style={[estilos.celulaCabecalho, estilos.colAlgoritmoTexto]}>Algoritmo</Text>
              <Text style={[estilos.celulaCabecalho, estilos.colNumero]}>Mediana (ms)</Text>
              <Text style={[estilos.celulaCabecalho, estilos.colNumero]}>Mín–Máx</Text>
            </View>
            {resultado.resultados.map((r) => (
              <View key={r.id} style={estilos.tabelaLinha}>
                <View style={estilos.colAlgoritmo}>
                  <Text style={estilos.celulaNome}>{r.nome}</Text>
                  <Text style={estilos.celulaComplexidade}>
                    tempo {r.casoMedio} · memória {r.memoriaAuxiliar}
                  </Text>
                  {!r.saidaValida ? (
                    <Text style={estilos.celulaInvalida}>
                      Saída inválida — verificar implementação
                    </Text>
                  ) : null}
                </View>
                <Text style={[estilos.colNumero, estilos.celulaNumero]}>
                  {formatarMs(r.medianaMs)}
                </Text>
                <Text style={[estilos.colNumero, estilos.celulaSecundaria]}>
                  {formatarMs(r.minimoMs)}–{formatarMs(r.maximoMs)}
                </Text>
              </View>
            ))}
          </View>

          {resultado.proximoDaResolucao ? (
            <Aviso
              tom="alerta"
              texto={`Os tempos estão próximos da resolução do relógio (cerca de ${formatarMs(
                resultado.resolucaoRelogioMs,
              )} ms). Neste cenário a comparação não é conclusiva: aumente o n.`}
            />
          ) : null}

          <Text style={estilos.ajuda}>
            Os números valem para este aparelho, este cenário e este tamanho de entrada, com o
            aplicativo em modo de desenvolvimento no Expo Go. Não são o tempo de inicialização do
            aplicativo nem uma medida de CPU, memória ou bateria.
          </Text>
        </Cartao>
      ) : null}

      <Cartao titulo="Como ler estes números">
        <Text style={estilos.paragrafo}>
          <Text style={estilos.negrito}>n</Text> é a quantidade de produtos a ordenar. A notação
          Big-O descreve como o trabalho cresce quando n cresce, ignorando constantes e o aparelho.
          O tempo em milissegundos é uma medida real deste celular agora. São coisas diferentes e
          podem discordar em listas pequenas.
        </Text>
        {ALGORITMOS.map((a) => (
          <View key={a.id} style={estilos.blocoAlgoritmo}>
            <Text style={estilos.algoritmoNome}>{a.nome}</Text>
            <Text style={estilos.paragrafo}>{a.resumo}</Text>
            <Text style={estilos.algoritmoMeta}>
              Melhor {a.melhorCaso} · Médio {a.casoMedio} · Pior {a.piorCaso} · Memória auxiliar{" "}
              {a.memoriaAuxiliar}
            </Text>
          </View>
        ))}
        <Text style={estilos.ajuda}>
          Protocolo: mesma entrada para os três, cópia feita fora do cronômetro, {AQUECIMENTOS}{" "}
          execução de aquecimento descartada, {REPETICOES} execuções medidas, ordem dos algoritmos
          alternada a cada rodada e conferência da saída fora da medição.
        </Text>
      </Cartao>
    </ScrollView>
  );
}

function Rotulo({ texto }: { texto: string }) {
  return <Text style={estilos.rotulo}>{texto}</Text>;
}

function Aviso({ texto, tom }: { texto: string; tom: "alerta" | "erro" }) {
  return (
    <Text
      style={[estilos.aviso, tom === "erro" ? estilos.avisoErro : estilos.avisoAlerta]}
      accessibilityLiveRegion="polite"
    >
      {texto}
    </Text>
  );
}

function formatarNumero(valor: number): string {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatarMs(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms >= 100) return ms.toFixed(0);
  if (ms >= 1) return ms.toFixed(2);
  return ms.toFixed(3);
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.lg, paddingBottom: espaco.xxl },
  rotulo: { fontSize: 12, fontWeight: "700", color: cores.textoSuave, textTransform: "uppercase" },
  ajuda: { fontSize: 12, lineHeight: 18, color: cores.textoSuave },
  paragrafo: { fontSize: 14, lineHeight: 21, color: cores.texto },
  negrito: { fontWeight: "700" },
  blocoEntrada: {
    backgroundColor: cores.superficieSuave,
    borderRadius: raio.md,
    padding: espaco.md,
    gap: espaco.xs,
  },
  entradaTitulo: { fontSize: 13, fontWeight: "700", color: cores.texto },
  entradaLegenda: { fontSize: 12, color: cores.textoSuave },
  entradaItem: { fontSize: 12, color: cores.texto },
  progresso: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  progressoTexto: { fontSize: 13, color: cores.textoSuave, flex: 1 },
  metaEntrada: { fontSize: 14, fontWeight: "700", color: cores.texto },
  tabela: { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, overflow: "hidden" },
  tabelaCabecalho: { backgroundColor: cores.superficieSuave },
  tabelaLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  celulaCabecalho: {
    fontSize: 11,
    fontWeight: "700",
    color: cores.textoSuave,
    textTransform: "uppercase",
  },
  colAlgoritmo: { flex: 1.6, gap: 2 },
  colAlgoritmoTexto: { flex: 1.6 },
  colNumero: { flex: 1, textAlign: "right", fontSize: 13, color: cores.texto },
  celulaNome: { fontSize: 14, fontWeight: "700", color: cores.texto },
  celulaComplexidade: { fontSize: 11, color: cores.textoSuave },
  celulaInvalida: { fontSize: 11, fontWeight: "700", color: cores.erro },
  celulaNumero: { fontWeight: "700", fontVariant: ["tabular-nums"] },
  celulaSecundaria: { color: cores.textoSuave, fontVariant: ["tabular-nums"] },
  aviso: {
    fontSize: 12,
    lineHeight: 18,
    borderRadius: raio.sm,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
  },
  avisoAlerta: { color: cores.alerta, backgroundColor: cores.alertaSuave },
  avisoErro: { color: cores.erro, backgroundColor: cores.erroSuave },
  blocoAlgoritmo: {
    gap: espaco.xs,
    borderLeftWidth: 3,
    borderLeftColor: cores.primariaSuave,
    paddingLeft: espaco.md,
  },
  algoritmoNome: { fontSize: 14, fontWeight: "700", color: cores.primaria },
  algoritmoMeta: { fontSize: 11, color: cores.textoSuave },
});
