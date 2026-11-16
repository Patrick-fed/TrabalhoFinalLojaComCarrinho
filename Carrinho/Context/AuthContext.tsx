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
  restaurarSessao,
  sair as sairDoServico,
} from "../Service/auth";
import { assinarExpiracao, limparSessao } from "../Service/sessao";
import type { Conta, Credenciais, DadosCadastro } from "../Types/auth";

type AuthContextValue = {
  usuario: Conta | null;
  carregando: boolean;
  entrar: (credenciais: Credenciais) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
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

    void (async () => {
      const conta = await restaurarSessao();

      if (ativo) {
        setUsuario(conta);
        setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    return assinarExpiracao(() => {
      setUsuario(null);
      void limparSessao();
    });
  }, []);

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const conta = await entrarNoServico(credenciais);
    setUsuario(conta);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro) => {
    const conta = await cadastrarUsuario(dados);
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
