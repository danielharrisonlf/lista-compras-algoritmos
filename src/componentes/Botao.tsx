import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { cores, espaco, raio } from "../tema";

type Props = {
  titulo: string;
  aoPressionar: () => void;
  variante?: "primaria" | "secundaria" | "perigo";
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: ViewStyle;
};

export function Botao({
  titulo,
  aoPressionar,
  variante = "primaria",
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
        estilos[variante],
        pressed && !inativo && estilos.pressionado,
        inativo && estilos.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={variante === "primaria" ? cores.sobrePrimaria : cores.primaria} />
      ) : (
        <Text style={[estilos.texto, estilos[`texto_${variante}`]]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 46,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    borderRadius: raio.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaria: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  secundaria: { backgroundColor: cores.superficie, borderColor: cores.borda },
  perigo: { backgroundColor: cores.erroSuave, borderColor: cores.erroSuave },
  pressionado: { opacity: 0.75 },
  inativo: { opacity: 0.45 },
  texto: { fontSize: 15, fontWeight: "600" },
  texto_primaria: { color: cores.sobrePrimaria },
  texto_secundaria: { color: cores.texto },
  texto_perigo: { color: cores.erro },
});
