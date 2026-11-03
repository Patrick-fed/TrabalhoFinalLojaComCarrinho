import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CORES } from "../Constants/cores";
import { MENSAGENS_CARRINHO } from "../Constants/mensagensCarrinho";
import type { Produto } from "../Types/types";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type CartaoProdutoProps = {
  produto: Produto;
  quantidadeNoCarrinho?: number;
  aoPressionar: (produto: Produto) => void;
  aoAdicionar: (produto: Produto) => void;
  adicionando?: boolean;
  adicaoDesabilitada?: boolean;
  desabilitado?: boolean;
};

export function CartaoProduto({
  produto,
  quantidadeNoCarrinho = 0,
  aoPressionar,
  aoAdicionar,
  adicionando = false,
  adicaoDesabilitada = false,
  desabilitado = false,
}: CartaoProdutoProps) {
  const [imagemFalhou, setImagemFalhou] = useState(false);

  const precoFormatado = formatarPrecoCentavos(produto.preco);
  const estoqueDisponivel = Math.max(
    produto.estoque - quantidadeNoCarrinho,
    0
  );
  const esgotado = estoqueDisponivel <= 0;
  const acaoDesabilitada =
    esgotado || adicionando || adicaoDesabilitada || desabilitado;
  const rotuloAcao = esgotado
    ? MENSAGENS_CARRINHO.esgotado
    : MENSAGENS_CARRINHO.adicionar;

  return (
    <View
      style={[
        estilos.cartao,
        desabilitado ? estilos.cartaoDesabilitado : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${produto.nome}, ${precoFormatado}, ${
          esgotado ? "esgotado" : `${estoqueDisponivel} em estoque`
        }`}
        accessibilityState={{ disabled: desabilitado }}
        disabled={desabilitado}
        onPress={() => aoPressionar(produto)}
        style={({ pressed }) => [
          estilos.areaPrincipal,
          pressed && !desabilitado ? estilos.areaPrincipalPressionada : null,
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
          <Text
            style={[estilos.estoque, esgotado ? estilos.estoqueEsgotado : null]}
          >
            {esgotado
              ? MENSAGENS_CARRINHO.estoqueEsgotado
              : `${MENSAGENS_CARRINHO.estoqueDisponivel}: ${estoqueDisponivel}`}
          </Text>
          <Text style={estilos.preco}>{precoFormatado}</Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotuloAcao} ${produto.nome}`}
        accessibilityState={{
          disabled: acaoDesabilitada,
          busy: adicionando,
        }}
        disabled={acaoDesabilitada}
        onPress={() => aoAdicionar(produto)}
        style={({ pressed }) => [
          estilos.botaoAdicionar,
          esgotado ? estilos.botaoEsgotado : null,
          acaoDesabilitada && !esgotado
            ? estilos.botaoAdicionarDesabilitado
            : null,
          pressed && !acaoDesabilitada
            ? estilos.botaoAdicionarPressionado
            : null,
        ]}
      >
        {adicionando ? (
          <ActivityIndicator color={CORES.branco} size="small" />
        ) : (
          <Text style={estilos.textoBotaoAdicionar}>{rotuloAcao}</Text>
        )}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  cartaoDesabilitado: {
    opacity: 0.6,
  },
  areaPrincipal: {
    borderRadius: 8,
    flexDirection: "row",
  },
  areaPrincipalPressionada: {
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
  estoque: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginTop: 2,
  },
  estoqueEsgotado: {
    color: CORES.erro,
    fontWeight: "600",
  },
  preco: {
    color: CORES.primaria,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  botaoAdicionar: {
    alignItems: "center",
    backgroundColor: CORES.primaria,
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botaoAdicionarPressionado: {
    backgroundColor: CORES.primariaEscura,
  },
  botaoAdicionarDesabilitado: {
    backgroundColor: CORES.textoSecundario,
    opacity: 0.7,
  },
  botaoEsgotado: {
    backgroundColor: CORES.textoSecundario,
    opacity: 0.7,
  },
  textoBotaoAdicionar: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: "700",
  },
});
