import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PainelComparacao } from "./src/componentes/PainelComparacao";
import { PainelLista } from "./src/componentes/PainelLista";
import { Escolha } from "./src/componentes/Escolha";
import { carregarProdutos, salvarProdutos } from "./src/armazenamento/repositorio";
import { novoId, type Produto } from "./src/dominio/produto";
import { cores, espaco } from "./src/tema";

type Aba = "lista" | "comparar";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tela />
    </SafeAreaProvider>
  );
}

function Tela() {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState<Aba>("lista");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [versaoLista, setVersaoLista] = useState(0);

  useEffect(() => {
    let ativo = true;

    carregarProdutos()
      .then((salvos) => {
        if (ativo) setProdutos(salvos);
      })
      .catch(() => undefined)
      .finally(() => {
        if (ativo) setCarregado(true);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!carregado) return;
    salvarProdutos(produtos).catch(() => undefined);
  }, [produtos, carregado]);

  const adicionar = useCallback((nome: string, precoCentavos: number) => {
    setProdutos((atuais) => [...atuais, { id: novoId(), nome, precoCentavos }]);
    setVersaoLista((v) => v + 1);
  }, []);

  const remover = useCallback((id: string) => {
    setProdutos((atuais) => atuais.filter((p) => p.id !== id));
    setVersaoLista((v) => v + 1);
  }, []);

  const substituir = useCallback((ordenados: Produto[]) => {
    setProdutos(ordenados);
    setVersaoLista((v) => v + 1);
  }, []);

  return (
    <View style={[estilos.tela, { paddingTop: insets.top + espaco.lg }]}>
      <View style={estilos.topo}>
        <Text style={estilos.titulo}>Lista de compras</Text>
        <Text style={estilos.subtitulo}>
          Uma lista que se organiza do produto mais barato para o mais caro, escrita três vezes com
          três algoritmos de ordenação diferentes.
        </Text>
        <Escolha
          opcoes={[
            { valor: "lista", rotulo: "Lista" },
            { valor: "comparar", rotulo: "Comparação" },
          ]}
          selecionado={aba}
          aoSelecionar={setAba}
        />
      </View>

      <KeyboardAvoidingView
        style={estilos.corpo}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {!carregado ? (
          <View style={estilos.carregando}>
            <ActivityIndicator color={cores.tinta} />
          </View>
        ) : aba === "lista" ? (
          <PainelLista
            produtos={produtos}
            aoAdicionar={adicionar}
            aoRemover={remover}
            aoOrdenar={substituir}
          />
        ) : (
          <PainelComparacao produtos={produtos} versaoLista={versaoLista} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  topo: { paddingHorizontal: espaco.xl, gap: espaco.sm },
  titulo: { fontSize: 26, fontWeight: "700", color: cores.tinta, letterSpacing: -0.5 },
  subtitulo: { fontSize: 14, lineHeight: 21, color: cores.suave, maxWidth: 400 },
  corpo: { flex: 1 },
  carregando: { flex: 1, alignItems: "center", justifyContent: "center" },
});
