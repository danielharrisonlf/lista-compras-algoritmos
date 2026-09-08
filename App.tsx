import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PainelComparacao } from "./src/componentes/PainelComparacao";
import { PainelLista } from "./src/componentes/PainelLista";
import { SeletorSegmentado } from "./src/componentes/SeletorSegmentado";
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
  const ultimoErroSalvar = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarProdutos()
      .then((salvos) => {
        if (ativo) setProdutos(salvos);
      })
      .catch(() => {
      })
      .finally(() => {
        if (ativo) setCarregado(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!carregado) return;
    salvarProdutos(produtos).catch((erro: unknown) => {
      ultimoErroSalvar.current = String(erro);
    });
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
    <View style={[estilos.tela, { paddingTop: insets.top }]}>
      <View style={estilos.topo}>
        <Text style={estilos.titulo}>Lista de Compras</Text>
        <Text style={estilos.subtitulo}>
          Organiza os produtos do menor para o maior preço — e compara três algoritmos de ordenação.
        </Text>
        <SeletorSegmentado
          opcoes={[
            { valor: "lista", rotulo: "Minha lista" },
            { valor: "comparar", rotulo: "Comparar algoritmos" },
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
            <ActivityIndicator color={cores.primaria} />
            <Text style={estilos.carregandoTexto}>Carregando sua lista...</Text>
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
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.md,
    paddingBottom: espaco.md,
    gap: espaco.sm,
    backgroundColor: cores.superficie,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  titulo: { fontSize: 22, fontWeight: "700", color: cores.texto },
  subtitulo: { fontSize: 13, lineHeight: 19, color: cores.textoSuave },
  corpo: { flex: 1 },
  carregando: { flex: 1, alignItems: "center", justifyContent: "center", gap: espaco.md },
  carregandoTexto: { fontSize: 13, color: cores.textoSuave },
});
