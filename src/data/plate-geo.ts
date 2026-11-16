export type PlateGeo = {
  cardId: string;
  lat: number;
  lng: number;
  /** Annual vehicle-miles traveled (millions). Source: FHWA VM-2 (2024). */
  vmt: number;
  /**
   * Multiplier for how far a state's plates travel beyond its borders.
   * Pass-through interstate hubs (IL, OH, PA, TN…) score high; island
   * states and territories score low. Canadian provinces use 0.5 to account
   * for the much lower cross-border appearance rate in the US.
   */
  corridorFactor: number;
};

export type RouteOption = {
  code: string;
  label: string;
  lat: number;
  lng: number;
  group: "US" | "Canada";
};

// VMT from FHWA VM-2 (2024), in millions of vehicle-miles.
// Corridor factors are editorial estimates of cross-border plate exportability.
export const PLATE_GEO: PlateGeo[] = [
  // US States + DC
  { cardId: "plate-AL", lat: 32.8,  lng: -86.8,  vmt:  72903.9, corridorFactor: 1.3 },
  { cardId: "plate-AK", lat: 64.2,  lng: -153.4, vmt:   5502.6, corridorFactor: 0.8 },
  { cardId: "plate-AZ", lat: 34.3,  lng: -111.1, vmt:  70451.2, corridorFactor: 1.0 },
  { cardId: "plate-AR", lat: 34.9,  lng: -92.4,  vmt:  39372.4, corridorFactor: 1.0 },
  { cardId: "plate-CA", lat: 36.8,  lng: -119.4, vmt: 325959.2, corridorFactor: 1.0 },
  { cardId: "plate-CO", lat: 39.0,  lng: -105.5, vmt:  55068.0, corridorFactor: 1.0 },
  { cardId: "plate-CT", lat: 41.6,  lng: -72.7,  vmt:  30946.9, corridorFactor: 1.3 },
  { cardId: "plate-DE", lat: 39.0,  lng: -75.5,  vmt:   9936.6, corridorFactor: 1.3 },
  { cardId: "plate-DC", lat: 38.9,  lng: -77.0,  vmt:   3539.3, corridorFactor: 1.0 },
  { cardId: "plate-FL", lat: 27.8,  lng: -81.6,  vmt: 249474.1, corridorFactor: 1.0 },
  { cardId: "plate-GA", lat: 32.7,  lng: -83.4,  vmt: 122215.7, corridorFactor: 1.5 },
  { cardId: "plate-HI", lat: 20.8,  lng: -156.3, vmt:  10647.3, corridorFactor: 0.8 },
  { cardId: "plate-ID", lat: 44.4,  lng: -114.5, vmt:  20046.4, corridorFactor: 1.0 },
  { cardId: "plate-IL", lat: 40.0,  lng: -89.2,  vmt: 104290.2, corridorFactor: 1.8 },
  { cardId: "plate-IN", lat: 39.8,  lng: -86.1,  vmt:  88230.8, corridorFactor: 1.8 },
  { cardId: "plate-IA", lat: 42.0,  lng: -93.5,  vmt:  33816.7, corridorFactor: 1.0 },
  { cardId: "plate-KS", lat: 38.5,  lng: -98.4,  vmt:  31669.9, corridorFactor: 1.3 },
  { cardId: "plate-KY", lat: 37.5,  lng: -85.3,  vmt:  49168.4, corridorFactor: 1.5 },
  { cardId: "plate-LA", lat: 31.1,  lng: -91.9,  vmt:  55109.1, corridorFactor: 1.0 },
  { cardId: "plate-ME", lat: 45.4,  lng: -69.0,  vmt:  15160.9, corridorFactor: 1.0 },
  { cardId: "plate-MD", lat: 39.0,  lng: -76.8,  vmt:  57049.4, corridorFactor: 1.5 },
  { cardId: "plate-MA", lat: 42.2,  lng: -71.7,  vmt:  62013.3, corridorFactor: 1.0 },
  { cardId: "plate-MI", lat: 44.3,  lng: -85.4,  vmt:  99661.4, corridorFactor: 1.0 },
  { cardId: "plate-MN", lat: 46.4,  lng: -93.1,  vmt:  59181.4, corridorFactor: 1.3 },
  { cardId: "plate-MS", lat: 32.7,  lng: -89.7,  vmt:  41554.2, corridorFactor: 1.3 },
  { cardId: "plate-MO", lat: 38.4,  lng: -92.5,  vmt:  81806.5, corridorFactor: 1.5 },
  { cardId: "plate-MT", lat: 46.9,  lng: -110.4, vmt:  13865.0, corridorFactor: 1.0 },
  { cardId: "plate-NE", lat: 41.5,  lng: -99.9,  vmt:  21899.7, corridorFactor: 1.0 },
  { cardId: "plate-NV", lat: 39.3,  lng: -116.6, vmt:  28433.0, corridorFactor: 1.0 },
  { cardId: "plate-NH", lat: 43.7,  lng: -71.6,  vmt:  13853.6, corridorFactor: 1.0 },
  { cardId: "plate-NJ", lat: 40.1,  lng: -74.7,  vmt:  79459.8, corridorFactor: 1.8 },
  { cardId: "plate-NM", lat: 34.5,  lng: -105.9, vmt:  28644.6, corridorFactor: 1.0 },
  { cardId: "plate-NY", lat: 42.9,  lng: -75.6,  vmt: 120869.2, corridorFactor: 1.0 },
  { cardId: "plate-NC", lat: 35.6,  lng: -79.4,  vmt: 131008.4, corridorFactor: 1.5 },
  { cardId: "plate-ND", lat: 47.5,  lng: -100.5, vmt:  10029.7, corridorFactor: 1.0 },
  { cardId: "plate-OH", lat: 40.4,  lng: -82.8,  vmt: 116036.3, corridorFactor: 1.8 },
  { cardId: "plate-OK", lat: 35.6,  lng: -96.9,  vmt:  46456.2, corridorFactor: 1.3 },
  { cardId: "plate-OR", lat: 43.9,  lng: -120.6, vmt:  37398.9, corridorFactor: 1.0 },
  { cardId: "plate-PA", lat: 40.6,  lng: -77.3,  vmt:  95194.0, corridorFactor: 1.8 },
  { cardId: "plate-RI", lat: 41.6,  lng: -71.6,  vmt:   7655.9, corridorFactor: 1.0 },
  { cardId: "plate-SC", lat: 33.8,  lng: -80.9,  vmt:  62042.1, corridorFactor: 1.3 },
  { cardId: "plate-SD", lat: 44.4,  lng: -100.2, vmt:  10450.1, corridorFactor: 1.0 },
  { cardId: "plate-TN", lat: 35.8,  lng: -86.4,  vmt:  78904.4, corridorFactor: 1.8 },
  { cardId: "plate-TX", lat: 31.1,  lng: -97.6,  vmt: 308460.7, corridorFactor: 1.5 },
  { cardId: "plate-UT", lat: 39.3,  lng: -111.1, vmt:  36160.2, corridorFactor: 1.0 },
  { cardId: "plate-VT", lat: 44.1,  lng: -72.7,  vmt:   7208.3, corridorFactor: 1.0 },
  { cardId: "plate-VA", lat: 37.5,  lng: -78.9,  vmt:  88511.1, corridorFactor: 1.8 },
  { cardId: "plate-WA", lat: 47.4,  lng: -120.5, vmt:  60555.1, corridorFactor: 1.0 },
  { cardId: "plate-WV", lat: 38.6,  lng: -80.6,  vmt:  17213.8, corridorFactor: 1.0 },
  { cardId: "plate-WI", lat: 44.3,  lng: -89.7,  vmt:  69225.8, corridorFactor: 1.3 },
  { cardId: "plate-WY", lat: 43.0,  lng: -107.6, vmt:   9719.6, corridorFactor: 1.0 },

  // Canadian Provinces & Territories
  // VMT estimated from vehicle registration + road network; corridorFactor 0.5
  // accounts for much lower cross-border appearance rate in the US.
  { cardId: "intl-plates-ontario",                   lat: 44.5, lng: -78.0,  vmt: 200000, corridorFactor: 0.5 },
  { cardId: "intl-plates-quebec",                    lat: 46.0, lng: -73.5,  vmt: 120000, corridorFactor: 0.5 },
  { cardId: "intl-plates-british-columbia",          lat: 49.5, lng: -121.5, vmt:  70000, corridorFactor: 0.5 },
  { cardId: "intl-plates-alberta",                   lat: 52.0, lng: -114.0, vmt:  75000, corridorFactor: 0.5 },
  { cardId: "intl-plates-manitoba",                  lat: 50.5, lng: -97.0,  vmt:  25000, corridorFactor: 0.5 },
  { cardId: "intl-plates-saskatchewan",              lat: 52.0, lng: -106.0, vmt:  28000, corridorFactor: 0.5 },
  { cardId: "intl-plates-nova-scotia",               lat: 44.7, lng: -63.7,  vmt:  18000, corridorFactor: 0.5 },
  { cardId: "intl-plates-new-brunswick",             lat: 46.6, lng: -66.5,  vmt:  17000, corridorFactor: 0.5 },
  { cardId: "intl-plates-newfoundland-and-labrador", lat: 48.5, lng: -56.0,  vmt:  10000, corridorFactor: 0.5 },
  { cardId: "intl-plates-prince-edward-island",      lat: 46.4, lng: -63.3,  vmt:   3000, corridorFactor: 0.5 },
  { cardId: "intl-plates-yukon",                     lat: 63.0, lng: -135.0, vmt:   1500, corridorFactor: 0.5 },
  { cardId: "intl-plates-northwest-territories",     lat: 64.3, lng: -119.7, vmt:   1500, corridorFactor: 0.5 },
  { cardId: "intl-plates-nunavut",                   lat: 70.0, lng: -86.5,  vmt:    500, corridorFactor: 0.5 },

  // Mexico & Territories
  // Mexico: calibrated to border-crossing traffic volume, not national population.
  // Puerto Rico VMT is actual FHWA VM-2 data; corridorFactor reflects that PR
  // plates are almost exclusively seen in Florida and rarely elsewhere.
  { cardId: "intl-plates-mexico-any-state",  lat: 25.0, lng: -103.0, vmt:  50000, corridorFactor: 0.2  },
  { cardId: "intl-plates-puerto-rico",       lat: 18.2, lng: -66.6,  vmt:  15449, corridorFactor: 0.15 },
  { cardId: "intl-plates-us-virgin-islands", lat: 17.7, lng: -64.7,  vmt:    500, corridorFactor: 0.3  },
];

