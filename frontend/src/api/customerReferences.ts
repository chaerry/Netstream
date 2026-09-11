export interface CustomerReference {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'Banking & Financial Services' | 'Telecommunication & Carriers' | 'Government & Public Sector' | 'Enterprise & Conglomerates' | 'Digital & Tech';
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
}

export const CUSTOMER_REFERENCES: CustomerReference[] = [
  // Banking & Financial Services
  {
    id: 'cust-bmri',
    code: 'CUST-BMRI-001',
    name: 'PT Bank Mandiri (Persero) Tbk',
    shortName: 'Bank Mandiri',
    category: 'Banking & Financial Services',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-bbca',
    code: 'CUST-BBCA-002',
    name: 'PT Bank Central Asia (BCA) Tbk',
    shortName: 'Bank BCA',
    category: 'Banking & Financial Services',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-bbri',
    code: 'CUST-BBRI-003',
    name: 'PT Bank Rakyat Indonesia (BRI) Tbk',
    shortName: 'Bank BRI',
    category: 'Banking & Financial Services',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-bbni',
    code: 'CUST-BBNI-004',
    name: 'PT Bank Negara Indonesia (BNI) Tbk',
    shortName: 'Bank BNI',
    category: 'Banking & Financial Services',
    tier: 'GOLD',
  },

  // Telecommunication & Carriers
  {
    id: 'cust-tsel',
    code: 'CUST-TSEL-005',
    name: 'PT Telkomsel Indonesia',
    shortName: 'Telkomsel',
    category: 'Telecommunication & Carriers',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-isat',
    code: 'CUST-ISAT-006',
    name: 'PT Indosat Ooredoo Hutchison Tbk',
    shortName: 'Indosat Ooredoo',
    category: 'Telecommunication & Carriers',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-excl',
    code: 'CUST-EXCL-007',
    name: 'PT XL Axiata Tbk',
    shortName: 'XL Axiata',
    category: 'Telecommunication & Carriers',
    tier: 'GOLD',
  },

  // Government & Public Sector
  {
    id: 'cust-kominfo',
    code: 'CUST-KMIN-008',
    name: 'Ministry of Communication & Informatics (KOMINFO)',
    shortName: 'KOMINFO',
    category: 'Government & Public Sector',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-bki',
    code: 'CUST-BKIN-009',
    name: 'Bank Indonesia (Central Bank)',
    shortName: 'Bank Indonesia',
    category: 'Government & Public Sector',
    tier: 'PLATINUM',
  },

  // Enterprise & Conglomerates
  {
    id: 'cust-pertamina',
    code: 'CUST-PERT-010',
    name: 'PT Pertamina (Persero)',
    shortName: 'Pertamina',
    category: 'Enterprise & Conglomerates',
    tier: 'PLATINUM',
  },
  {
    id: 'cust-astra',
    code: 'CUST-ASII-011',
    name: 'PT Astra International Tbk',
    shortName: 'Astra International',
    category: 'Enterprise & Conglomerates',
    tier: 'GOLD',
  },
  {
    id: 'cust-goto',
    code: 'CUST-GOTO-012',
    name: 'PT GoTo Gojek Tokopedia Tbk',
    shortName: 'GoTo Group',
    category: 'Digital & Tech',
    tier: 'GOLD',
  },
];
