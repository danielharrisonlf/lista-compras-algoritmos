import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { ALGORITMOS, algoritmoPorId, type IdAlgoritmo, type ResultadoBusca } from "../algoritmos";
import { analisarPreco, formatarPreco } from "../dominio/preco";
import { compararPorPreco, type Produto } from "../dominio/produto";
import { cores, espaco } from "../tema";
import { Botao } from "./Botao";
import { Escolha } from "./Escolha";
import { FormularioProduto } from "./FormularioProduto";
import { ItemProduto } from "./ItemProduto";

type Props = {
  produtos: Produto[];
  aoAdicionar: (nome: string, precoCentavos: number) => void;
  aoRemover: (id: string) => void;
  aoOrdenar: (ordenados: Produto[]) => void;
};

export function PainelLista({ produtos, aoAdicionar, aoRemover, aoOrdenar }: Props) {
  const [algoritmo, setAlgoritmo] = useState<IdAlgoritmo>("linear");
  const [termoBusca, setTermoBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState<{
    executado: boolean;
    termo: string;
    resultado: ResultadoBusca;
    algoritmoNome: string;
    notacao: string;
    tempoMs: number;
  } | null>(null);

  const total = useMemo(
    () => produtos.reduce((soma, p) => soma + p.precoCentavos, 0),
    [produtos],
  );

  function executarBusca() {
    const analise = analisarPreco(termoBusca);
    if (!analise.ok) return;

    const precoAlvo = analise.centavos;
    const algo = algoritmoPorId(algoritmo);

    // Para busca binária, a lista precisa estar ordenada
    let listaUso = produtos;
    if (algoritmo === "binaria") {
      listaUso = [...produtos].sort(compararPorPreco);
      aoOrdenar(listaUso);
    }

    const t0 = performance.now();
    const resultado = algo.buscar(listaUso, precoAlvo);
    const t1 = performance.now();

    setResultadoBusca({
      executado: true,
      termo: formatarPreco(precoAlvo),
      resultado,
      algoritmoNome: algo.nome,
      notacao: algo.notacaoBigO,
      tempoMs: t1 - t0,
    });
  }

  function ordenarLista() {
    aoOrdenar([...produtos].sort(compararPorPreco));
  }

  const renderizarItem = useCallback(
    ({ item, index }: { item: Produto; index: number }) => {
      const emDestaque =
        resultadoBusca?.resultado.produto !== null &&
        resultadoBusca?.resultado.produto?.id === item.id;

      return (
        <View style={emDestaque ? estilos.itemDestacado : undefined}>
          <ItemProduto produto={item} posicao={index + 1} aoRemover={aoRemover} />
        </View>
      );
    },
    [aoRemover, resultadoBusca],
  );

  return (
    <FlatList
      data={produtos}
      keyExtractor={(item) => item.id}
      renderItem={renderizarItem}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <FormularioProduto aoAdicionar={aoAdicionar} />

          {produtos.length > 0 ? (
            <View style={estilos.secaoBusca}>
              <Text style={estilos.titulo}>Buscar produto por preço exato</Text>
              <View style={estilos.linhaBusca}>
                <TextInput
                  value={termoBusca}
                  onChangeText={(texto) => {
                    setTermoBusca(texto);
                    if (resultadoBusca) setResultadoBusca(null);
                  }}
                  placeholder="Preço ex: 12,50"
                  placeholderTextColor={cores.suave}
                  keyboardType="decimal-pad"
                  style={estilos.campoBusca}
                />
                <Botao
                  titulo="Buscar"
                  aoPressionar={executarBusca}
                  desabilitado={termoBusca.trim() === ""}
                  quieto
                />
              </View>

              <Escolha
                opcoes={ALGORITMOS.map((a) => ({
                  valor: a.id,
                  rotulo: `${a.nome} (${a.notacaoBigO})`,
                }))}
                selecionado={algoritmo}
                aoSelecionar={(id) => {
                  setAlgoritmo(id as IdAlgoritmo);
                  if (resultadoBusca) setResultadoBusca(null);
                }}
              />

              {resultadoBusca ? (
                <View style={estilos.cardFeedback}>
                  <Text style={estilos.feedbackTitulo}>
                    Resultado via {resultadoBusca.algoritmoNome} ({resultadoBusca.notacao})
                  </Text>
                  {resultadoBusca.resultado.produto ? (
                    <Text style={estilos.feedbackTexto}>
                      Encontrado:{" "}
                      <Text style={estilos.negrito}>
                        {resultadoBusca.resultado.produto.nome}
                      </Text>{" "}
                      (posição {resultadoBusca.resultado.indice + 1} de {produtos.length})
                    </Text>
                  ) : (
                    <Text style={estilos.feedbackAlerta}>
                      Nenhum produto encontrado com o valor {resultadoBusca.termo}.
                    </Text>
                  )}
                  <Text style={estilos.feedbackPassos}>
                    Comparações efetuadas:{" "}
                    <Text style={estilos.negrito}>
                      {resultadoBusca.resultado.comparacoes} passo(s)
                    </Text>
                  </Text>
                </View>
              ) : null}

              <View style={estilos.linhaOrdenar}>
                <Botao
                  titulo="Ordenar lista por preço"
                  aoPressionar={ordenarLista}
                  desabilitado={produtos.length < 2}
                  quieto
                />
              </View>
            </View>
          ) : null}

          {produtos.length > 0 ? (
            <View style={estilos.resumo}>
              <Text style={estilos.resumoTexto}>
                {produtos.length} {produtos.length === 1 ? "produto cadastrado" : "produtos cadastrados"}
              </Text>
              <Text style={estilos.resumoTotal}>{formatarPreco(total)}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>
          Cadastre produtos com preços para testar a busca linear e binária.
        </Text>
      }
    />
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.xl, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.xl, paddingTop: espaco.xl, paddingBottom: espaco.lg },
  secaoBusca: {
    gap: espaco.md,
    backgroundColor: cores.superficie,
    padding: espaco.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.linha,
  },
  titulo: { fontSize: 15, fontWeight: "700", color: cores.tinta },
  linhaBusca: { flexDirection: "row", gap: espaco.sm, alignItems: "center" },
  campoBusca: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 6,
    paddingHorizontal: espaco.md,
    fontSize: 15,
    color: cores.tinta,
    backgroundColor: cores.papel,
  },
  cardFeedback: {
    backgroundColor: cores.papel,
    padding: espaco.md,
    borderRadius: 6,
    gap: 4,
    borderLeftWidth: 4,
    borderLeftColor: cores.tinta,
  },
  feedbackTitulo: { fontSize: 13, fontWeight: "700", color: cores.tinta },
  feedbackTexto: { fontSize: 14, color: cores.tinta },
  feedbackAlerta: { fontSize: 13, color: cores.alerta },
  feedbackPassos: { fontSize: 12, color: cores.suave },
  negrito: { fontWeight: "700", color: cores.tinta },
  linhaOrdenar: { marginTop: espaco.xs },
  itemDestacado: {
    backgroundColor: "#FEF08A",
    borderRadius: 6,
    marginVertical: 2,
  },
  resumo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: cores.tinta,
    paddingBottom: espaco.sm,
  },
  resumoTexto: { fontSize: 14, color: cores.suave },
  resumoTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: cores.tinta,
    fontVariant: ["tabular-nums"],
  },
  vazio: { fontSize: 14, color: cores.suave, textAlign: "center", paddingVertical: espaco.xxl },
});
