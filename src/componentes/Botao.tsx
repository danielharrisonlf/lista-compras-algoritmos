import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { cores, espaco } from "../tema";

type Props = {
  titulo: string;
  aoPressionar: () => void;
  quieto?: boolean;
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: ViewStyle;
};

export function Botao({
  titulo,
  aoPressionar,
  quieto = false,
  desabilitado = false,
  carregando = false,
  estilo,
}: Props) {
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      onPress={aoPressionar}
      disabled={inativo}
      style={({ pressed }) => [
        estilos.base,
        quieto ? estilos.quieto : estilos.forte,
        pressed && !inativo && { opacity: 0.7 },
        inativo && { opacity: 0.4 },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={quieto ? cores.tinta : cores.papel} />
      ) : (
        <Text style={[estilos.texto, quieto && { color: cores.tinta }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: espaco.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  forte: { backgroundColor: cores.tinta },
  quieto: { borderWidth: 1, borderColor: cores.tinta },
  texto: { fontSize: 15, fontWeight: "600", color: cores.papel },
});
