import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  cadastrarUsuario,
  entrar as entrarNoServico,
  observarSessao,
  sair as sairDoServico,
} from "../Service/auth";
import type { Conta, Credenciais } from "../Types/auth";

type AuthContextValue = {
  usuario: Conta | null;
  carregando: boolean;
  entrar: (credenciais: Credenciais) => Promise<void>;
  cadastrar: (credenciais: Credenciais) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const cancelar = observarSessao((conta) => {
      if (!ativo) {
        return;
      }

      setUsuario(conta);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const conta = await entrarNoServico(credenciais);
    setUsuario(conta);
  }, []);

  const cadastrar = useCallback(async (credenciais: Credenciais) => {
    const conta = await cadastrarUsuario(credenciais);
    setUsuario(conta);
  }, []);

  const sair = useCallback(async () => {
    await sairDoServico();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, cadastrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return contexto;
}
