import type { FirebaseOptions } from "firebase/app";

function obterVariavel(nome: string): string {
  const valor = process.env[nome];

  if (!valor || valor.trim().length === 0) {
    throw new Error(
      `Configuração do Firebase ausente: ${nome}. Crie o arquivo Carrinho/.env a partir de Carrinho/.env.example.`
    );
  }

  return valor;
}

export const firebaseConfig: FirebaseOptions = {
  apiKey: obterVariavel("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: obterVariavel("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: obterVariavel("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: obterVariavel("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: obterVariavel("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: obterVariavel("EXPO_PUBLIC_FIREBASE_APP_ID"),
};
