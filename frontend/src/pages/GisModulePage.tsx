import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  gisApi,
  GisFeature,
  NetworkLayersResponse,
  OtdrLocateResponse,
  BillOfMaterialsResponse
} from '../api/gisApi';
import { CableStrandMatrixModal } from '../components/inventory/CableStrandMatrixModal';
import { EditCableModal } from '../components/inventory/EditCableModal';
import { ManageCorridorsModal } from '../components/gis/ManageCorridorsModal';
import { RegionalCorridor, DEFAULT_REGIONAL_CORRIDORS } from '../types/gis';
import { inventoryApi } from '../api/inventoryApi';
import { OpticalCable } from '../types/inventory';
import {
  MapPin,
  Layers,
  Compass,
  Ruler,
  Activity,
  Calculator,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cable,
  Building2,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ExternalLink,
  X,
  Radio,
  Sparkles,
  Info,
  ChevronRight,
  ChevronDown,
  Crosshair,
  Server,
  Zap,
  Globe,
  Share2,
  Pencil,
  Search,
  Settings2,
  Navigation
} from 'lucide-react';

// Tile Provider Configurations
const TILE_LAYERS: Record<string, { name: string; url: string; attribution: string; subdomains?: string; className?: string }> = {
  dark: {
    name: 'Netstream Dark NOC (Clean & Free)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    className: 'leaflet-dark-tiles',
  },
  osm: {
    name: 'OpenStreetMap (Standard Telecom)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    name: 'ESRI World Imagery (Aerial Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri & Earthstar Geographics',
  },
  positron: {
    name: 'CartoDB Positron (High-Contrast Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
  }
};

// Color palettes for cable tiers
const CABLE_COLORS: Record<string, { stroke: string; glow: string; label: string }> = {
  BACKBONE_TRUNK: { stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', label: 'Backbone Trunk' },
  FEEDER_CABLE: { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', label: 'Feeder Cable' },
  DISTRIBUTION_CABLE: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', label: 'Distribution Line' },
  DROP_CABLE: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', label: 'FTTH Drop' }
};

export const GisModulePage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.TileLayer | null>(null);

  // Layer Group Refs
  const locationsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const cablesLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const manholesLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const closuresLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const measureLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const otdrBeaconLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const searchHighlightLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  // Data States
  const [layersData, setLayersData] = useState<NetworkLayersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTileKey, setActiveTileKey] = useState<string>('dark');

  // Dynamic Regional Corridors (Change-able & International)
  const [corridors, setCorridors] = useState<RegionalCorridor[]>(() => {
    try {
      const saved = localStorage.getItem('netstream_gis_corridors_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved corridors:', e);
    }
    return DEFAULT_REGIONAL_CORRIDORS;
  });
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('id-java');
  const [isCorridorsModalOpen, setIsCorridorsModalOpen] = useState<boolean>(false);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>([-6.8, 109.5]);
  const [currentMapZoom, setCurrentMapZoom] = useState<number>(7);

  // Spatial Omnisearch State
  const [omniSearchQuery, setOmniSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Layer Visibility
  const [visibleLayers, setVisibleLayers] = useState<{
    locations: boolean;
    cables: boolean;
    manholes: boolean;
    closures: boolean;
  }>({
    locations: true,
    cables: true,
    manholes: true,
    closures: true,
  });
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(true);

  // Selected Object Drawer State
  const [selectedFeature, setSelectedFeature] = useState<GisFeature | null>(null);

  // Inspect TIA-598 Strand Matrix Modal & Edit Cable Modal
  const [inspectingCable, setInspectingCable] = useState<OpticalCable | null>(null);
  const [editingCable, setEditingCable] = useState<OpticalCable | null>(null);

  // Tool: Distance Measurement
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measuredDistanceKm, setMeasuredDistanceKm] = useState<number>(0);

  // Tool: OTDR Cable Break Locator
  const [isOtdrOpen, setIsOtdrOpen] = useState<boolean>(false);
  const [otdrCableId, setOtdrCableId] = useState<string>('');
  const [otdrDistanceKm, setOtdrDistanceKm] = useState<string>('14.5');
  const [otdrResult, setOtdrResult] = useState<OtdrLocateResponse | null>(null);
  const [otdrLoading, setOtdrLoading] = useState<boolean>(false);

  // Tool: Bill of Materials (BOM) & Path Planner
  const [isBomOpen, setIsBomOpen] = useState<boolean>(false);
  const [bomData, setBomData] = useState<BillOfMaterialsResponse | null>(null);
  const [bomLoading, setBomLoading] = useState<boolean>(false);

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch GIS Layers from Backend (Hoisted for reuse on edit/refresh)
  const loadGisLayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gisApi.getNetworkLayers();
      setLayersData(data);
      if (data.cables && data.cables.features.length > 0) {
        setOtdrCableId(data.cables.features[0].id);
      }
    } catch (err) {
      console.error('Failed to load GIS network layers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGisLayers();
  }, [loadGisLayers]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at Java, Indonesia (Trans-Java Backbone) by default
    const map = L.map(mapContainerRef.current, {
      center: [-6.8, 109.5],
      zoom: 7,
      minZoom: 4,
      maxZoom: 19,
      zoomControl: false,
    });

    // Add Base Tile Layer
    const tileConf = TILE_LAYERS[activeTileKey];
    const tileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || 'abc',
      className: tileConf.className || '',
      maxZoom: 19,
    }).addTo(map);

    tileLayerGroupRef.current = tileLayer;

    // Add Layer Groups
    locationsLayerGroupRef.current.addTo(map);
    cablesLayerGroupRef.current.addTo(map);
    manholesLayerGroupRef.current.addTo(map);
    closuresLayerGroupRef.current.addTo(map);
    measureLayerGroupRef.current.addTo(map);
    otdrBeaconLayerRef.current.addTo(map);
    searchHighlightLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    // Track active map center and zoom for corridor capturing
    map.on('moveend', () => {
      const c = map.getCenter();
      setCurrentMapCenter([c.lat, c.lng]);
      setCurrentMapZoom(map.getZoom());
    });

    // Right-click context menu handler
    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      setContextMenu({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    // Map click handler (for measurement tool and dismiss context menu)
    map.on('click', (e: L.LeafletMouseEvent) => {
      setContextMenu(null);
      setIsSearchFocused(false);
      if (isMeasuring) {
        setMeasurePoints(prev => {
          const updated = [...prev, e.latlng];
          // Recalculate distance
          let dist = 0;
          for (let i = 1; i < updated.length; i++) {
            dist += updated[i - 1].distanceTo(updated[i]);
          }
          setMeasuredDistanceKm(dist / 1000);
          return updated;
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Switcher
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerGroupRef.current) return;
    const tileConf = TILE_LAYERS[activeTileKey];
    mapInstanceRef.current.removeLayer(tileLayerGroupRef.current);
    const newTileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || 'abc',
      className: tileConf.className || '',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    tileLayerGroupRef.current = newTileLayer;
  }, [activeTileKey]);

  // Render Network GeoJSON Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !layersData) return;

    // 1. Render Locations / Sites
    locationsLayerGroupRef.current.clearLayers();
    if (visibleLayers.locations && layersData.locations) {
      layersData.locations.features.forEach(feat => {
        if (feat.geometry.type === 'Point') {
          const [lon, lat] = feat.geometry.coordinates;
          const p = feat.properties;

          const isCenter = p.code === 'ID-CGK' || p.code === 'ID-SUB';
          const iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="absolute w-7 h-7 rounded-full ${isCenter ? 'bg-cyan-500/30 animate-ping' : 'bg-blue-500/20'}"></div>
              <div class="w-6 h-6 rounded-xl flex items-center justify-center ${isCenter ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400 text-white shadow-lg shadow-cyan-500/50' : 'bg-slate-900 border border-cyan-500/50 text-cyan-400 shadow-md'} font-black text-[10px]">
                <span>${p.code.replace('ID-', '')}</span>
              </div>
              <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-700/60 text-[10px] font-mono font-bold text-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap opacity-90 pointer-events-none">
                ${p.name.split(' ')[0]}
              </div>
            </div>
          `;

          const marker = L.marker([lat, lon], {
            icon: L.divIcon({
              html: iconHtml,
              className: 'gis-custom-marker',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })
          });

          marker.on('click', () => setSelectedFeature(feat));
          marker.bindTooltip(`<b>${p.name}</b><br/>Code: ${p.code}<br/>Racks: ${p.rackCount || 0} | Devices: ${p.deviceCount || 0}`);
          locationsLayerGroupRef.current.addLayer(marker);
        }
      });
    }

    // 2. Render Optical Cable Polylines
    cablesLayerGroupRef.current.clearLayers();
    if (visibleLayers.cables && layersData.cables) {
      layersData.cables.features.forEach(feat => {
        if (feat.geometry.type === 'LineString') {
          const coords = feat.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);
          const p = feat.properties;
          const style = CABLE_COLORS[p.cableType] || CABLE_COLORS.FEEDER_CABLE;

          // Polyline Glow Shadow
          const glowLine = L.polyline(coords, {
            color: style.stroke,
            weight: p.cableType === 'BACKBONE_TRUNK' ? 8 : 6,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round'
          });

          // Primary Core Polyline
          const mainLine = L.polyline(coords, {
            color: style.stroke,
            weight: p.cableType === 'BACKBONE_TRUNK' ? 4 : 3,
            opacity: 0.95,
            dashArray: p.cableType === 'DROP_CABLE' ? '4, 4' : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          });

          mainLine.on('mouseover', () => {
            mainLine.setStyle({ weight: 6, opacity: 1 });
          });
          mainLine.on('mouseout', () => {
            mainLine.setStyle({ weight: p.cableType === 'BACKBONE_TRUNK' ? 4 : 3, opacity: 0.95 });
          });

          mainLine.on('click', () => setSelectedFeature(feat));
          mainLine.bindTooltip(`<b>${p.cableCode}</b> (${style.label})<br/>${p.cableName}<br/>Total Cores: ${p.totalCores} | Util: ${p.utilizationPct}%`);

          cablesLayerGroupRef.current.addLayer(glowLine);
          cablesLayerGroupRef.current.addLayer(mainLine);
        }
      });
    }

    // 3. Render Manholes & Handholes
    manholesLayerGroupRef.current.clearLayers();
    if (visibleLayers.manholes && layersData.manholes) {
      layersData.manholes.features.forEach(feat => {
        if (feat.geometry.type === 'Point') {
          const [lon, lat] = feat.geometry.coordinates;
          const p = feat.properties;

          const isHandhole = p.type === 'HANDHOLE';
          const iconHtml = `
            <div class="relative cursor-pointer group flex items-center justify-center">
              <div class="w-4 h-4 rounded-full ${isHandhole ? 'bg-amber-500/20 border-2 border-amber-400' : 'bg-orange-600/30 border-2 border-orange-500'} shadow-md flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full ${isHandhole ? 'bg-amber-300' : 'bg-orange-400'}"></div>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lon], {
            icon: L.divIcon({
              html: iconHtml,
              className: 'gis-custom-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          });

          marker.on('click', () => setSelectedFeature(feat));
          marker.bindTooltip(`<b>${p.code}</b> (${p.type})<br/>${p.name}<br/>Duct: ${p.ductUsed}/${p.ductCapacity} | Depth: ${p.depthMeters}m`);
          manholesLayerGroupRef.current.addLayer(marker);
        }
      });
    }

    // 4. Render Splice Closures (FOSC)
    closuresLayerGroupRef.current.clearLayers();
    if (visibleLayers.closures && layersData.spliceClosures) {
      layersData.spliceClosures.features.forEach(feat => {
        if (feat.geometry.type === 'Point') {
          const [lon, lat] = feat.geometry.coordinates;
          const p = feat.properties;

          const iconHtml = `
            <div class="relative cursor-pointer group flex items-center justify-center">
              <div class="w-4 h-4 bg-purple-600/40 border border-purple-400 rotate-45 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <div class="w-1.5 h-1.5 bg-purple-300"></div>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lon], {
            icon: L.divIcon({
              html: iconHtml,
              className: 'gis-custom-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          });

          marker.on('click', () => setSelectedFeature(feat));
          marker.bindTooltip(`<b>${p.code}</b> (Splice Closure)<br/>${p.name}<br/>Trays: ${p.usedTrays}/${p.maxTrays} | Splices: ${p.totalSplices}`);
          closuresLayerGroupRef.current.addLayer(marker);
        }
      });
    }
  }, [layersData, visibleLayers]);

  // Handle Interactive Distance Measurement Drawing
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    measureLayerGroupRef.current.clearLayers();

    if (measurePoints.length > 0) {
      // Draw points
      measurePoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 5,
          color: '#06b6d4',
          fillColor: '#38bdf8',
          fillOpacity: 1,
          weight: 2
        });
        marker.bindTooltip(`Point #${idx + 1}`);
        measureLayerGroupRef.current.addLayer(marker);
      });

      // Draw dashed connecting line
      if (measurePoints.length > 1) {
        const line = L.polyline(measurePoints, {
          color: '#38bdf8',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.9
        });
        measureLayerGroupRef.current.addLayer(line);
      }
    }
  }, [measurePoints]);

  // Group Corridors by Country for Dropdown
  const groupedCorridors = useMemo(() => {
    const groups: Record<string, RegionalCorridor[]> = {};
    corridors.forEach(c => {
      const country = c.country || 'Global';
      if (!groups[country]) groups[country] = [];
      groups[country].push(c);
    });
    return groups;
  }, [corridors]);

  // Corridor Handlers
  const handleSaveCorridors = (newCorridors: RegionalCorridor[]) => {
    setCorridors(newCorridors);
    try {
      localStorage.setItem('netstream_gis_corridors_v1', JSON.stringify(newCorridors));
    } catch (e) {
      console.error('Failed to save corridors to localStorage:', e);
    }
  };

  const handleSelectCorridor = (corridor: RegionalCorridor) => {
    setSelectedCorridorId(corridor.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(corridor.center, corridor.zoom, { duration: 1.2 });
    }
  };

  // Auto-fit Network Bounds across all loaded cables & facilities worldwide
  const handleAutoFitNetwork = () => {
    if (!mapInstanceRef.current || !layersData) return;
    const allCoords: [number, number][] = [];

    // Cables
    layersData.cables?.features.forEach(f => {
      if (f.geometry.type === 'LineString') {
        f.geometry.coordinates.forEach(([lon, lat]: [number, number]) => {
          allCoords.push([lat, lon]);
        });
      }
    });

    // Locations / Sites
    layersData.locations?.features.forEach(f => {
      if (f.geometry.type === 'Point') {
        const [lon, lat] = f.geometry.coordinates;
        allCoords.push([lat, lon]);
      }
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  // Spatial Omnisearch Matches
  const searchResults = useMemo(() => {
    const q = omniSearchQuery.trim().toLowerCase();
    if (!q || !layersData) return [];

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'CABLE' | 'LOCATION' | 'MANHOLE' | 'SPLICE_CLOSURE' | 'COORDINATES';
      feature?: GisFeature;
      lat?: number;
      lon?: number;
      badge: string;
    }> = [];

    // 1. GPS Coordinates check (e.g. "-6.2088, 106.8456")
    const coordMatch = omniSearchQuery.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        results.push({
          id: 'coord-jump',
          title: `GPS Waypoint: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          subtitle: 'Direct Geodesic Coordinate Navigation',
          type: 'COORDINATES',
          lat,
          lon,
          badge: 'GPS Waypoint'
        });
      }
    }

    // 2. Cables
    layersData.cables?.features.forEach(f => {
      const code = f.properties.cableCode || '';
      const name = f.properties.cableName || '';
      const tier = f.properties.cableType || '';
      if (code.toLowerCase().includes(q) || name.toLowerCase().includes(q) || tier.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: code,
          subtitle: `${name} • ${(f.properties.lengthMeters / 1000).toFixed(1)} km`,
          type: 'CABLE',
          feature: f,
          badge: tier.replace('_', ' ')
        });
      }
    });

    // 3. Locations / POPs / Data Centers
    layersData.locations?.features.forEach(f => {
      const code = f.properties.code || '';
      const name = f.properties.name || '';
      const addr = f.properties.address || '';
      if (code.toLowerCase().includes(q) || name.toLowerCase().includes(q) || addr.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: name,
          subtitle: `${code} • ${addr}`,
          type: 'LOCATION',
          feature: f,
          badge: f.properties.type || 'POP / DC'
        });
      }
    });

    // 4. Manholes / Handholes
    layersData.manholes?.features.forEach(f => {
      const code = f.properties.code || '';
      const name = f.properties.name || '';
      if (code.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: code,
          subtitle: `${name} • Depth ${f.properties.depthMeters}m`,
          type: 'MANHOLE',
          feature: f,
          badge: f.properties.type || 'Manhole'
        });
      }
    });

    // 5. Splice Closures (FOSC)
    layersData.spliceClosures?.features.forEach(f => {
      const code = f.properties.code || '';
      const name = f.properties.name || '';
      if (code.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: code,
          subtitle: `${name} • ${f.properties.totalSplices} Splices`,
          type: 'SPLICE_CLOSURE',
          feature: f,
          badge: 'FOSC'
        });
      }
    });

    return results.slice(0, 10);
  }, [omniSearchQuery, layersData]);

  // Omnisearch Item Selected (Fly-to camera + pulsing highlight beacon)
  const handleSelectSearchResult = (result: (typeof searchResults)[0]) => {
    if (!mapInstanceRef.current) return;
    setOmniSearchQuery('');
    setIsSearchFocused(false);

    searchHighlightLayerRef.current.clearLayers();

    if (result.type === 'COORDINATES' && result.lat !== undefined && result.lon !== undefined) {
      mapInstanceRef.current.flyTo([result.lat, result.lon], 16, { duration: 1.2 });
      const beacon = L.circleMarker([result.lat, result.lon], {
        radius: 14,
        color: '#06b6d4',
        fillColor: '#22d3ee',
        fillOpacity: 0.6,
        weight: 3
      }).addTo(searchHighlightLayerRef.current);
      setTimeout(() => searchHighlightLayerRef.current.removeLayer(beacon), 5000);
      return;
    }

    if (!result.feature) return;
    const feat = result.feature;
    setSelectedFeature(feat);

    if (feat.geometry.type === 'LineString') {
      const coords = feat.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);
      const bounds = L.latLngBounds(coords);
      mapInstanceRef.current.flyToBounds(bounds, { duration: 1.2, padding: [60, 60] });

      const lineHighlight = L.polyline(coords, {
        color: '#38bdf8',
        weight: 8,
        opacity: 0.8
      }).addTo(searchHighlightLayerRef.current);
      setTimeout(() => searchHighlightLayerRef.current.removeLayer(lineHighlight), 4000);
    } else if (feat.geometry.type === 'Point') {
      const [lon, lat] = feat.geometry.coordinates;
      mapInstanceRef.current.flyTo([lat, lon], 17, { duration: 1.2 });

      const pointHighlight = L.circleMarker([lat, lon], {
        radius: 18,
        color: '#06b6d4',
        fillColor: '#38bdf8',
        fillOpacity: 0.5,
        weight: 3
      }).addTo(searchHighlightLayerRef.current);
      setTimeout(() => searchHighlightLayerRef.current.removeLayer(pointHighlight), 4000);
    }
  };

  // Trigger OTDR Fiber Break Locator
  const handleRunOtdrLocate = async () => {
    if (!otdrCableId) return;
    setOtdrLoading(true);
    try {
      const dist = parseFloat(otdrDistanceKm) || 1.0;
      const res = await gisApi.locateOtdrFault({
        cableId: otdrCableId,
        distanceKm: dist
      });
      setOtdrResult(res);

      // Drop animated beacon on map
      if (mapInstanceRef.current) {
        otdrBeaconLayerRef.current.clearLayers();

        const beaconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 rounded-full bg-rose-500/40 animate-ping"></div>
            <div class="absolute w-8 h-8 rounded-full bg-rose-600/60 animate-pulse"></div>
            <div class="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-xl shadow-rose-600 flex items-center justify-center text-white font-black text-[10px]">
              !
            </div>
          </div>
        `;

        const beaconMarker = L.marker([res.latitude, res.longitude], {
          icon: L.divIcon({
            html: beaconHtml,
            className: 'gis-alarm-beacon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        });

        // Radius circle buffer (150m)
        const bufferCircle = L.circle([res.latitude, res.longitude], {
          radius: 150,
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '4, 4'
        });

        otdrBeaconLayerRef.current.addLayer(bufferCircle);
        otdrBeaconLayerRef.current.addLayer(beaconMarker);

        mapInstanceRef.current.flyTo([res.latitude, res.longitude], 16, { duration: 1.5 });
      }
    } catch (err) {
      console.error('OTDR fault location failed:', err);
    } finally {
      setOtdrLoading(false);
    }
  };

  // Open Bill of Materials (BOM)
  const handleOpenBom = async () => {
    setIsBomOpen(true);
    setBomLoading(true);
    try {
      const cableIds = layersData?.cables.features.map(f => f.id) || [];
      const data = await gisApi.calculateBOM(cableIds);
      setBomData(data);
    } catch (err) {
      console.error('BOM fetch failed:', err);
    } finally {
      setBomLoading(false);
    }
  };

  // Open TIA-598 Strand Matrix from Cable Popup
  const handleOpenStrandMatrix = async (cableId: string) => {
    try {
      const cable = await inventoryApi.getCableById(cableId);
      setInspectingCable(cable);
    } catch (err) {
      console.error('Failed to load cable for strand inspection:', err);
    }
  };

  // Open Edit Cable Properties & Geometry Modal
  const handleOpenEditCable = async (cableId: string) => {
    try {
      const cable = await inventoryApi.getCableById(cableId);
      setEditingCable(cable);
    } catch (err) {
      console.error('Failed to load cable for editing:', err);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] flex flex-col overflow-hidden select-none bg-[#090d16]">
      {/* 1. Floating Top HUD Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[100] flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Brand Badge, International Corridor Selector & Spatial Omnisearch */}
        <div className="flex items-center gap-2.5 bg-[#090d16]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl flex-shrink-0">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white font-sans">NetStream GIS</span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5"></div>

          {/* Dynamic Regional Corridor Selector (Change-able & International) */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCorridorId}
              onChange={e => {
                const c = corridors.find(item => item.id === e.target.value);
                if (c) handleSelectCorridor(c);
              }}
              className="bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-cyan-200 rounded-lg px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer max-w-[190px]"
              title="Select active regional corridor or camera preset"
            >
              {Object.entries(groupedCorridors).map(([country, items]) => (
                <optgroup key={country} label={country} className="bg-slate-950 text-slate-300 font-sans">
                  {items.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 font-mono">
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Manage Corridors Button */}
            <button
              type="button"
              onClick={() => setIsCorridorsModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all active:scale-95 border border-slate-700/60"
              title="Manage Corridors & Viewports (Add custom country corridors, capture view, reset)"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>

            {/* Auto-Fit Network Button */}
            <button
              type="button"
              onClick={handleAutoFitNetwork}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 transition-all active:scale-95"
              title="Auto-fit camera to entire optical network bounding box"
            >
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>Fit Network</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5"></div>

          {/* Spatial Omnisearch Bar */}
          <div className="relative">
            <div className="flex items-center bg-slate-950/80 border border-slate-700/70 rounded-xl px-2.5 py-1 text-xs focus-within:border-cyan-500 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={omniSearchQuery}
                onChange={e => setOmniSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    handleSelectSearchResult(searchResults[0]);
                  }
                }}
                placeholder="Search cables, sites, manholes, or lat,lon..."
                className="bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 font-mono text-[11px] w-48 lg:w-64"
              />
              {omniSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOmniSearchQuery('')}
                  className="p-0.5 rounded text-slate-500 hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Omnisearch Results Dropdown */}
            {isSearchFocused && omniSearchQuery.trim() && (
              <div
                className="absolute left-0 top-full mt-1.5 w-80 lg:w-96 bg-[#090d16]/98 backdrop-blur-2xl border border-cyan-500/40 rounded-xl shadow-2xl p-1.5 z-[2000] max-h-80 overflow-y-auto"
                onMouseDown={e => e.preventDefault()}
              >
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 font-mono">
                    No matching assets or coordinates found
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                      <span>Spatial Search Matches ({searchResults.length})</span>
                      <span className="text-cyan-400">Click to fly & inspect</span>
                    </div>
                    {searchResults.map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-800/40 flex items-start justify-between gap-2 transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate font-mono">
                              {res.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {res.subtitle}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap">
                          {res.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Base Map Switcher, Tools & OTDR Simulator */}
        <div className="flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl flex-shrink-0">
          {/* Base Tile Selector */}
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeTileKey}
              onChange={e => setActiveTileKey(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-cyan-500"
            >
              <option value="dark">CartoDB Dark Matter</option>
              <option value="osm">OpenStreetMap</option>
              <option value="satellite">ESRI World Satellite</option>
              <option value="positron">CartoDB Positron Light</option>
            </select>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

          {/* Distance Measure Ruler Button */}
          <button
            onClick={() => {
              if (isMeasuring) {
                setIsMeasuring(false);
                setMeasurePoints([]);
                setMeasuredDistanceKm(0);
                measureLayerGroupRef.current.clearLayers();
              } else {
                setIsMeasuring(true);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all active:scale-95 ${isMeasuring
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            title="Click to drop ruler pins along routes"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{isMeasuring ? `Measuring (${measuredDistanceKm.toFixed(2)} km)` : 'Measure'}</span>
          </button>

          {/* OTDR Fault Locator Tool */}
          <button
            onClick={() => setIsOtdrOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/40 transition-all active:scale-95 shadow-lg shadow-rose-600/20"
            title="OTDR Cut Locator"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>OTDR Cut Locator</span>
          </button>

          {/* Bill of Materials (BOM) Calculator */}
          <button
            onClick={handleOpenBom}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/40 transition-all active:scale-95 shadow-lg shadow-purple-600/20"
            title="BOM Calculator"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>BOM Planner</span>
          </button>
        </div>
      </div>

      {/* 2. Floating Left: Layer Visibility Controller & Legend */}
      <div className={`absolute top-16 left-3 z-[90] bg-[#090d16]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-200 ${isLayersPanelOpen ? 'w-64 p-3.5 gap-3' : 'w-auto px-3 py-2'
        }`}>
        <div className={`flex items-center justify-between ${isLayersPanelOpen ? 'border-b border-slate-800 pb-2' : ''} gap-2`}>
          <button
            type="button"
            onClick={() => setIsLayersPanelOpen(prev => !prev)}
            className="flex items-center gap-2 text-left hover:text-cyan-300 transition-colors cursor-pointer"
            title={isLayersPanelOpen ? 'Collapse GIS Layers' : 'Expand GIS Layers'}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">GIS Layers</span>
            {isLayersPanelOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {isLayersPanelOpen && (
            <span className="text-[10px] font-mono text-slate-400">PostGIS Live</span>
          )}
        </div>

        {isLayersPanelOpen && (
          <>
            {/* Layer Checkboxes */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition-all">
                <div className="flex items-center gap-2 text-slate-200 font-sans">
                  <input
                    type="checkbox"
                    checked={visibleLayers.locations}
                    onChange={e => setVisibleLayers(prev => ({ ...prev, locations: e.target.checked }))}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>POPs & Data Centers</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  {layersData?.summaryStats.locationsCount || 0}
                </span>
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition-all">
                <div className="flex items-center gap-2 text-slate-200 font-sans">
                  <input
                    type="checkbox"
                    checked={visibleLayers.cables}
                    onChange={e => setVisibleLayers(prev => ({ ...prev, cables: e.target.checked }))}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Optical Fiber Spans</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  {layersData?.summaryStats.cablesCount || 0}
                </span>
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition-all">
                <div className="flex items-center gap-2 text-slate-200 font-sans">
                  <input
                    type="checkbox"
                    checked={visibleLayers.manholes}
                    onChange={e => setVisibleLayers(prev => ({ ...prev, manholes: e.target.checked }))}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Manholes & Handholes</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 font-bold">
                  {layersData?.summaryStats.manholesCount || 0}
                </span>
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition-all">
                <div className="flex items-center gap-2 text-slate-200 font-sans">
                  <input
                    type="checkbox"
                    checked={visibleLayers.closures}
                    onChange={e => setVisibleLayers(prev => ({ ...prev, closures: e.target.checked }))}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Splice Closures (FOSC)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  {layersData?.summaryStats.spliceClosuresCount || 0}
                </span>
              </label>
            </div>

            {/* Cable Topology Legend */}
            <div className="border-t border-slate-800 pt-2.5 mt-1 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold block">
                Cable Legend
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-purple-500 rounded-full shadow-sm shadow-purple-500/50"></div>
                  <span className="text-slate-300">Backbone Trunk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50"></div>
                  <span className="text-slate-300">Feeder Cable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"></div>
                  <span className="text-slate-300">Distribution Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 border-t-2 border-amber-400 border-dashed"></div>
                  <span className="text-slate-300">FTTH Drop Cable</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. The Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 bg-[#090d16]"
      />

      {/* 4. Selected Object Inspection Drawer (Right Slide-over) */}
      {selectedFeature && (
        <div className="absolute top-16 right-3 bottom-3 z-[120] w-84 md:w-96 bg-[#090d16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  {selectedFeature.properties.layerType} INSPECTOR
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedFeature.properties.name || selectedFeature.properties.cableName}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Code: {selectedFeature.properties.code || selectedFeature.properties.cableCode}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content per Layer Type */}
            {selectedFeature.properties.layerType === 'LOCATION' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">FACILITY TYPE</span>
                    <span className="font-bold text-slate-200">{selectedFeature.properties.type}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">STATUS</span>
                    <span className="font-bold text-emerald-400">{selectedFeature.properties.status}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">RACKS DEPLOYED</span>
                    <span className="font-bold text-cyan-300">{selectedFeature.properties.rackCount || 0} Racks</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">ACTIVE DEVICES</span>
                    <span className="font-bold text-purple-300">{selectedFeature.properties.deviceCount || 0} Chassis</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono mb-1">PHYSICAL ADDRESS</span>
                  <span className="text-slate-300 font-sans">{selectedFeature.properties.address || 'Telecom Transit Point'}</span>
                </div>
              </div>
            )}

            {selectedFeature.properties.layerType === 'CABLE' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">TIER</span>
                    <span className="font-bold text-purple-300">{selectedFeature.properties.cableType}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">FIBER SPEC</span>
                    <span className="font-bold text-cyan-300">{selectedFeature.properties.fiberGrade}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">TOTAL CORES</span>
                    <span className="font-bold text-white">{selectedFeature.properties.totalCores} Cores</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">ROUTE LENGTH</span>
                    <span className="font-bold text-amber-300">
                      {((selectedFeature.properties.lengthMeters || 0) / 1000).toFixed(1)} km
                    </span>
                  </div>
                </div>

                {/* Capacity Gauge */}
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Strand Utilization</span>
                    <span className="font-bold text-cyan-300">{selectedFeature.properties.utilizationPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, selectedFeature.properties.utilizationPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Lit: {selectedFeature.properties.litCores}</span>
                    <span>Dark: {selectedFeature.properties.darkCores}</span>
                  </div>
                </div>

                {/* Actions: Inspect Strands & Edit Cable */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenStrandMatrix(selectedFeature.id)}
                    className="py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>Strand Matrix</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditCable(selectedFeature.id)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
                    title="Edit Status, Physical Specs & PostGIS Spatial Geometry"
                  >
                    <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Cable</span>
                  </button>
                </div>
              </div>
            )}

            {selectedFeature.properties.layerType === 'MANHOLE' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">PIT TYPE</span>
                    <span className="font-bold text-orange-400">{selectedFeature.properties.type}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">DEPTH</span>
                    <span className="font-bold text-slate-200">{selectedFeature.properties.depthMeters} meters</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Duct Entry Port Capacity</span>
                    <span className="font-bold text-orange-300">
                      {selectedFeature.properties.ductUsed} / {selectedFeature.properties.ductCapacity} Ducts
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(selectedFeature.properties.ductUsed / selectedFeature.properties.ductCapacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono mb-1">COVER SPECIFICATION</span>
                  <span className="text-slate-300 font-mono text-[11px]">{selectedFeature.properties.coverType}</span>
                </div>
              </div>
            )}

            {selectedFeature.properties.layerType === 'SPLICE_CLOSURE' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">ENCLOSURE TYPE</span>
                    <span className="font-bold text-purple-400">FOSC IP68 Dome</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">HOST MANHOLE</span>
                    <span className="font-bold text-cyan-300">{selectedFeature.properties.manholeCode || 'MH-SDR-02'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">TRAY OCCUPANCY</span>
                    <span className="font-bold text-slate-200">
                      {selectedFeature.properties.usedTrays} / {selectedFeature.properties.maxTrays} Trays
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">FUSION SPLICES</span>
                    <span className="font-bold text-emerald-400">{selectedFeature.properties.totalSplices} Splices</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. OTDR Fiber Break Locator Modal */}
      {isOtdrOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#090d16] border border-rose-500/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl shadow-rose-950/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">OTDR Fiber Break Locator</h3>
                  <p className="text-xs text-slate-400">PostGIS Geodesic Line Interpolation Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsOtdrOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Optical Cable Span</label>
                <select
                  value={otdrCableId}
                  onChange={e => setOtdrCableId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none focus:border-rose-500 font-mono text-xs"
                >
                  {layersData?.cables.features.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.properties.cableCode} — {f.properties.cableName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">OTDR Measured Fault Distance (km)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={otdrDistanceKm}
                    onChange={e => setOtdrDistanceKm(e.target.value)}
                    placeholder="e.g. 14.5"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none focus:border-rose-500 font-mono text-xs"
                  />
                  <span className="text-slate-400 font-mono text-xs">km from Origin</span>
                </div>
              </div>

              {otdrResult && (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>FAULT PINPOINTED AT GPS COORDINATES</span>
                  </div>
                  <div className="text-slate-200">
                    <b>Latitude:</b> {otdrResult.latitude.toFixed(6)} | <b>Longitude:</b> {otdrResult.longitude.toFixed(6)}
                  </div>
                  <div className="text-amber-300">
                    <b>Nearest Pit:</b> {otdrResult.nearestManholeCode} (~{otdrResult.distanceToNearestManholeMeters}m away)
                  </div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    {otdrResult.recommendedAction}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsOtdrOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRunOtdrLocate}
                disabled={otdrLoading}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
              >
                {otdrLoading ? 'Interpolating PostGIS Point...' : 'Pinpoint Break on Map'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bill of Materials (BOM) & Path Planning Drawer */}
      {isBomOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#090d16] border border-purple-500/40 rounded-2xl w-full max-w-2xl p-5 shadow-2xl shadow-purple-950/50 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Outside Plant Bill of Materials (BOM)</h3>
                  <p className="text-xs text-slate-400">Civil OSP Infrastructure & Fiber Splicing Cost Model</p>
                </div>
              </div>
              <button
                onClick={() => setIsBomOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bomLoading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                Computing PostGIS geodesic route distances & materials...
              </div>
            ) : bomData ? (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* 4 KPIs */}
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">TOTAL DISTANCE</span>
                    <span className="text-sm font-bold text-cyan-300">{bomData.totalRouteKm} km</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">GLASS CORES</span>
                    <span className="text-sm font-bold text-purple-300">{bomData.totalCores} Cores</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">MANHOLES</span>
                    <span className="text-sm font-bold text-orange-400">{bomData.totalManholesEncountered} Pits</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SPLICE CLOSURES</span>
                    <span className="text-sm font-bold text-emerald-400">{bomData.totalSpliceClosures} FOSC</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Item Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price (IDR)</th>
                        <th className="px-3 py-2 text-right">Total (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                      {bomData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2 font-sans font-medium text-white">{item.description}</td>
                          <td className="px-3 py-2 text-right">{item.quantity.toLocaleString()} {item.unit}</td>
                          <td className="px-3 py-2 text-right text-slate-400">Rp {item.unitPriceIdr.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-bold text-cyan-300">Rp {item.totalPriceIdr.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Cost Bar */}
                <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-xl flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Project CAPEX</span>
                    <span className="text-lg font-black text-purple-300">
                      Rp {bomData.totalEstimatedCapexIdr.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Annual Maintenance OPEX</span>
                    <span className="text-sm font-bold text-emerald-400">
                      Rp {bomData.totalEstimatedOpexAnnualIdr.toLocaleString()} / year
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsBomOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Planner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[3000] bg-[#090d16]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl text-xs font-sans w-52 space-y-1"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-800">
            {contextMenu.lat.toFixed(5)}, {contextMenu.lng.toFixed(5)}
          </div>
          <button
            onClick={() => {
              setIsMeasuring(true);
              setMeasurePoints([L.latLng(contextMenu.lat, contextMenu.lng)]);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            <span>Measure from Here</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${contextMenu.lat.toFixed(6)}, ${contextMenu.lng.toFixed(6)}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Copy GPS Coordinates</span>
          </button>
          <button
            onClick={() => {
              setIsOtdrOpen(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Fiber Break Here</span>
          </button>
        </div>
      )}

      {/* 8. TIA-598 Strand Matrix Modal Integration */}
      {inspectingCable && (
        <CableStrandMatrixModal
          isOpen={!!inspectingCable}
          cable={inspectingCable}
          onClose={() => setInspectingCable(null)}
          onStrandUpdated={() => { }}
        />
      )}

      {/* 9. Edit Cable Properties & PostGIS Geometry Modal */}
      {editingCable && (
        <EditCableModal
          isOpen={!!editingCable}
          cable={editingCable}
          onClose={() => setEditingCable(null)}
          onSuccess={(updated) => {
            loadGisLayers();
            setEditingCable(null);
            setSelectedFeature(null);
          }}
        />
      )}

      {/* 10. Manage Regional Corridors & Viewports Modal */}
      <ManageCorridorsModal
        isOpen={isCorridorsModalOpen}
        onClose={() => setIsCorridorsModalOpen(false)}
        corridors={corridors}
        onSaveCorridors={handleSaveCorridors}
        currentMapCenter={currentMapCenter}
        currentMapZoom={currentMapZoom}
        onSelectCorridor={handleSelectCorridor}
      />
    </div>
  );
};
