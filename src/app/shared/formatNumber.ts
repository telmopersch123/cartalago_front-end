export class FormatNumber {
  /**
   * Formata o valor (em centavos ou número direto) para moeda BRL
   * Ex: 1050 -> "R$ 10,50"
   */
  static formatNumber(value: number | string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // se for string, tira tudo que não é número
    const numeric = String(value).replace(/\D/g, '');
    const numberValue = Number(numeric) / 100;

    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Converte string formatada ("R$ 10,50") para inteiro em centavos
   * Ex: "R$ 10,50" -> 1050
   */
  static parsePrice(precoFormatado: string): number {
    if (!precoFormatado) return 0;

    let preco = precoFormatado
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.');

    return Math.round(parseFloat(preco) * 100); // retorna em CENTAVOS
  }
}
