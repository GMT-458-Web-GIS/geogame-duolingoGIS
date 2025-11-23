export const countryData = {
  header2: { // Europe
    name: 'Europe',
    countries: [
      { name: 'France', code: 'FR', continent: 'header2' },
      { name: 'Germany', code: 'DE', continent: 'header2' },
      { name: 'Italy', code: 'IT', continent: 'header2' },
      { name: 'Spain', code: 'ES', continent: 'header2' },
      { name: 'Poland', code: 'PL', continent: 'header2' },
      { name: 'Netherlands', code: 'NL', continent: 'header2' },
      { name: 'Belgium', code: 'BE', continent: 'header2' },
      { name: 'Switzerland', code: 'CH', continent: 'header2' },
      { name: 'Austria', code: 'AT', continent: 'header2' },
      { name: 'Czech Republic', code: 'CZ', continent: 'header2' },
      { name: 'Hungary', code: 'HU', continent: 'header2' },
      { name: 'Romania', code: 'RO', continent: 'header2' },
      { name: 'Portugal', code: 'PT', continent: 'header2' },
      { name: 'Greece', code: 'GR', continent: 'header2' },
      { name: 'Sweden', code: 'SE', continent: 'header2' },
      { name: 'Norway', code: 'NO', continent: 'header2' },
      { name: 'Denmark', code: 'DK', continent: 'header2' },
      { name: 'Finland', code: 'FI', continent: 'header2' },
      { name: 'Ireland', code: 'IE', continent: 'header2' },
      { name: 'United Kingdom', code: 'GB', continent: 'header2' },
    ]
  },
  header1: { // Americas
    name: 'Americas',
    countries: [
      { name: 'United States', code: 'US', continent: 'header1' },
      { name: 'Canada', code: 'CA', continent: 'header1' },
      { name: 'Mexico', code: 'MX', continent: 'header1' },
      { name: 'Brazil', code: 'BR', continent: 'header1' },
      { name: 'Argentina', code: 'AR', continent: 'header1' },
      { name: 'Colombia', code: 'CO', continent: 'header1' },
      { name: 'Peru', code: 'PE', continent: 'header1' },
      { name: 'Chile', code: 'CL', continent: 'header1' },
      { name: 'Venezuela', code: 'VE', continent: 'header1' },
      { name: 'Ecuador', code: 'EC', continent: 'header1' },
      { name: 'Bolivia', code: 'BO', continent: 'header1' },
      { name: 'Paraguay', code: 'PY', continent: 'header1' },
      { name: 'Uruguay', code: 'UY', continent: 'header1' },
      { name: 'Jamaica', code: 'JM', continent: 'header1' },
      { name: 'Cuba', code: 'CU', continent: 'header1' },
      { name: 'Costa Rica', code: 'CR', continent: 'header1' },
      { name: 'Panama', code: 'PA', continent: 'header1' },
    ]
  },
  header: { // Asia
    name: 'Asia',
    countries: [
      { name: 'China', code: 'CN', continent: 'header' },
      { name: 'India', code: 'IN', continent: 'header' },
      { name: 'Japan', code: 'JP', continent: 'header' },
      { name: 'South Korea', code: 'KR', continent: 'header' },
      { name: 'Indonesia', code: 'ID', continent: 'header' },
      { name: 'Thailand', code: 'TH', continent: 'header' },
      { name: 'Vietnam', code: 'VN', continent: 'header' },
      { name: 'Philippines', code: 'PH', continent: 'header' },
      { name: 'Malaysia', code: 'MY', continent: 'header' },
      { name: 'Singapore', code: 'SG', continent: 'header' },
      { name: 'Pakistan', code: 'PK', continent: 'header' },
      { name: 'Bangladesh', code: 'BD', continent: 'header' },
      { name: 'Sri Lanka', code: 'LK', continent: 'header' },
      { name: 'Iran', code: 'IR', continent: 'header' },
      { name: 'Iraq', code: 'IQ', continent: 'header' },
      { name: 'Saudi Arabia', code: 'SA', continent: 'header' },
      { name: 'United Arab Emirates', code: 'AE', continent: 'header' },
      { name: 'Israel', code: 'IL', continent: 'header' },
      { name: 'Turkey', code: 'TR', continent: 'header' },
      { name: 'Kazakhstan', code: 'KZ', continent: 'header' },
    ]
  }
};

// Create a country name to continent mapping for faster lookup
export const createCountryToContinentMap = () => {
  const map = {};
  Object.entries(countryData).forEach(([continent, data]) => {
    data.countries.forEach(country => {
      map[country.name.toLowerCase()] = continent;
    });
  });
  return map;
};

export const getFlagUrl = (countryCode, countryName) => {
  // Using 4x3 round SVG flags - format: {code}-{Name}-4x3.svg
  const formattedName = countryName.replace(/\s+/g, '-');
  const base = import.meta.env.BASE_URL || '/';
  // Remove leading slash if base already has it
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const path = `databases/flags/4x3/round/SVG/${countryCode.toLowerCase()}-${formattedName}-4x3.svg`;
  return `${cleanBase}${path}`;
};

export const getRandomCountry = (continent) => {
  const countries = countryData[continent]?.countries || [];
  return countries[Math.floor(Math.random() * countries.length)];
};

export const getRandomCountries = (continent, count = 4, exclude = null) => {
  const countries = countryData[continent]?.countries || [];
  const selected = [];
  const availableCountries = exclude 
    ? countries.filter(c => c.code !== exclude.code)
    : countries;
  
  while (selected.length < count && availableCountries.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    selected.push(availableCountries[randomIndex]);
    availableCountries.splice(randomIndex, 1);
  }
  
  return selected;
};
