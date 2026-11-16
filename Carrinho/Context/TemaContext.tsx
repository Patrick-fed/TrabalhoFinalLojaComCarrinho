import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { CORES, CORES_ESCUROS } from "../Constants/cores";
import type { Paleta } from "../Constants/cores";
import type { PreferenciaTema, Tema } from "../Types/tema";

const CHAVE_PREFERENCIA_TEMA = "@carrinho/preferencia-tema";

const PROXIMA_PREFERENCIA: Record<PreferenciaTema, PreferenciaTema> = {
  sistema: "claro",
  claro: "escuro",
  escuro: "sistema",
};

type TemaContextValue = {
  preferencia: PreferenciaTema;
  tema: Tema;
  cores: Paleta;
  alternarPreferencia: () => void;
};

const TemaContext = createContext<TemaContextValue | undefined>(undefined);

function ehPreferenciaValida(valor: unknown): valor is PreferenciaTema {
  return valor === "sistema" || valor === "claro" || valor === "escuro";
}

type TemaProviderProps = {
  children: ReactNode;
};

export function TemaProvider({ children }: TemaProviderProps) {
  const esquemaDoSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>("sistema");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;

    void (async () => {
      try {
        const valorSalvo = await AsyncStorage.getItem(CHAVE_PREFERENCIA_TEMA);

        if (ativo && ehPreferenciaValida(valorSalvo)) {
          setPreferencia(valorSalvo);
        }
      } catch {
        // Falha ao ler a preferência: mantém o tema do aparelho.
      } finally {
        if (ativo) {
          setCarregado(true);
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!carregado) {
      return;
    }

    void AsyncStorage.setItem(CHAVE_PREFERENCIA_TEMA, preferencia).catch(
      () => undefined
    );
  }, [carregado, preferencia]);

  const tema: Tema = useMemo(() => {
    if (preferencia !== "sistema") {
      return preferencia;
    }

    return esquemaDoSistema === "dark" ? "escuro" : "claro";
  }, [preferencia, esquemaDoSistema]);

  const cores: Paleta = tema === "escuro" ? CORES_ESCUROS : CORES;

  const alternarPreferencia = useCallback(() => {
    setPreferencia((atual) => PROXIMA_PREFERENCIA[atual]);
  }, []);

  const valor = useMemo(
    () => ({ preferencia, tema, cores, alternarPreferencia }),
    [preferencia, tema, cores, alternarPreferencia]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaContextValue {
  const contexto = useContext(TemaContext);

  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de TemaProvider.");
  }

  return contexto;
}
