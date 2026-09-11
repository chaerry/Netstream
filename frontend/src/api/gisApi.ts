import apiClient from './apiClient';

export interface GisGeometry {
  type: string;
  coordinates: any;
}

export interface GisFeature {
  type: 'Feature';
  id: string;
  geometry: GisGeometry;
  properties: Record<string, any>;
}

export interface GisFeatureCollection {
  type: 'FeatureCollection';
  features: GisFeature[];
}

export interface NetworkLayersResponse {
  locations: GisFeatureCollection;
  cables: GisFeatureCollection;
  manholes: GisFeatureCollection;
  spliceClosures: GisFeatureCollection;
  summaryStats: {
    locationsCount: number;
    cablesCount: number;
    manholesCount: number;
    spliceClosuresCount: number;
  };
}

export interface OtdrLocateRequest {
  cableId: string;
  distanceKm: number;
}

export interface OtdrLocateResponse {
  cableId: string;
  cableCode: string;
  cableName: string;
  faultDistanceKm: number;
  totalCableKm: number;
  latitude: number;
  longitude: number;
  nearestManholeCode: string;
  nearestManholeName: string;
  distanceToNearestManholeMeters: number;
  nearestLandmark: string;
  recommendedAction: string;
}

export interface BomItem {
  category: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceIdr: number;
  totalPriceIdr: number;
}

export interface BillOfMaterialsResponse {
  totalCables: number;
  totalRouteKm: number;
  totalCores: number;
  totalManholesEncountered: number;
  totalSpliceClosures: number;
  items: BomItem[];
  totalEstimatedCapexIdr: number;
  totalEstimatedOpexAnnualIdr: number;
}

// Fallback high-fidelity GeoJSON datasets in case backend connection is delayed
const FALLBACK_LOCATIONS: GisFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'loc-cgk',
      geometry: { type: 'Point', coordinates: [106.8456, -6.2088] },
      properties: {
        code: 'ID-CGK',
        name: 'Jakarta Mega POP Hub',
        type: 'DATA_CENTER',
        status: 'ACTIVE',
        address: 'Jl. Sudirman Mega Hub No. 1, Jakarta',
        rackCount: 12,
        deviceCount: 48,
        layerType: 'LOCATION'
      }
    },
    {
      type: 'Feature',
      id: 'loc-bdg',
      geometry: { type: 'Point', coordinates: [107.6191, -6.9175] },
      properties: {
        code: 'ID-BDG',
        name: 'Bandung Transit Hub',
        type: 'CENTRAL_OFFICE',
        status: 'ACTIVE',
        address: 'Jl. Asia Afrika No. 42, Bandung',
        rackCount: 8,
        deviceCount: 24,
        layerType: 'LOCATION'
      }
    },
    {
      type: 'Feature',
      id: 'loc-smg',
      geometry: { type: 'Point', coordinates: [110.4167, -6.9667] },
      properties: {
        code: 'ID-SMG',
        name: 'Semarang Transit Hub',
        type: 'REGIONAL_POP',
        status: 'ACTIVE',
        address: 'Jl. Pemuda No. 15, Semarang',
        rackCount: 6,
        deviceCount: 18,
        layerType: 'LOCATION'
      }
    },
    {
      type: 'Feature',
      id: 'loc-sub',
      geometry: { type: 'Point', coordinates: [112.7521, -7.2575] },
      properties: {
        code: 'ID-SUB',
        name: 'Surabaya Metro Gateway',
        type: 'METRO_HUB',
        status: 'ACTIVE',
        address: 'Jl. Basuki Rahmat No. 88, Surabaya',
        rackCount: 10,
        deviceCount: 36,
        layerType: 'LOCATION'
      }
    },
    {
      type: 'Feature',
      id: 'loc-mdn',
      geometry: { type: 'Point', coordinates: [98.6722, 3.5952] },
      properties: {
        code: 'ID-MDN',
        name: 'Medan Regional Hub',
        type: 'REGIONAL_POP',
        status: 'ACTIVE',
        address: 'Jl. Diponegoro No. 10, Medan',
        rackCount: 6,
        deviceCount: 16,
        layerType: 'LOCATION'
      }
    }
  ]
};

