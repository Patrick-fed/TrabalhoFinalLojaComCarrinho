import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotaoPrincipal } from "../Components/BotaoPrincipal";
import { MensagemErro } from "../Components/MensagemErro";
import { CORES } from "../Constants/cores";
import {
  MENSAGENS_CHECKOUT,
  rotuloFormaPagamento,
} from "../Constants/mensagensCheckout";
import { MENSAGENS_CARRINHO } from "../Constants/mensagensCarrinho";
import { useCarrinho } from "../Context/CarrinhoContext";
import type { AppStackParamList } from "../Types/navigation";
import { formatarPrecoCentavos } from "../Utils/formatacao";

type ConfirmacaoCompraScreenProps = NativeStackScreenProps<
  AppStackParamList,
  "ConfirmacaoCompra"
>;

export function ConfirmacaoCompraScreen({
  navigation,
  route,
}: ConfirmacaoCompraScreenProps) {
  const { compra, carrinhoAtualizado } = route.params;
  const { limparCarrinho } = useCarrinho();

  const [atualizandoCarrinho, setAtualizandoCarrinho] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  const rotuloPagamento = compra
    ? (rotuloFormaPagamento(compra.formaPagamento) ??
      compra.formaPagamento)
    : "";

  function voltarAoCatalogo() {
    if (atualizandoCarrinho) {
      return;
    }

    async function executar() {
      if (!carrinhoAtualizado) {
        if (montadoRef.current) {
          setAtualizandoCarrinho(true);
        }

        try {
          await limparCarrinho();
        } catch {
          // Falha na limpeza não bloqueia o retorno; o carrinho é
          // atualizado em outra oportunidade.
        }

        if (montadoRef.current) {
          setAtualizandoCarrinho(false);
        }
      }

      if (!montadoRef.current) {
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Catalogo" }],
      });
    }

    void executar();
  }

  if (!compra) {
    return (
      <SafeAreaView style={estilos.container}>
        <View style={estilos.conteudoCentral}>
          <MensagemErro mensagem={MENSAGENS_CHECKOUT.finalizacaoFalhou} />
          <BotaoPrincipal
            titulo={MENSAGENS_CARRINHO.voltarAoCatalogo}
            aoPressionar={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Catalogo" }],
              });
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.selo}>
          <Text style={estilos.seloTexto}>✓</Text>
        </View>

        <Text style={estilos.titulo}>
          {MENSAGENS_CHECKOUT.confirmacaoTitulo}
        </Text>

        <View style={estilos.cartao}>
          <View style={estilos.linha}>
            <Text style={estilos.label}>
              {MENSAGENS_CHECKOUT.pedido}
            </Text>
            <Text style={estilos.valor}>{String(compra.id)}</Text>
          </View>

          <View style={estilos.linha}>
            <Text style={estilos.label}>{MENSAGENS_CHECKOUT.status}</Text>
            <Text style={estilos.valor}>{compra.status}</Text>
          </View>

          <View style={estilos.linha}>
            <Text style={estilos.label}>
              {MENSAGENS_CHECKOUT.formaPagamento}
            </Text>
            <Text style={estilos.valor}>{rotuloPagamento}</Text>
          </View>

          <View style={estilos.divisor} />

          <Text style={estilos.subtitulo}>
            {MENSAGENS_CHECKOUT.itens}
          </Text>

          {compra.itens.map((item) => (
            <View
              key={String(item.produtoId)}
              style={estilos.linhaItem}
            >
              <View style={estilos.areaItem}>
                <Text style={estilos.nomeItem} numberOfLines={2}>
                  {item.nome}
                </Text>
                <Text style={estilos.quantidadeItem}>
                  {MENSAGENS_CHECKOUT.quantidade}: {item.quantidade}
                </Text>
              </View>
              <Text style={estilos.subtotalItem}>
                {formatarPrecoCentavos(item.subtotal)}
              </Text>
            </View>
          ))}

          <View style={estilos.divisor} />

          <View style={estilos.linha}>
            <Text style={estilos.labelTotal}>
              {MENSAGENS_CHECKOUT.total}
            </Text>
            <Text style={estilos.total}>
              {formatarPrecoCentavos(compra.total)}
            </Text>
          </View>
        </View>

        {!carrinhoAtualizado ? (
          <View style={estilos.aviso}>
            <Text style={estilos.textoAviso}>
              {MENSAGENS_CHECKOUT.carrinhoPendente}
            </Text>
          </View>
        ) : null}

        <View style={estilos.areaBotao}>
          <BotaoPrincipal
            titulo={MENSAGENS_CARRINHO.voltarAoCatalogo}
            aoPressionar={voltarAoCatalogo}
            carregando={atualizandoCarrinho}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.fundo,
    flex: 1,
  },
  conteudo: {
    padding: 24,
    paddingBottom: 40,
  },
  conteudoCentral: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  selo: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: CORES.primariaClara,
    borderColor: CORES.primaria,
    borderRadius: 36,
    borderWidth: 2,
    height: 72,
    justifyContent: "center",
    marginBottom: 16,
    width: 72,
  },
  seloTexto: {
    color: CORES.primaria,
    fontSize: 34,
    fontWeight: "700",
  },
  titulo: {
    color: CORES.texto,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  cartao: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  linha: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  valor: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: "600",
  },
  divisor: {
    backgroundColor: CORES.borda,
    height: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  subtitulo: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  linhaItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  areaItem: {
    flex: 1,
    paddingRight: 12,
  },
  nomeItem: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: "600",
  },
  quantidadeItem: {
    color: CORES.textoSecundario,
    fontSize: 13,
    marginTop: 2,
  },
  subtotalItem: {
    color: CORES.primaria,
    fontSize: 15,
    fontWeight: "700",
  },
  labelTotal: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },
  total: {
    color: CORES.primaria,
    fontSize: 22,
    fontWeight: "700",
  },
  aviso: {
    backgroundColor: CORES.primariaClara,
    borderColor: CORES.primaria,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  textoAviso: {
    color: CORES.texto,
    fontSize: 14,
    textAlign: "center",
  },
  areaBotao: {
    marginTop: 24,
  },
});
