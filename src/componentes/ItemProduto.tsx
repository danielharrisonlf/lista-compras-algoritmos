import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatarPreco } from "../dominio/preco";
import type { Produto } from "../dominio/produto";
import { cores, espaco, raio } from "../tema";

type Props = { produto: Produto; posicao: number; aoRemover?: (id: string) => void };

export const ItemProduto = memo(function ItemProduto({ produto, posicao, aoRemover }: Props) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.posicao}>{posicao}</Text>
      <Text style={estilos.nome} numberOfLines={1}>
        {produto.nome}
      </Text>
      <Text style={estilos.preco}>{formatarPreco(produto.precoCentavos)}</Text>
      {aoRemover ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${produto.nome}`}
          hitSlop={8}
          onPress={() => aoRemover(produto.id)}
          style={({ pressed }) => [estilos.remover, pressed && { opacity: 0.6 }]}
        >
          <Text style={estilos.removerTexto}>Remover</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  posicao: { fontSize: 12, fontWeight: "700", color: cores.textoSuave, minWidth: 22 },
  nome: { flex: 1, fontSize: 15, color: cores.texto },
  preco: { fontSize: 15, fontWeight: "700", color: cores.destaque, fontVariant: ["tabular-nums"] },
  remover: { paddingHorizontal: espaco.sm, paddingVertical: espaco.xs },
  removerTexto: { fontSize: 13, fontWeight: "600", color: cores.erro },
});
