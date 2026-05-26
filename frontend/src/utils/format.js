export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

export const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const formatEndMonth = (val) => {
  if (!val) return null;
  const match = val.match(/^(\d{4})-(\d{2})$/);
  if (!match) return val;
  const m = parseInt(match[2], 10);
  return `${MONTHS_SHORT[m - 1]}/${match[1]}`;
};
