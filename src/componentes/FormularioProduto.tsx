import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { analisarPreco } from "../dominio/preco";
import { cores, espaco, raio } from "../tema";
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
        <View style={estilos.campoNome}>
          <Text style={estilos.rotulo}>Produto</Text>
          <TextInput
            style={estilos.entrada}
            value={nome}
            onChangeText={(texto) => {
              setNome(texto);
              if (erro) setErro(null);
            }}
            placeholder="Arroz 5 kg"
            placeholderTextColor={cores.textoSuave}
            maxLength={NOME_MAXIMO}
            returnKeyType="next"
            accessibilityLabel="Nome do produto"
          />
        </View>
        <View style={estilos.campoPreco}>
          <Text style={estilos.rotulo}>Preço</Text>
          <TextInput
            style={estilos.entrada}
            value={preco}
            onChangeText={(texto) => {
              setPreco(texto);
              if (erro) setErro(null);
            }}
            placeholder="24,90"
            placeholderTextColor={cores.textoSuave}
            keyboardType="decimal-pad"
            maxLength={13}
            returnKeyType="done"
            onSubmitEditing={enviar}
            accessibilityLabel="Preço do produto em reais"
          />
        </View>
      </View>

      <Text style={estilos.ajuda}>
        Use vírgula ou ponto e até 2 casas decimais (24,90 ou 24.90). Máximo R$ 999.999,99.
      </Text>

      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}

      <Botao titulo="Adicionar à lista" aoPressionar={enviar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espaco.md },
  linha: { flexDirection: "row", gap: espaco.md },
  campoNome: { flex: 2, gap: espaco.xs },
  campoPreco: { flex: 1, gap: espaco.xs },
  rotulo: { fontSize: 12, fontWeight: "700", color: cores.textoSuave, textTransform: "uppercase" },
  entrada: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    fontSize: 16,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  ajuda: { fontSize: 12, lineHeight: 17, color: cores.textoSuave },
  erro: {
    fontSize: 13,
    color: cores.erro,
    backgroundColor: cores.erroSuave,
    borderRadius: raio.sm,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
  },
});
