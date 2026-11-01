import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { CORES } from "../Constants/cores";

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
        placeholderTextColor={CORES.textoSecundario}
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

const estilos = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderRadius: 8,
    borderWidth: 1,
    color: CORES.texto,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputComErro: {
    borderColor: CORES.erro,
  },
  inputDesabilitado: {
    backgroundColor: CORES.primariaClara,
  },
  erro: {
    color: CORES.erro,
    fontSize: 13,
    marginTop: 4,
  },
});
