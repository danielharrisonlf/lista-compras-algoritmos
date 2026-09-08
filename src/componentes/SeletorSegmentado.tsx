import { Pressable, StyleSheet, Text, View } from "react-native";
import { cores, espaco, raio } from "../tema";

export type Opcao<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
  opcoes: Opcao<T>[];
  selecionado: T;
  aoSelecionar: (valor: T) => void;
  desabilitado?: boolean;
};

export function SeletorSegmentado<T extends string>({
  opcoes,
  selecionado,
  aoSelecionar,
  desabilitado = false,
}: Props<T>) {
  return (
    <View style={estilos.grupo}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo, disabled: desabilitado }}
            disabled={desabilitado}
            onPress={() => aoSelecionar(opcao.valor)}
            style={[estilos.item, ativo && estilos.itemAtivo, desabilitado && estilos.inativo]}
          >
            <Text style={[estilos.texto, ativo && estilos.textoAtivo]} numberOfLines={1}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    flexDirection: "row",
    backgroundColor: cores.superficieSuave,
    borderRadius: raio.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: espaco.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raio.sm,
  },
  itemAtivo: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  inativo: { opacity: 0.5 },
  texto: { fontSize: 13, fontWeight: "600", color: cores.textoSuave },
  textoAtivo: { color: cores.primaria },
});
