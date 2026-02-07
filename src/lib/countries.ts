// Country list for protocol registration
export interface Country {
  value: string;
  label: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { value: 'us', label: 'United States', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'sg', label: 'Singapore', flag: '🇸🇬' },
  { value: 'de', label: 'Germany', flag: '🇩🇪' },
  { value: 'ch', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'ae', label: 'UAE', flag: '🇦🇪' },
  { value: 'hk', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'jp', label: 'Japan', flag: '🇯🇵' },
  { value: 'kr', label: 'South Korea', flag: '🇰🇷' },
  { value: 'in', label: 'India', flag: '🇮🇳' },
  { value: 'br', label: 'Brazil', flag: '🇧🇷' },
  { value: 'ng', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'ca', label: 'Canada', flag: '🇨🇦' },
  { value: 'au', label: 'Australia', flag: '🇦🇺' },
  { value: 'fr', label: 'France', flag: '🇫🇷' },
  { value: 'nl', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'pt', label: 'Portugal', flag: '🇵🇹' },
  { value: 'es', label: 'Spain', flag: '🇪🇸' },
  { value: 'it', label: 'Italy', flag: '🇮🇹' },
  { value: 'pl', label: 'Poland', flag: '🇵🇱' },
  { value: 'other', label: 'Other', flag: '🌍' },
];

export const getCountryByValue = (value: string | null | undefined): Country | undefined => {
  if (!value) return undefined;
  return COUNTRIES.find(c => c.value === value);
};

export const getCountryLabel = (value: string | null | undefined): string => {
  const country = getCountryByValue(value);
  return country ? `${country.flag} ${country.label}` : '';
};

export const getCountryFlag = (value: string | null | undefined): string => {
  const country = getCountryByValue(value);
  return country?.flag || '🌍';
};
