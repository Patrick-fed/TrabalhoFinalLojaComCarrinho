import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Paleta } from "../Constants/cores";
import { MENSAGENS_CATALOGO } from "../Constants/mensagensCatalogo";
import { useTema } from "../Context/TemaContext";
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
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

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
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
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
                <ActivityIndicator color={cores.primaria} size="small" />
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
          <ActivityIndicator color={cores.primaria} size="small" />
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

const criarEstilos = (cores: Paleta) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  listaChips: {
    paddingRight: 8,
  },
  chip: {
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelecionado: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  chipDesabilitado: {
    opacity: 0.6,
  },
  chipPressionado: {
    backgroundColor: cores.primariaClara,
  },
  textoChip: {
    color: cores.texto,
    fontSize: 13,
    fontWeight: "600",
  },
  textoChipSelecionado: {
    color: cores.branco,
  },
  areaErro: {
    marginBottom: 8,
  },
  botaoTentarNovamente: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: cores.primaria,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaClara,
  },
  textoBotao: {
    color: cores.primaria,
    fontSize: 13,
    fontWeight: "700",
  },
  carregando: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 8,
  },
  textoCarregando: {
    color: cores.textoSecundario,
    fontSize: 13,
    marginLeft: 8,
  },
  aviso: {
    color: cores.textoSecundario,
    fontSize: 13,
    paddingVertical: 8,
  },
});
