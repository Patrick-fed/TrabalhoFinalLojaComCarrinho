function agruparMilhares(valor: number): string {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatarSemIntl(centavos: number): string {
  const valor = Number.isFinite(centavos) ? Math.round(centavos) : 0;
  const sinal = valor < 0 ? "-" : "";
  const absoluto = Math.abs(valor);
  const reais = Math.floor(absoluto / 100);
  const resto = absoluto % 100;

  return `${sinal}R$ ${agruparMilhares(reais)},${String(resto).padStart(2, "0")}`;
}

export function formatarPrecoCentavos(centavos: number): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(centavos / 100);
  } catch {
    return formatarSemIntl(centavos);
  }
}
