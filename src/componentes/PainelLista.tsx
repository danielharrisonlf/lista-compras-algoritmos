import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { ALGORITMOS, algoritmoPorId, type IdAlgoritmo } from "../algoritmos";
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

type Achado = {
  algoritmo: string;
  notacao: string;
  precoAlvo: number;
  produto: Produto | null;
  posicao: number;
  comparacoes: number;
  reordenou: boolean;
};

export function PainelLista({ produtos, aoAdicionar, aoRemover, aoOrdenar }: Props) {
  const [algoritmo, setAlgoritmo] = useState<IdAlgoritmo>("linear");
  const [termo, setTermo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [achado, setAchado] = useState<Achado | null>(null);

  const total = useMemo(
    () => produtos.reduce((soma, p) => soma + p.precoCentavos, 0),
    [produtos],
  );

  const estaOrdenada = useMemo(
    () => produtos.every((p, i) => i === 0 || produtos[i - 1].precoCentavos <= p.precoCentavos),
    [produtos],
  );

  function limparBusca() {
    if (achado) setAchado(null);
    if (erro) setErro(null);
  }

  function buscar() {
    const analise = analisarPreco(termo);

    if (!analise.ok) {
      setErro(analise.erro);
      setAchado(null);
      return;
    }

    const algo = algoritmoPorId(algoritmo);
    const precisaOrdenar = algoritmo === "binaria" && !estaOrdenada;
    const lista = precisaOrdenar ? produtos.slice().sort(compararPorPreco) : produtos;

    const resultado = algo.buscar(lista, analise.centavos);

    if (precisaOrdenar) aoOrdenar(lista);

    setErro(null);
    setAchado({
      algoritmo: algo.nome,
      notacao: algo.notacaoBigO,
      precoAlvo: analise.centavos,
      produto: resultado.produto,
      posicao: resultado.indice + 1,
      comparacoes: resultado.comparacoes,
      reordenou: precisaOrdenar,
    });
  }

  const renderizarItem = useCallback(
    ({ item, index }: { item: Produto; index: number }) => (
      <View style={achado?.produto?.id === item.id ? estilos.destacado : undefined}>
        <ItemProduto produto={item} posicao={index + 1} aoRemover={aoRemover} />
      </View>
    ),
    [aoRemover, achado],
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
            <View style={estilos.busca}>
              <Text style={estilos.titulo}>Procurar por preço</Text>

              <View style={estilos.linhaBusca}>
                <TextInput
                  value={termo}
                  onChangeText={(texto) => {
                    setTermo(texto);
                    limparBusca();
                  }}
                  placeholder="24,90"
                  placeholderTextColor={cores.suave}
                  keyboardType="decimal-pad"
                  returnKeyType="search"
                  onSubmitEditing={buscar}
                  style={estilos.campo}
                  accessibilityLabel="Preço a procurar"
                />
                <Botao
                  titulo="Buscar"
                  aoPressionar={buscar}
                  quieto
                  desabilitado={termo.trim() === ""}
                />
              </View>

              <Escolha
                opcoes={ALGORITMOS.map((a) => ({
                  valor: a.id,
                  rotulo: `${a.nome.replace("Busca ", "")} ${a.notacaoBigO}`,
                }))}
                selecionado={algoritmo}
                aoSelecionar={(id) => {
                  setAlgoritmo(id);
                  limparBusca();
                }}
              />

              {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

              {achado ? (
                <View style={estilos.achado}>
                  {achado.produto ? (
                    <Text style={estilos.achadoTexto}>
                      {achado.produto.nome} está na posição {achado.posicao} de {produtos.length}.
                    </Text>
                  ) : (
                    <Text style={estilos.achadoTexto}>
                      Nenhum produto custa {formatarPreco(achado.precoAlvo)}.
                    </Text>
                  )}
                  <Text style={estilos.achadoMeta}>
                    {achado.algoritmo} {achado.notacao}, {achado.comparacoes}{" "}
                    {achado.comparacoes === 1 ? "comparação" : "comparações"}
                    {achado.reordenou ? ", lista reordenada por preço antes de buscar" : ""}
                  </Text>
                </View>
              ) : null}

              <Botao
                titulo="Ordenar por preço"
                aoPressionar={() => {
                  aoOrdenar(produtos.slice().sort(compararPorPreco));
                  limparBusca();
                }}
                quieto
                desabilitado={produtos.length < 2 || estaOrdenada}
              />
            </View>
          ) : null}

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
        <Text style={estilos.vazio}>
          Cadastre produtos para procurar por preço com busca linear e binária.
        </Text>
      }
    />
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.xl, paddingBottom: espaco.xxl },
  cabecalho: { gap: espaco.xl, paddingTop: espaco.xl, paddingBottom: espaco.lg },
  busca: { gap: espaco.md },
  titulo: { fontSize: 16, fontWeight: "600", color: cores.tinta },
  linhaBusca: { flexDirection: "row", gap: espaco.md, alignItems: "center" },
  campo: {
    flex: 1,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
    paddingHorizontal: 2,
    fontSize: 17,
    color: cores.tinta,
    fontVariant: ["tabular-nums"],
  },
  erro: { fontSize: 13, color: cores.erro },
  achado: { gap: 2, borderLeftWidth: 3, borderLeftColor: cores.etiqueta, paddingLeft: espaco.md },
  achadoTexto: { fontSize: 15, color: cores.tinta },
  achadoMeta: { fontSize: 12, color: cores.suave },
  destacado: { backgroundColor: cores.superficie },
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
