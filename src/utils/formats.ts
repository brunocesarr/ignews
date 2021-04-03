
interface FormatNumberPriceProps {
  locale?: string;
  currency?: string;
  value: number;
}

export const formatNumberPrice = ({
  locale = 'pt-br', 
  currency = 'BRL', 
  value
}: FormatNumberPriceProps) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}