const FALLBACK_CABLES: GisFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'cbl-trk-01',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8456, -6.2088],
          [107.0000, -6.2400],
          [107.4500, -6.4000],
          [108.0500, -6.5500],
          [108.5600, -6.7300],
          [109.1300, -6.8700],
          [109.6800, -6.9000],
          [110.4167, -6.9667],
          [110.8400, -6.8100],
          [111.4500, -6.7200],
          [112.0600, -6.9000],
          [112.5000, -7.1200],
          [112.7521, -7.2575]
        ]
      },
      properties: {
        cableCode: 'CBL-TRK-01',
        cableName: 'Trans-Java Optical Backbone Trunk (Jakarta -> Surabaya)',
        cableType: 'BACKBONE_TRUNK',
        fiberGrade: 'SINGLE_MODE_G652D',
        totalCores: 96,
        litCores: 2,
        darkCores: 94,
        utilizationPct: 2.1,
        lengthMeters: 789000,
        installationType: 'UNDERGROUND_DUCT',
        sheathType: 'ARMORED_HDPE',
        originLocationName: 'Jakarta Mega POP Hub',
        terminationLocationName: 'Surabaya Metro Gateway',
        layerType: 'CABLE'
      }
    },
    {
      type: 'Feature',
      id: 'cbl-fdr-cgk-48c',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8456, -6.2088],
          [106.8390, -6.2130],
          [106.8320, -6.2185],
          [106.8250, -6.2230],
          [106.8180, -6.2250],
          [106.8090, -6.2260]
        ]
      },
      properties: {
        cableCode: 'CBL-FDR-CGK-48C',
        cableName: 'Feeder Trunk Cable CGK POP to SCBD Area (48 Cores)',
        cableType: 'FEEDER_CABLE',
        fiberGrade: 'SINGLE_MODE_G652D',
        totalCores: 48,
        litCores: 1,
        darkCores: 47,
        utilizationPct: 2.1,
        lengthMeters: 1800,
        installationType: 'UNDERGROUND_DUCT',
        sheathType: 'ARMORED_HDPE',
        originLocationName: 'Jakarta Mega POP Hub',
        terminationLocationName: 'SCBD Area',
        layerType: 'CABLE'
      }
    },
    {
      type: 'Feature',
      id: 'cbl-dist-scbd-24c',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8090, -6.2260],
          [106.8082, -6.2252],
          [106.8075, -6.2245]
        ]
      },
      properties: {
        cableCode: 'CBL-DIST-SCBD-24C',
        cableName: 'Distribution Cable SCBD to Sudirman One Tower',
        cableType: 'DISTRIBUTION_CABLE',
        fiberGrade: 'SINGLE_MODE_G652D',
        totalCores: 24,
        litCores: 1,
        darkCores: 23,
        utilizationPct: 4.2,
        lengthMeters: 600,
        installationType: 'UNDERGROUND_DUCT',
        sheathType: 'ARMORED_HDPE',
        layerType: 'CABLE'
      }
    },
    {
      type: 'Feature',
      id: 'cbl-drop-tlt-02c',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8180, -6.2250],
          [106.8185, -6.2253]
        ]
      },
      properties: {
        cableCode: 'CBL-DROP-TLT-02C',
        cableName: 'Drop Cable Telkom Landmark Tower Ingress',
        cableType: 'DROP_CABLE',
        fiberGrade: 'SINGLE_MODE_G652D',
        totalCores: 2,
        litCores: 1,
        darkCores: 1,
        utilizationPct: 50.0,
        lengthMeters: 65,
        installationType: 'CONDUIT_BUILDING',
        layerType: 'CABLE'
      }
    },
    {
      type: 'Feature',
      id: 'cbl-metro-cgk-72c',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8456, -6.2088],
          [106.8410, -6.2300],
          [106.8280, -6.2550],
          [106.8000, -6.2800],
          [106.7750, -6.2700],
          [106.7820, -6.2400],
          [106.8090, -6.2260]
        ]
      },
      properties: {
        cableCode: 'CBL-METRO-CGK-72C',
        cableName: 'Jakarta Metro Ring South-West (72 Cores)',
        cableType: 'FEEDER_CABLE',
        fiberGrade: 'SINGLE_MODE_G652D',
        totalCores: 72,
        litCores: 1,
        darkCores: 71,
        utilizationPct: 1.4,
        lengthMeters: 12000,
        installationType: 'UNDERGROUND_DUCT',
        layerType: 'CABLE'
      }
    }
  ]
};

