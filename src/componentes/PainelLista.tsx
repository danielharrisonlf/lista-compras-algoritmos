import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ALGORITMOS, algoritmoPorId, type IdAlgoritmo } from "../algoritmos";
import { formatarPreco } from "../dominio/preco";
import { compararPorPreco, type Produto } from "../dominio/produto";
import { cores, espaco, raio } from "../tema";
import { Botao } from "./Botao";
import { Cartao } from "./Cartao";
import { FormularioProduto } from "./FormularioProduto";
import { ItemProduto } from "./ItemProduto";
import { SeletorSegmentado } from "./SeletorSegmentado";

type Props = {
  produtos: Produto[];
  aoAdicionar: (nome: string, precoCentavos: number) => void;
  aoRemover: (id: string) => void;
  aoOrdenar: (ordenados: Produto[]) => void;
};

export function PainelLista({ produtos, aoAdicionar, aoRemover, aoOrdenar }: Props) {
  const [algoritmoEscolhido, setAlgoritmoEscolhido] = useState<IdAlgoritmo>("merge");

  const total = useMemo(
    () => produtos.reduce((soma, p) => soma + p.precoCentavos, 0),
    [produtos],
  );

  function ordenar() {
    const algoritmo = algoritmoPorId(algoritmoEscolhido);
    const ordenados = algoritmo.ordenar(produtos.slice(), compararPorPreco);
    aoOrdenar(ordenados);
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
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Cartao titulo="Novo produto">
            <FormularioProduto aoAdicionar={aoAdicionar} />
          </Cartao>

          <Cartao
            titulo="Ordenar por preço"
            descricao="Coloca os produtos do mais barato para o mais caro usando o algoritmo escolhido."
          >
            <SeletorSegmentado
              opcoes={ALGORITMOS.map((a) => ({ valor: a.id, rotulo: a.nome.replace(" Sort", "") }))}
              selecionado={algoritmoEscolhido}
              aoSelecionar={setAlgoritmoEscolhido}
            />
            <Text style={estilos.ajuda}>
              {algoritmoPorId(algoritmoEscolhido).nome} · tempo{" "}
              {algoritmoPorId(algoritmoEscolhido).casoMedio} no caso médio · memória auxiliar{" "}
              {algoritmoPorId(algoritmoEscolhido).memoriaAuxiliar}
            </Text>
            <Botao
              titulo="Ordenar por preço"
              aoPressionar={ordenar}
              variante="secundaria"
              desabilitado={produtos.length < 2}
            />
          </Cartao>

          <View style={estilos.resumo}>
            <Text style={estilos.resumoTexto}>
              {produtos.length} {produtos.length === 1 ? "produto" : "produtos"}
            </Text>
            <Text style={estilos.resumoTotal}>Total {formatarPreco(total)}</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={estilos.vazio}>
          <Text style={estilos.vazioTitulo}>Sua lista está vazia</Text>
          <Text style={estilos.vazioTexto}>
            Cadastre alguns produtos acima para ver a ordenação por preço funcionando.
          </Text>
        </View>
      }
    />
  );
}

function Separador() {
  return <View style={{ height: espaco.sm }} />;
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.lg, marginBottom: espaco.lg },
  ajuda: { fontSize: 12, lineHeight: 18, color: cores.textoSuave },
  resumo: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  resumoTexto: { fontSize: 13, fontWeight: "700", color: cores.textoSuave, textTransform: "uppercase" },
  resumoTotal: { fontSize: 16, fontWeight: "700", color: cores.texto },
  vazio: {
    backgroundColor: cores.superficieSuave,
    borderRadius: raio.md,
    padding: espaco.xl,
    gap: espaco.sm,
    alignItems: "center",
  },
  vazioTitulo: { fontSize: 15, fontWeight: "700", color: cores.texto },
  vazioTexto: { fontSize: 13, lineHeight: 19, color: cores.textoSuave, textAlign: "center" },
});
