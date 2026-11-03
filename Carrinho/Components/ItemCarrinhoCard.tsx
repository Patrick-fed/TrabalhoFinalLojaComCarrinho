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
import type { OperacaoCarrinho } from "../Types/carrinho";
import type { ItemCarrinho } from "../Types/types";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type ItemCarrinhoCardProps = {
  item: ItemCarrinho;
  operacao: OperacaoCarrinho | null;
  estoque?: number;
  aoAumentar: (item: ItemCarrinho) => void;
  aoDiminuir: (item: ItemCarrinho) => void;
  aoRemover: (item: ItemCarrinho) => void;
};

function descreverEstoque(
  estoque: number,
  quantidade: number
): { texto: string; critico: boolean } {
  if (estoque <= 0) {
    return { texto: MENSAGENS_CARRINHO.estoqueEsgotado, critico: true };
  }

  if (quantidade >= estoque) {
    const disponiveis =
      estoque === 1 ? "1 disponível" : `${estoque} disponíveis`;

    return {
      texto: `${MENSAGENS_CARRINHO.estoqueLimite} (${disponiveis}).`,
      critico: true,
    };
  }

  return {
    texto: `${MENSAGENS_CARRINHO.estoqueDisponivel}: ${estoque}`,
    critico: false,
  };
}

export function ItemCarrinhoCard({
  item,
  operacao,
  estoque,
  aoAumentar,
  aoDiminuir,
  aoRemover,
}: ItemCarrinhoCardProps) {
  const [imagemFalhou, setImagemFalhou] = useState(false);

  const operacaoNoItem =
    operacao !== null && operacao.produtoId === item.produtoId;
  const controlesDesabilitados = operacao !== null;
  const diminuirDesabilitado =
    controlesDesabilitados || item.quantidade <= 1;

  const estoqueConhecido =
    typeof estoque === "number" && Number.isFinite(estoque);
  const descricaoEstoque = estoqueConhecido
    ? descreverEstoque(estoque, item.quantidade)
    : null;
  const aumentarDesabilitado =
    controlesDesabilitados || (descricaoEstoque?.critico ?? false);

  return (
    <View style={estilos.cartao}>
      <View style={estilos.linhaPrincipal}>
        <View style={estilos.areaImagem}>
          {imagemFalhou ? (
            <View style={estilos.semImagem}>
              <Text style={estilos.textoSemImagem}>Imagem indisponível</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.imagem }}
              style={estilos.imagem}
              resizeMode="cover"
              onError={() => setImagemFalhou(true)}
              accessibilityLabel={`Imagem de ${item.nome}`}
            />
          )}
        </View>

        <View style={estilos.informacoes}>
          <Text style={estilos.nome} numberOfLines={2}>
            {item.nome}
          </Text>
          <Text style={estilos.precoUnitario}>
            {formatarPrecoCentavos(item.preco)}
          </Text>
          {descricaoEstoque ? (
            <Text
              style={[
                estilos.estoque,
                descricaoEstoque.critico ? estilos.estoqueCritico : null,
              ]}
            >
              {descricaoEstoque.texto}
            </Text>
          ) : null}
          <View style={estilos.linhaSubtotal}>
            <Text style={estilos.labelSubtotal}>
              {MENSAGENS_CARRINHO.subtotal}
            </Text>
            <Text style={estilos.subtotal}>
              {formatarPrecoCentavos(item.subtotal)}
            </Text>
          </View>
        </View>
      </View>

      <View style={estilos.rodape}>
        <View style={estilos.controlesQuantidade}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Diminuir quantidade de ${item.nome}`}
            accessibilityState={{
              disabled: diminuirDesabilitado,
              busy: operacaoNoItem,
            }}
            disabled={diminuirDesabilitado}
            onPress={() => aoDiminuir(item)}
            style={({ pressed }) => [
              estilos.botaoControle,
              diminuirDesabilitado ? estilos.botaoDesabilitado : null,
              pressed && !diminuirDesabilitado
                ? estilos.botaoControlePressionado
                : null,
            ]}
          >
            <Text style={estilos.textoControle}>−</Text>
          </Pressable>

          <Text
            style={estilos.quantidade}
            accessibilityLabel={`Quantidade ${item.quantidade}`}
          >
            {item.quantidade}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Aumentar quantidade de ${item.nome}`}
            accessibilityHint={
              descricaoEstoque?.critico ? descricaoEstoque.texto : undefined
            }
            accessibilityState={{
              disabled: aumentarDesabilitado,
              busy: operacaoNoItem,
            }}
            disabled={aumentarDesabilitado}
            onPress={() => aoAumentar(item)}
            style={({ pressed }) => [
              estilos.botaoControle,
              aumentarDesabilitado ? estilos.botaoDesabilitado : null,
              pressed && !aumentarDesabilitado
                ? estilos.botaoControlePressionado
                : null,
            ]}
          >
            <Text style={estilos.textoControle}>+</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.nome} do carrinho`}
          accessibilityState={{
            disabled: controlesDesabilitados,
            busy: operacaoNoItem,
          }}
          disabled={controlesDesabilitados}
          onPress={() => aoRemover(item)}
          style={({ pressed }) => [
            estilos.botaoRemover,
            controlesDesabilitados ? estilos.botaoDesabilitado : null,
            pressed && !controlesDesabilitados
              ? estilos.botaoRemoverPressionado
              : null,
          ]}
        >
          <Text style={estilos.textoRemover}>
            {MENSAGENS_CARRINHO.remover}
          </Text>
        </Pressable>
      </View>

      {operacaoNoItem ? (
        <View style={estilos.indicadorOperacao}>
          <ActivityIndicator color={CORES.primaria} size="small" />
          <Text style={estilos.textoOperacao}>Atualizando...</Text>
        </View>
      ) : null}
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
  linhaPrincipal: {
    flexDirection: "row",
  },
  areaImagem: {
    backgroundColor: CORES.primariaClara,
    borderRadius: 8,
    height: 84,
    overflow: "hidden",
    width: 84,
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
    paddingVertical: 2,
  },
  nome: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "600",
  },
  precoUnitario: {
    color: CORES.textoSecundario,
    fontSize: 13,
    marginTop: 4,
  },
  estoque: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginTop: 4,
  },
  estoqueCritico: {
    color: CORES.erro,
    fontWeight: "600",
  },
  linhaSubtotal: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  labelSubtotal: {
    color: CORES.textoSecundario,
    fontSize: 12,
  },
  subtotal: {
    color: CORES.primaria,
    fontSize: 16,
    fontWeight: "700",
  },
  rodape: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  controlesQuantidade: {
    alignItems: "center",
    flexDirection: "row",
  },
  botaoControle: {
    alignItems: "center",
    borderColor: CORES.borda,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  botaoControlePressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoControle: {
    color: CORES.primaria,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  quantidade: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 36,
    textAlign: "center",
  },
  botaoRemover: {
    borderColor: CORES.erro,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  botaoRemoverPressionado: {
    backgroundColor: CORES.erroFundo,
  },
  textoRemover: {
    color: CORES.erro,
    fontSize: 13,
    fontWeight: "700",
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  indicadorOperacao: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  textoOperacao: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginLeft: 8,
  },
});