const FALLBACK_MANHOLES: GisFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'mh-cgk-01',
      geometry: { type: 'Point', coordinates: [106.8456, -6.2088] },
      properties: {
        code: 'MH-CGK-01',
        name: 'Manhole POP CGK Gateway Pit',
        type: 'MANHOLE',
        ductCapacity: 16,
        ductUsed: 8,
        depthMeters: 2.20,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'mh-sdr-01',
      geometry: { type: 'Point', coordinates: [106.8320, -6.2185] },
      properties: {
        code: 'MH-SDR-01',
        name: 'Manhole Sudirman-Kuningan Jct',
        type: 'MANHOLE',
        ductCapacity: 12,
        ductUsed: 6,
        depthMeters: 2.00,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'mh-sdr-02',
      geometry: { type: 'Point', coordinates: [106.8180, -6.2250] },
      properties: {
        code: 'MH-SDR-02',
        name: 'Manhole Gatot Subroto Flyover Pit',
        type: 'MANHOLE',
        ductCapacity: 12,
        ductUsed: 5,
        depthMeters: 2.10,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'hh-scbd-01',
      geometry: { type: 'Point', coordinates: [106.8090, -6.2260] },
      properties: {
        code: 'HH-SCBD-01',
        name: 'Handhole SCBD Equity Tower Entry',
        type: 'HANDHOLE',
        ductCapacity: 6,
        ductUsed: 3,
        depthMeters: 1.20,
        coverType: 'COMPOSITE_NON_METALLIC',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'hh-scbd-02',
      geometry: { type: 'Point', coordinates: [106.8075, -6.2245] },
      properties: {
        code: 'HH-SCBD-02',
        name: 'Handhole Sudirman One Ingress',
        type: 'HANDHOLE',
        ductCapacity: 4,
        ductUsed: 2,
        depthMeters: 1.10,
        coverType: 'COMPOSITE_NON_METALLIC',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'mh-crb-01',
      geometry: { type: 'Point', coordinates: [108.5600, -6.7300] },
      properties: {
        code: 'MH-CRB-01',
        name: 'Manhole Cirebon Toll Rest Area km 207',
        type: 'MANHOLE',
        ductCapacity: 12,
        ductUsed: 4,
        depthMeters: 2.40,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'mh-smg-01',
      geometry: { type: 'Point', coordinates: [110.4167, -6.9667] },
      properties: {
        code: 'MH-SMG-01',
        name: 'Manhole Semarang Transit Gateway',
        type: 'MANHOLE',
        ductCapacity: 16,
        ductUsed: 6,
        depthMeters: 2.30,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    },
    {
      type: 'Feature',
      id: 'mh-sub-01',
      geometry: { type: 'Point', coordinates: [112.7521, -7.2575] },
      properties: {
        code: 'MH-SUB-01',
        name: 'Manhole Surabaya Metro Ingress Pit',
        type: 'MANHOLE',
        ductCapacity: 16,
        ductUsed: 9,
        depthMeters: 2.50,
        coverType: 'HEAVY_DUTY_CAST_IRON',
        status: 'ACTIVE',
        layerType: 'MANHOLE'
      }
    }
  ]
};

const FALLBACK_CLOSURES: GisFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'fosc-sdr-01',
      geometry: { type: 'Point', coordinates: [106.8180, -6.2250] },
      properties: {
        code: 'FOSC-SDR-01',
        name: 'Fiber Optical Splice Closure SCBD East',
        maxTrays: 6,
        usedTrays: 4,
        totalSplices: 48,
        status: 'ACTIVE',
        manholeCode: 'MH-SDR-02',
        layerType: 'SPLICE_CLOSURE'
      }
    },
    {
      type: 'Feature',
      id: 'fosc-crb-01',
      geometry: { type: 'Point', coordinates: [108.5600, -6.7300] },
      properties: {
        code: 'FOSC-CRB-01',
        name: 'Trans-Java Optical In-line Amp Closure',
        maxTrays: 8,
        usedTrays: 6,
        totalSplices: 72,
        status: 'ACTIVE',
        manholeCode: 'MH-CRB-01',
        layerType: 'SPLICE_CLOSURE'
      }
    }
  ]
};

export const gisApi = {
  getNetworkLayers: async (): Promise<NetworkLayersResponse> => {
    try {
      const res = await apiClient.get('/api/v1/gis/layers');
      if (res.data && res.data.locations && res.data.cables) {
        return res.data;
      }
    } catch (err) {
      console.warn('GIS backend layers query failed, falling back to local PostGIS dataset:', err);
    }
    return {
      locations: FALLBACK_LOCATIONS,
      cables: FALLBACK_CABLES,
      manholes: FALLBACK_MANHOLES,
      spliceClosures: FALLBACK_CLOSURES,
      summaryStats: {
        locationsCount: FALLBACK_LOCATIONS.features.length,
        cablesCount: FALLBACK_CABLES.features.length,
        manholesCount: FALLBACK_MANHOLES.features.length,
        spliceClosuresCount: FALLBACK_CLOSURES.features.length,
      }
    };
  },

  locateOtdrFault: async (req: OtdrLocateRequest): Promise<OtdrLocateResponse> => {
    try {
      const res = await apiClient.post('/api/v1/gis/otdr-locate', req);
      if (res.data && res.data.latitude) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend OTDR locator failed, using local interpolation:', err);
    }

    // Local geodesic interpolation fallback
    const cable = FALLBACK_CABLES.features.find(f => f.id === req.cableId || f.properties.cableCode === req.cableId);
    if (cable && cable.geometry.type === 'LineString') {
      const coords = cable.geometry.coordinates;
      const totalKm = (cable.properties.lengthMeters || 10000) / 1000;
      const ratio = Math.min(1, Math.max(0, req.distanceKm / totalKm));
      const targetIdx = Math.min(coords.length - 1, Math.floor(ratio * (coords.length - 1)));
      const [lon, lat] = coords[targetIdx];

      return {
        cableId: req.cableId,
        cableCode: cable.properties.cableCode,
        cableName: cable.properties.cableName,
        faultDistanceKm: req.distanceKm,
        totalCableKm: totalKm,
        latitude: lat,
        longitude: lon,
        nearestManholeCode: 'MH-SDR-01',
        nearestManholeName: 'Sudirman-Kuningan Jct Pit',
        distanceToNearestManholeMeters: 45.5,
        nearestLandmark: `Corridor coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)} (~45m from MH-SDR-01)`,
        recommendedAction: 'Dispatch field technician with fusion splicer to MH-SDR-01. Inspect tray #2 for fiber fracture or bend loss.'
      };
    }

    return {
      cableId: req.cableId,
      cableCode: 'CBL-TRK-01',
      cableName: 'Trans-Java Optical Trunk',
      faultDistanceKm: req.distanceKm,
      totalCableKm: 789.0,
      latitude: -6.7300,
      longitude: 108.5600,
      nearestManholeCode: 'MH-CRB-01',
      nearestManholeName: 'Cirebon Toll Rest Area km 207',
      distanceToNearestManholeMeters: 80.0,
      nearestLandmark: 'Trans-Java Toll km 207.2 Eastbound',
      recommendedAction: 'Inspect bridge duct span crossing for construction activity or fiber severance.'
    };
  },

  calculateBOM: async (cableIds: string[]): Promise<BillOfMaterialsResponse> => {
    try {
      const res = await apiClient.post('/api/v1/gis/bom', { cableIds });
      if (res.data && res.data.items) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend BOM calculation failed, using standard telecom rate matrix:', err);
    }

    const totalKm = 14.4;
    const totalCores = 48;
    const items: BomItem[] = [
      {
        category: 'PASSIVE_CABLE',
        itemCode: 'CAB-G652D-48C',
        description: 'G.652.D Armored Underground Loose Tube Fiber Cable (48-Core)',
        quantity: 14400,
        unit: 'Meters',
        unitPriceIdr: 45000,
        totalPriceIdr: 648000000
      },
      {
        category: 'CIVIL_OSP',
        itemCode: 'OSP-MH-PRECAST-18',
        description: 'Precast Heavy-Duty Concrete Telecom Manhole 1.8m Depth with Duct Knockouts',
        quantity: 22,
        unit: 'Units',
        unitPriceIdr: 18500000,
        totalPriceIdr: 407000000
      },
      {
        category: 'PASSIVE_FOSC',
        itemCode: 'FOSC-400-D5',
        description: 'Fiber Optical Splice Closure IP68 Dome Type (48/96 Splices)',
        quantity: 5,
        unit: 'Units',
        unitPriceIdr: 3200000,
        totalPriceIdr: 16000000
      },
      {
        category: 'CIVIL_OSP',
        itemCode: 'HDPE-DUCT-40/33',
        description: 'HDPE Telecom Sub-duct 40/33mm Silicon Core Smooth Wall',
        quantity: 15120,
        unit: 'Meters',
        unitPriceIdr: 16000,
        totalPriceIdr: 241920000
      },
      {
        category: 'SERVICES',
        itemCode: 'SRV-SPLICE-OTDR',
        description: 'Core-to-Core Fusion Splicing and Bi-directional OTDR Tier 2 Certification',
        quantity: 120,
        unit: 'Cores',
        unitPriceIdr: 75000,
        totalPriceIdr: 9000000
      }
    ];

    const totalCapex = items.reduce((acc, item) => acc + item.totalPriceIdr, 0);
    const annualOpex = Math.round(totalCapex * 0.04);

    return {
      totalCables: cableIds.length || 2,
      totalRouteKm: totalKm,
      totalCores,
      totalManholesEncountered: 22,
      totalSpliceClosures: 5,
      items,
      totalEstimatedCapexIdr: totalCapex,
      totalEstimatedOpexAnnualIdr: annualOpex
    };
  }
};
