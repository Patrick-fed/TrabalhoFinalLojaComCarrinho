import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CORES } from "../Constants/cores";
import { MENSAGENS_CATALOGO } from "../Constants/mensagensCatalogo";
import type { CategoriaDisponivel } from "../Types/catalogo";
import type { Categoria } from "../Types/types";
import { MensagemErro } from "./MensagemErro";

type SeletorCategoriasProps = {
  categorias: CategoriaDisponivel[];
  selecionada: Categoria | null;
  aoSelecionar: (categoria: Categoria | null) => void;
  carregando?: boolean;
  erro?: string | null;
  aoTentarNovamente?: () => void;
};

type ChipCategoriaProps = {
  titulo: string;
  selecionado: boolean;
  desabilitado: boolean;
  aoPressionar: () => void;
};

function ChipCategoria({
  titulo,
  selecionado,
  desabilitado,
  aoPressionar,
}: ChipCategoriaProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${titulo}`}
      accessibilityState={{ disabled: desabilitado, selected: selecionado }}
      disabled={desabilitado}
      onPress={aoPressionar}
      style={({ pressed }) => [
        estilos.chip,
        selecionado ? estilos.chipSelecionado : null,
        desabilitado ? estilos.chipDesabilitado : null,
        pressed && !desabilitado ? estilos.chipPressionado : null,
      ]}
    >
      <Text
        style={[
          estilos.textoChip,
          selecionado ? estilos.textoChipSelecionado : null,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

export function SeletorCategorias({
  categorias,
  selecionada,
  aoSelecionar,
  carregando = false,
  erro = null,
  aoTentarNovamente,
}: SeletorCategoriasProps) {
  const semCategorias = categorias.length === 0;

  return (
    <View style={estilos.container}>
      <Text style={estilos.label}>Categorias</Text>

      {erro ? (
        <View style={estilos.areaErro}>
          <MensagemErro mensagem={erro} />
          {aoTentarNovamente ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: carregando, busy: carregando }}
              disabled={carregando}
              onPress={aoTentarNovamente}
              style={({ pressed }) => [
                estilos.botaoTentarNovamente,
                pressed && !carregando ? estilos.botaoPressionado : null,
              ]}
            >
              {carregando ? (
                <ActivityIndicator color={CORES.primaria} size="small" />
              ) : (
                <Text style={estilos.textoBotao}>
                  {MENSAGENS_CATALOGO.tentarNovamente}
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {carregando && semCategorias ? (
        <View style={estilos.carregando}>
          <ActivityIndicator color={CORES.primaria} size="small" />
          <Text style={estilos.textoCarregando}>Carregando categorias...</Text>
        </View>
      ) : null}

      {!carregando && semCategorias && !erro ? (
        <Text style={estilos.aviso}>{MENSAGENS_CATALOGO.semCategorias}</Text>
      ) : null}

      {!semCategorias ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.listaChips}
        >
          <ChipCategoria
            titulo="Todas"
            selecionado={selecionada === null}
            desabilitado={carregando}
            aoPressionar={() => aoSelecionar(null)}
          />

          {categorias.map((categoria) => (
            <ChipCategoria
              key={categoria.id}
              titulo={categoria.nome}
              selecionado={selecionada === categoria.id}
              desabilitado={carregando}
              aoPressionar={() => aoSelecionar(categoria.id)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  listaChips: {
    paddingRight: 8,
  },
  chip: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelecionado: {
    backgroundColor: CORES.primaria,
    borderColor: CORES.primaria,
  },
  chipDesabilitado: {
    opacity: 0.6,
  },
  chipPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoChip: {
    color: CORES.texto,
    fontSize: 13,
    fontWeight: "600",
  },
  textoChipSelecionado: {
    color: CORES.branco,
  },
  areaErro: {
    marginBottom: 8,
  },
  botaoTentarNovamente: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: CORES.primaria,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botaoPressionado: {
    backgroundColor: CORES.primariaClara,
  },
  textoBotao: {
    color: CORES.primaria,
    fontSize: 13,
    fontWeight: "700",
  },
  carregando: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 8,
  },
  textoCarregando: {
    color: CORES.textoSecundario,
    fontSize: 13,
    marginLeft: 8,
  },
  aviso: {
    color: CORES.textoSecundario,
    fontSize: 13,
    paddingVertical: 8,
  },
});
