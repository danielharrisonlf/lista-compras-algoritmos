import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { analisarPreco } from "../dominio/preco";
import { cores, espaco } from "../tema";
import { Botao } from "./Botao";

type Props = { aoAdicionar: (nome: string, precoCentavos: number) => void };

const NOME_MAXIMO = 40;

export function FormularioProduto({ aoAdicionar }: Props) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function enviar() {
    const nomeLimpo = nome.trim().replace(/\s+/g, " ");

    if (nomeLimpo.length === 0) {
      setErro("Informe o nome do produto.");
      return;
    }

    const resultado = analisarPreco(preco);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    aoAdicionar(nomeLimpo.slice(0, NOME_MAXIMO), resultado.centavos);
    setNome("");
    setPreco("");
    setErro(null);
  }

  return (
    <View style={estilos.container}>
      <View style={estilos.linha}>
        <TextInput
          style={[estilos.entrada, estilos.campoNome]}
          value={nome}
          onChangeText={(texto) => {
            setNome(texto);
            if (erro) setErro(null);
          }}
          placeholder="Arroz 5 kg"
          placeholderTextColor={cores.suave}
          maxLength={NOME_MAXIMO}
          returnKeyType="next"
          accessibilityLabel="Nome do produto"
        />
        <TextInput
          style={[estilos.entrada, estilos.campoPreco]}
          value={preco}
          onChangeText={(texto) => {
            setPreco(texto);
            if (erro) setErro(null);
          }}
          placeholder="24,90"
          placeholderTextColor={cores.suave}
          keyboardType="decimal-pad"
          maxLength={13}
          returnKeyType="done"
          onSubmitEditing={enviar}
          accessibilityLabel="Preço em reais"
        />
      </View>

      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}

      <Botao titulo="Adicionar" aoPressionar={enviar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espaco.md },
  linha: { flexDirection: "row", gap: espaco.md },
  campoNome: { flex: 2 },
  campoPreco: { flex: 1, textAlign: "right", fontVariant: ["tabular-nums"] },
  entrada: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
    paddingHorizontal: 2,
    fontSize: 17,
    color: cores.tinta,
  },
  erro: {
    fontSize: 13,
    color: cores.erro,
    backgroundColor: cores.erroFraco,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
  },
});
