import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CORES } from "../Constants/cores";
import type { Produto } from "../Types/types";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type CartaoProdutoProps = {
  produto: Produto;
  aoPressionar: (produto: Produto) => void;
  desabilitado?: boolean;
};

export function CartaoProduto({
  produto,
  aoPressionar,
  desabilitado = false,
}: CartaoProdutoProps) {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const precoFormatado = formatarPrecoCentavos(produto.preco);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${produto.nome}, ${precoFormatado}`}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={() => aoPressionar(produto)}
      style={({ pressed }) => [
        estilos.cartao,
        desabilitado ? estilos.cartaoDesabilitado : null,
        pressed && !desabilitado ? estilos.cartaoPressionado : null,
      ]}
    >
      <View style={estilos.areaImagem}>
        {imagemFalhou ? (
          <View style={estilos.semImagem}>
            <Text style={estilos.textoSemImagem}>Imagem indisponível</Text>
          </View>
        ) : (
          <Image
            source={{ uri: produto.imagem }}
            style={estilos.imagem}
            resizeMode="cover"
            onError={() => setImagemFalhou(true)}
            accessibilityLabel={`Imagem de ${produto.nome}`}
          />
        )}
      </View>

      <View style={estilos.informacoes}>
        <Text style={estilos.nome} numberOfLines={2}>
          {produto.nome}
        </Text>
        <Text style={estilos.preco}>{precoFormatado}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: 12,
  },
  cartaoDesabilitado: {
    opacity: 0.6,
  },
  cartaoPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  areaImagem: {
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    height: 96,
    overflow: "hidden",
    width: 96,
  },
  imagem: {
    height: "100%",
    width: "100%",
  },
  semImagem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 6,
  },
  textoSemImagem: {
    color: CORES.textoSecundario,
    fontSize: 11,
    textAlign: "center",
  },
  informacoes: {
    flex: 1,
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingVertical: 4,
  },
  nome: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "600",
  },
  preco: {
    color: CORES.primaria,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
});
