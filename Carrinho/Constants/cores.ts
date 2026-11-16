export const CORES = {
  primaria: "#1E5AA8",
  primariaEscura: "#16437E",
  primariaClara: "#E8F0FB",
  fundo: "#F5F8FC",
  branco: "#FFFFFF",
  texto: "#1B2733",
  textoSecundario: "#5B6B7C",
  borda: "#CBD8E6",
  erro: "#C62828",
  erroFundo: "#FDECEA",
  sucesso: "#2E7D32",
} as const;

export const CORES_ESCUROS: Paleta = {
  primaria: "#3D7DD8",
  primariaEscura: "#2A5CA8",
  primariaClara: "#1A2A3F",
  fundo: "#0E141B",
  branco: "#171F29",
  texto: "#E9EEF4",
  textoSecundario: "#9CABBA",
  borda: "#2B3644",
  erro: "#EF5350",
  erroFundo: "#3A1D1D",
  sucesso: "#66BB6A",
};

export type Paleta = {
  primaria: string;
  primariaEscura: string;
  primariaClara: string;
  fundo: string;
  branco: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  erro: string;
  erroFundo: string;
  sucesso: string;
};
