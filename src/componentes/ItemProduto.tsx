import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatarPreco } from "../dominio/preco";
import type { Produto } from "../dominio/produto";
import { cores, espaco } from "../tema";

type Props = { produto: Produto; posicao: number; aoRemover: (id: string) => void };

export const ItemProduto = memo(function ItemProduto({ produto, posicao, aoRemover }: Props) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.posicao}>{posicao}</Text>
      <Text style={estilos.nome} numberOfLines={1}>
        {produto.nome}
      </Text>
      <Text style={estilos.preco}>{formatarPreco(produto.precoCentavos)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remover ${produto.nome}`}
        hitSlop={12}
        onPress={() => aoRemover(produto.id)}
        style={({ pressed }) => pressed && { opacity: 0.5 }}
      >
        <Text style={estilos.remover}>×</Text>
      </Pressable>
    </View>
  );
});

const estilos = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  posicao: {
    fontSize: 12,
    color: cores.suave,
    minWidth: 20,
    fontVariant: ["tabular-nums"],
  },
  nome: { flex: 1, fontSize: 16, color: cores.tinta },
  preco: {
    fontSize: 17,
    fontWeight: "700",
    color: cores.preco,
    fontVariant: ["tabular-nums"],
  },
  remover: { fontSize: 22, lineHeight: 24, color: cores.suave, paddingLeft: espaco.xs },
});
