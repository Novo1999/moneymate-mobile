// Symbols for the currencies MoneyMate supports. Falls back to the ISO code.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', JPY: '¥', GBP: '£', AUD: 'A$', CAD: 'C$', CHF: 'CHF', CNY: '¥',
  SEK: 'kr', NZD: 'NZ$', NOK: 'kr', DKK: 'kr', SGD: 'S$', HKD: 'HK$', KRW: '₩', INR: '₹',
  BRL: 'R$', RUB: '₽', MXN: '$', ZAR: 'R', SAR: '﷼', AED: 'د.إ', ILS: '₪', TRY: '₺',
  EGP: '£', NGN: '₦', KES: 'KSh', THB: '฿', MYR: 'RM', PHP: '₱', IDR: 'Rp', VND: '₫',
  PKR: '₨', BDT: '৳', LKR: '₨', NPR: '₨', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', UAH: '₴',
}

export function currencySymbol(code?: string): string {
  if (!code) return '$'
  return CURRENCY_SYMBOLS[code] ?? code
}

// Supported currency codes (subset surfaced in the picker — full list still accepted).
export const POPULAR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BDT',
  'SGD', 'AED', 'SAR', 'TRY', 'BRL', 'ZAR', 'PKR', 'MYR', 'THB', 'PHP',
] as const
