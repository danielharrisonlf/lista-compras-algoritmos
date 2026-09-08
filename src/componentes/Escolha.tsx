import { Pressable, StyleSheet, Text, View } from "react-native";
import { cores, espaco } from "../tema";

export type Opcao<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
  opcoes: Opcao<T>[];
  selecionado: T;
  aoSelecionar: (valor: T) => void;
  desabilitado?: boolean;
};

export function Escolha<T extends string>({
  opcoes,
  selecionado,
  aoSelecionar,
  desabilitado = false,
}: Props<T>) {
  return (
    <View style={estilos.linha}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;

        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativo, disabled: desabilitado }}
            disabled={desabilitado}
            onPress={() => aoSelecionar(opcao.valor)}
            style={({ pressed }) => [
              estilos.item,
              ativo && estilos.ativo,
              pressed && { opacity: 0.6 },
              desabilitado && { opacity: 0.4 },
            ]}
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
  linha: { flexDirection: "row", flexWrap: "wrap", gap: espaco.lg },
  item: { paddingVertical: espaco.sm, borderBottomWidth: 2, borderBottomColor: "transparent" },
  ativo: { borderBottomColor: cores.etiqueta },
  texto: { fontSize: 15, color: cores.suave },
  textoAtivo: { color: cores.tinta, fontWeight: "600" },
});
