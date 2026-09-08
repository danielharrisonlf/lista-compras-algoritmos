import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { cores, espaco, raio } from "../tema";

type Props = { titulo?: string; descricao?: string; children: ReactNode };

export function Cartao({ titulo, descricao, children }: Props) {
  return (
    <View style={estilos.cartao}>
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
      {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.md,
  },
  titulo: { fontSize: 17, fontWeight: "700", color: cores.texto },
  descricao: { fontSize: 13, lineHeight: 19, color: cores.textoSuave, marginTop: -espaco.sm },
});