// Selectable origin/destination options (US states + DC + Canadian provinces/territories)
export const ROUTE_OPTIONS: RouteOption[] = [
  { code: "AL", label: "Alabama",        lat: 32.8, lng: -86.8,  group: "US" },
  { code: "AK", label: "Alaska",         lat: 64.2, lng: -153.4, group: "US" },
  { code: "AZ", label: "Arizona",        lat: 34.3, lng: -111.1, group: "US" },
  { code: "AR", label: "Arkansas",       lat: 34.9, lng: -92.4,  group: "US" },
  { code: "CA", label: "California",     lat: 36.8, lng: -119.4, group: "US" },
  { code: "CO", label: "Colorado",       lat: 39.0, lng: -105.5, group: "US" },
  { code: "CT", label: "Connecticut",    lat: 41.6, lng: -72.7,  group: "US" },
  { code: "DE", label: "Delaware",       lat: 39.0, lng: -75.5,  group: "US" },
  { code: "DC", label: "Washington DC",  lat: 38.9, lng: -77.0,  group: "US" },
  { code: "FL", label: "Florida",        lat: 27.8, lng: -81.6,  group: "US" },
  { code: "GA", label: "Georgia",        lat: 32.7, lng: -83.4,  group: "US" },
  { code: "HI", label: "Hawaii",         lat: 20.8, lng: -156.3, group: "US" },
  { code: "ID", label: "Idaho",          lat: 44.4, lng: -114.5, group: "US" },
  { code: "IL", label: "Illinois",       lat: 40.0, lng: -89.2,  group: "US" },
  { code: "IN", label: "Indiana",        lat: 39.8, lng: -86.1,  group: "US" },
  { code: "IA", label: "Iowa",           lat: 42.0, lng: -93.5,  group: "US" },
  { code: "KS", label: "Kansas",         lat: 38.5, lng: -98.4,  group: "US" },
  { code: "KY", label: "Kentucky",       lat: 37.5, lng: -85.3,  group: "US" },
  { code: "LA", label: "Louisiana",      lat: 31.1, lng: -91.9,  group: "US" },
  { code: "ME", label: "Maine",          lat: 45.4, lng: -69.0,  group: "US" },
  { code: "MD", label: "Maryland",       lat: 39.0, lng: -76.8,  group: "US" },
  { code: "MA", label: "Massachusetts",  lat: 42.2, lng: -71.7,  group: "US" },
  { code: "MI", label: "Michigan",       lat: 44.3, lng: -85.4,  group: "US" },
  { code: "MN", label: "Minnesota",      lat: 46.4, lng: -93.1,  group: "US" },
  { code: "MS", label: "Mississippi",    lat: 32.7, lng: -89.7,  group: "US" },
  { code: "MO", label: "Missouri",       lat: 38.4, lng: -92.5,  group: "US" },
  { code: "MT", label: "Montana",        lat: 46.9, lng: -110.4, group: "US" },
  { code: "NE", label: "Nebraska",       lat: 41.5, lng: -99.9,  group: "US" },
  { code: "NV", label: "Nevada",         lat: 39.3, lng: -116.6, group: "US" },
  { code: "NH", label: "New Hampshire",  lat: 43.7, lng: -71.6,  group: "US" },
  { code: "NJ", label: "New Jersey",     lat: 40.1, lng: -74.7,  group: "US" },
  { code: "NM", label: "New Mexico",     lat: 34.5, lng: -105.9, group: "US" },
  { code: "NY", label: "New York",       lat: 42.9, lng: -75.6,  group: "US" },
  { code: "NC", label: "North Carolina", lat: 35.6, lng: -79.4,  group: "US" },
  { code: "ND", label: "North Dakota",   lat: 47.5, lng: -100.5, group: "US" },
  { code: "OH", label: "Ohio",           lat: 40.4, lng: -82.8,  group: "US" },
  { code: "OK", label: "Oklahoma",       lat: 35.6, lng: -96.9,  group: "US" },
  { code: "OR", label: "Oregon",         lat: 43.9, lng: -120.6, group: "US" },
  { code: "PA", label: "Pennsylvania",   lat: 40.6, lng: -77.3,  group: "US" },
  { code: "RI", label: "Rhode Island",   lat: 41.6, lng: -71.6,  group: "US" },
  { code: "SC", label: "South Carolina", lat: 33.8, lng: -80.9,  group: "US" },
  { code: "SD", label: "South Dakota",   lat: 44.4, lng: -100.2, group: "US" },
  { code: "TN", label: "Tennessee",      lat: 35.8, lng: -86.4,  group: "US" },
  { code: "TX", label: "Texas",          lat: 31.1, lng: -97.6,  group: "US" },
  { code: "UT", label: "Utah",           lat: 39.3, lng: -111.1, group: "US" },
  { code: "VT", label: "Vermont",        lat: 44.1, lng: -72.7,  group: "US" },
  { code: "VA", label: "Virginia",       lat: 37.5, lng: -78.9,  group: "US" },
  { code: "WA", label: "Washington",     lat: 47.4, lng: -120.5, group: "US" },
  { code: "WV", label: "West Virginia",  lat: 38.6, lng: -80.6,  group: "US" },
  { code: "WI", label: "Wisconsin",      lat: 44.3, lng: -89.7,  group: "US" },
  { code: "WY", label: "Wyoming",        lat: 43.0, lng: -107.6, group: "US" },
  { code: "AB", label: "Alberta",              lat: 52.0, lng: -114.0, group: "Canada" },
  { code: "BC", label: "British Columbia",     lat: 49.5, lng: -121.5, group: "Canada" },
  { code: "MB", label: "Manitoba",             lat: 50.5, lng: -97.0,  group: "Canada" },
  { code: "NB", label: "New Brunswick",        lat: 46.6, lng: -66.5,  group: "Canada" },
  { code: "NL", label: "Newfoundland & Labrador", lat: 48.5, lng: -56.0, group: "Canada" },
  { code: "NT", label: "Northwest Territories", lat: 64.3, lng: -119.7, group: "Canada" },
  { code: "NS", label: "Nova Scotia",          lat: 44.7, lng: -63.7,  group: "Canada" },
  { code: "NU", label: "Nunavut",              lat: 70.0, lng: -86.5,  group: "Canada" },
  { code: "ON", label: "Ontario",              lat: 44.5, lng: -78.0,  group: "Canada" },
  { code: "PE", label: "Prince Edward Island", lat: 46.4, lng: -63.3,  group: "Canada" },
  { code: "QC", label: "Quebec",               lat: 46.0, lng: -73.5,  group: "Canada" },
  { code: "SK", label: "Saskatchewan",         lat: 52.0, lng: -106.0, group: "Canada" },
  { code: "YT", label: "Yukon",                lat: 63.0, lng: -135.0, group: "Canada" },
];
