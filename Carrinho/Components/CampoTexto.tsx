import { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import type { Paleta } from "../Constants/cores";
import { useTema } from "../Context/TemaContext";

type CampoTextoProps = {
  label: string;
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string;
  placeholder?: string;
  seguro?: boolean;
  tipoTeclado?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  returnKeyType?: TextInputProps["returnKeyType"];
  aoEnviar?: () => void;
  editavel?: boolean;
};

export function CampoTexto({
  label,
  valor,
  aoMudar,
  erro,
  placeholder,
  seguro = false,
  tipoTeclado,
  autoCapitalize = "none",
  autoComplete,
  returnKeyType,
  aoEnviar,
  editavel = true,
}: CampoTextoProps) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View style={estilos.container}>
      <Text style={estilos.label}>{label}</Text>
      <TextInput
        style={[
          estilos.input,
          erro ? estilos.inputComErro : null,
          !editavel ? estilos.inputDesabilitado : null,
        ]}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        secureTextEntry={seguro}
        keyboardType={tipoTeclado}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        autoComplete={autoComplete}
        returnKeyType={returnKeyType}
        onSubmitEditing={aoEnviar}
        editable={editavel}
        accessibilityLabel={label}
      />
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
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
    marginBottom: 6,
  },
  input: {
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderRadius: 8,
    borderWidth: 1,
    color: cores.texto,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputComErro: {
    borderColor: cores.erro,
  },
  inputDesabilitado: {
    backgroundColor: cores.primariaClara,
  },
  erro: {
    color: cores.erro,
    fontSize: 13,
    marginTop: 4,
  },
});
