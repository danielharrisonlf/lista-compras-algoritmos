import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ALGORITMOS, algoritmoPorId, type IdAlgoritmo } from "../algoritmos";
import { formatarPreco } from "../dominio/preco";
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
  const [algoritmo, setAlgoritmo] = useState<IdAlgoritmo>("merge");

  const total = useMemo(
    () => produtos.reduce((soma, p) => soma + p.precoCentavos, 0),
    [produtos],
  );

  function ordenar() {
    aoOrdenar(algoritmoPorId(algoritmo).ordenar(produtos.slice(), compararPorPreco));
  }

  const renderizarItem = useCallback(
    ({ item, index }: { item: Produto; index: number }) => (
      <ItemProduto produto={item} posicao={index + 1} aoRemover={aoRemover} />
    ),
    [aoRemover],
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

          <View style={estilos.ordenacao}>
            <Text style={estilos.titulo}>Ordenar do mais barato ao mais caro</Text>
            <Escolha
              opcoes={ALGORITMOS.map((a) => ({
                valor: a.id,
                rotulo: a.nome.replace(" Sort", ""),
              }))}
              selecionado={algoritmo}
              aoSelecionar={setAlgoritmo}
            />
            <Botao
              titulo="Ordenar"
              aoPressionar={ordenar}
              quieto
              desabilitado={produtos.length < 2}
            />
          </View>

          {produtos.length > 0 ? (
            <View style={estilos.resumo}>
              <Text style={estilos.resumoTexto}>
                {produtos.length} {produtos.length === 1 ? "produto" : "produtos"}
              </Text>
              <Text style={estilos.resumoTotal}>{formatarPreco(total)}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>Cadastre dois produtos para ver a ordenação funcionando.</Text>
      }
    />
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.xl, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.xl, paddingTop: espaco.xl, paddingBottom: espaco.lg },
  ordenacao: { gap: espaco.md },
  titulo: { fontSize: 16, fontWeight: "600", color: cores.tinta },
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
  vazio: { fontSize: 15, lineHeight: 22, color: cores.suave, paddingTop: espaco.lg },
});
