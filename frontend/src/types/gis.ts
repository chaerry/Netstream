export interface RegionalCorridor {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  center: [number, number]; // [lat, lon]
  zoom: number;
  badge?: string;
  description?: string;
  isCustom?: boolean;
}

export const DEFAULT_REGIONAL_CORRIDORS: RegionalCorridor[] = [
  // Indonesia Corridors
  {
    id: 'id-java',
    name: 'Java National Backbone',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-6.8, 109.5],
    zoom: 7,
    badge: 'National Trunk',
    description: 'Trans-Java 789km DWDM Optical Trunk Corridor'
  },
  {
    id: 'id-jakarta',
    name: 'Jakarta Metro & SCBD',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-6.22, 106.83],
    zoom: 14,
    badge: 'Metro Duct',
    description: 'High-density underground duct rings and data center feeds'
  },
  {
    id: 'id-bandung',
    name: 'Bandung Transit Hub',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-6.9175, 107.6191],
    zoom: 13,
    badge: 'Regional Transit',
    description: 'Highland regional aggregation and POP facilities'
  },
  {
    id: 'id-surabaya',
    name: 'Surabaya Metro Gateway',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-7.2575, 112.7521],
    zoom: 13,
    badge: 'Metro Aggregation',
    description: 'Eastern Java core gateway and submarine cable landing'
  },
  {
    id: 'id-sumatera',
    name: 'Trans-Sumatera Corridor',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-0.5, 101.5],
    zoom: 6,
    badge: 'Island Trunk',
    description: 'Banda Aceh – Medan – Pekanbaru – Palembang – Bakauheni'
  },
  {
    id: 'id-sulawesi',
    name: 'Trans-Sulawesi Backbone',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-2.5, 120.5],
    zoom: 6,
    badge: 'Island Trunk',
    description: 'Makassar – Mamuju – Palu – Gorontalo – Manado'
  },
  {
    id: 'id-kalimantan',
    name: 'IKN Nusantara & Balikpapan',
    country: 'Indonesia',
    countryCode: 'ID',
    center: [-1.0, 116.8],
    zoom: 10,
    badge: 'Smart Capital',
    description: 'New Capital City core ring and Kariangau landing terminal'
  },

  // Singapore & Malaysia Corridors
  {
    id: 'sg-metro',
    name: 'Singapore Metro & CLS',
    country: 'Singapore',
    countryCode: 'SG',
    center: [1.3521, 103.8198],
    zoom: 12,
    badge: 'Subsea Landing',
    description: 'Tuas & Changi Cable Landing Stations and nationwide fiber grid'
  },
  {
    id: 'my-kl',
    name: 'Kuala Lumpur - Cyberjaya',
    country: 'Malaysia',
    countryCode: 'MY',
    center: [3.139, 101.6869],
    zoom: 12,
    badge: 'Metro Core',
    description: 'Multimedia Super Corridor (MSC) datacenter backbones'
  },

  // United States Corridors
  {
    id: 'us-northeast',
    name: 'US Northeast Optical Corridor',
    country: 'United States',
    countryCode: 'US',
    center: [40.0, -74.5],
    zoom: 7,
    badge: 'Interstate Fiber',
    description: 'Boston – New York – Philadelphia – Washington DC'
  },
  {
    id: 'us-west',
    name: 'US West Coast (Bay Area)',
    country: 'United States',
    countryCode: 'US',
    center: [37.7749, -122.4194],
    zoom: 10,
    badge: 'Metro Silicon',
    description: 'San Francisco, Silicon Valley, and trans-Pacific subsea landings'
  },

  // Europe Corridors
  {
    id: 'eu-london',
    name: 'London Metro Optical Ring',
    country: 'United Kingdom',
    countryCode: 'GB',
    center: [51.5074, -0.1278],
    zoom: 11,
    badge: 'Metro Ring',
    description: 'Docklands, Slough, and City of London low-latency routes'
  },
  {
    id: 'eu-frankfurt',
    name: 'Frankfurt Interconnect Hub',
    country: 'Germany',
    countryCode: 'DE',
    center: [50.1109, 8.6821],
    zoom: 11,
    badge: 'Global IXP',
    description: 'DE-CIX European traffic exchange and datacenter ring'
  },

  // Asia-Pacific
  {
    id: 'jp-tokyo',
    name: 'Tokyo Metro Optical Network',
    country: 'Japan',
    countryCode: 'JP',
    center: [35.6762, 139.6503],
    zoom: 11,
    badge: 'High-Density Metro',
    description: 'Tokyo, Yokohama, and Chiba submarine cable stations'
  }
];
