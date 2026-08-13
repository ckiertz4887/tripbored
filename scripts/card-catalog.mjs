/**
 * Source of truth for every card in the game. Edit this file, then run
 * `npm run build:cards` to regenerate `src/data/cards.ts`. Don't hand-edit
 * cards.ts — it says so at the top, and your edit will be overwritten.
 *
 * A card's id is derived from its name (see scripts/build-cards.mjs), so
 * renaming a card here changes its id and orphans any `finds` already
 * written against the old id in Firestore. If you rename a card after real
 * games have been played, write a migration alongside the change.
 */

/** @typedef {[name: string, points: number]} CardTuple */
/** @typedef {{ label: string | null, cards: CardTuple[] }} GroupDef */

export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "Washington DC"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

/**
 * @type {{
 *   id: string, label: string, groups: GroupDef[],
 *   hidden?: boolean, style?: "sign" | "swatch"
 * }[]}
 */
export const PACKS = [
  {
    id: "intl-plates", label: "Other Plates",
    groups: [
      { label: "Canada", cards: [
        ["Ontario", 10], ["Quebec", 10], ["British Columbia", 10], ["Alberta", 10],
        ["Manitoba", 10], ["Saskatchewan", 10], ["Nova Scotia", 10], ["New Brunswick", 10],
        ["Newfoundland and Labrador", 10], ["Prince Edward Island", 10], ["Yukon", 10],
        ["Northwest Territories", 10], ["Nunavut", 10],
      ]},
      { label: "Mexico & Territories", cards: [
        ["Mexico - any state", 15], ["Puerto Rico", 25], ["US Virgin Islands", 50],
      ]},
    ],
  },
  {
    id: "responders", label: "Emergency",
    groups: [
      { label: "Police", cards: [
        ["Police - lights off", 5], ["Police - lights & siren", 10], ["Police - car pulled over", 10],
      ]},
      { label: "Ambulance", cards: [
        ["Ambulance - lights off", 5], ["Ambulance - lights & siren", 10],
      ]},
      { label: "Fire", cards: [
        ["Fire truck - lights off", 5], ["Fire truck - lights & siren", 10],
      ]},
    ],
  },
  {
    id: "vehicles", label: "Vehicles",
    groups: [
      { label: "Cars & Motorcycles", cards: [
        ["Motorcycle - standard", 5], ["Motorcycle - 3-wheeled", 10], ["Motorcycle - with sidecar", 25],
        ["Dirt bike", 5], ["ATV", 10], ["Convertible - top down", 10],
        ["Jeep - top down", 10], ["Jeep - doors off", 25],
        ["Classic VW Beetle", 15], ["Classic VW Microbus", 15], ["Barcycle/party bike", 15],
      ]},
      { label: "Trucks & Vans", cards: [
        ["Delivery van", 5], ["Mail truck", 5], ["Garbage truck", 5], ["Dump truck", 5],
        ["Cement mixer", 5], ["Tanker/oil truck", 5], ["Tow truck", 5], ["Car carrying truck", 5],
        ["Construction vehicle", 5], ["Log truck", 10], ["Tandem truck", 10],
        ["Semi - with trailer", 5], ["Semi - without trailer", 15],
        ["Food truck", 10], ["Ice cream truck", 15], ["Armored truck", 15], ["Military vehicle", 15],
      ]},
      { label: "Buses", cards: [
        ["School bus", 5], ["City bus", 5], ["Shuttle bus", 5], ["Coach/charter bus", 5],
      ]},
      { label: "Towing & Trailers", cards: [
        ["Boat on trailer", 5], ["Jet ski on trailer", 5], ["Boat trailer - no boat", 15],
        ["Camper trailer", 5], ["Airstream trailer", 10], ["RV/motorhome", 5], ["Horse trailer", 10],
        ["Modular home being towed", 20], ["Oversize/wide load", 15],
      ]},
      { label: "Gear & Racks", cards: [
        ["Bike rack - loaded", 5], ["Bike rack - empty", 5], ["Roof cargo box", 5],
        ["Kayak", 5], ["Canoe", 5], ["Mattress on roof", 10],
      ]},
      { label: "Air, Rail & Water", cards: [
        ["Plane", 5], ["Plane - banner in tow", 15], ["Helicopter", 15], ["Train", 5], ["Barge", 10],
      ]},
      { label: "Quirks & Damage", cards: [
        ["Car on side of highway", 10], ["Car missing spare tire", 20], ["Car driving on spare tire", 15],
        ["Missing headlight", 5], ["Missing taillight", 5], ["Mismatched door color", 15],
        ["Mismatched hood color", 15], ["Trunk tied down", 15], ["Gas tank door open", 15],
      ]},
      { label: "Custom & Cosmetic", cards: [
        ["Racing stripe", 15], ["Flames (paint)", 15], ["Ground effects/neon lighting", 15],
        ["Temporary license plate", 5], ["Sports-themed license plate", 5],
      ]},
    ],
  },
  {
    id: "car-colors", label: "Car Colors", style: "swatch",
    groups: [
      { label: "Common", cards: [
        ["White", 1], ["Black", 1], ["Gray/Silver", 1], ["Blue", 1], ["Red", 1],
        ["Green", 1], ["Brown/Tan", 1], ["Yellow", 1],
      ]},
      { label: "Rare", cards: [
        ["Orange", 5], ["Purple", 5], ["Gold", 5], ["Turquoise/Teal", 5],
        ["Fuchsia/Pink", 5], ["Lime/Bright green", 5], ["Multi-color", 10],
      ]},
    ],
  },
  {
    id: "rare", label: "Rare Vehicles",
    groups: [
      { label: "Exotic & Luxury", cards: [
        ["Ferrari", 25], ["Lamborghini", 25], ["Bentley", 25],
        ["Rolls-Royce", 25], ["Aston Martin", 25], ["McLaren", 50],
      ]},
      { label: "Unusual & Novelty", cards: [
        ["Limo", 15], ["Golf cart", 15], ["Hearse", 25], ["Slingshot", 25],
        ["Cybertruck", 25], ["Monster truck", 50], ["Amish horse & buggy", 50], ["DeLorean", 100],
      ]},
    ],
  },
  {
    id: "other-cars", label: "Other Cars",
    groups: [
      { label: "Bumper Stickers & Decals", cards: [
        ["Family stick-figure", 5], ["Sports team", 5],
        ["Baby on board", 5], ["College/university", 5], ["Political", 5], ["Pet paw print", 5],
        ["State pride (ex. I <3 NY)", 5], ["Military/veteran", 5], ["Religious symbol", 5],
        ["Disney", 5], ["Band/music", 5], ["'Coexist'", 5], ["Marathon (13.1 / 26.2)", 5],
        ["Makes you laugh", 5], ["Makes you upset", 5], ["'Honk if...'", 5],
        ["'I brake for...'", 5], ["'My other car is...'", 5], ["'Got ___?'", 5],
      ]},
      { label: "Dashboard & Mirror", cards: [
        ["Fuzzy dice", 5], ["Rubber ducky", 5], ["Waving cat", 5],
        ["Rosary beads", 5], ["Flower", 5], ["Hawaiian lei", 5],
      ]},
      { label: "Windows & Glass", cards: [
        ["Sun shield in car", 5], ["Marker window writing", 5],
      ]},
      { label: "People & Gestures", cards: [
        ["Stranger waves back", 15], ["Truck driver honks back", 10],
        ["Someone sleeping in another car", 5], ["Feet on the dash", 5],
        ["Car blasting music", 5], ["Dog with head out window", 5],
      ]},
    ],
  },
  {
    id: "wildlife", label: "Wildlife",
    groups: [
      { label: "Farm & Domestic", cards: [
        ["Cow", 5], ["Horse", 5], ["Goat", 5], ["Sheep", 5], ["Cat", 5],
      ]},
      { label: "Common", cards: [
        ["Squirrel", 5], ["Rabbit", 5], ["Raccoon", 10], ["Possum", 10],
        ["Deer", 10], ["Wild turkey", 10],
      ]},
      { label: "Birds", cards: [
        ["Seagull", 5], ["Pigeon", 5], ["Hawk/eagle", 10],
      ]},
      { label: "Rare", cards: [
        ["Llama/alpaca", 15], ["Fox", 15], ["Elk", 20], ["Moose", 25], ["Bear", 30],
      ]},
    ],
  },
  {
    id: "water", label: "Water",
    groups: [
      { label: null, cards: [
        ["Lake", 5], ["Pond", 5], ["River", 5], ["Stream/creek", 5],
        ["Reservoir", 5], ["Marsh/swamp", 5], ["Canal", 5], ["Ocean", 5],
      ]},
    ],
  },
  {
    id: "places", label: "Places",
    groups: [
      { label: "Farm & Rural", cards: [
        ["Barn", 5], ["Silo", 5], ["Cornfield", 5], ["Farm stand", 10],
        ["Grain elevator", 5], ["Vineyard", 5], ["Orchard", 5], ["Windmill/turbine", 5],
      ]},
      { label: "Road Infrastructure", cards: [
        ["Bridge", 5], ["Covered bridge", 15], ["Tunnel", 5],
        ["Toll booth", 5], ["State welcome sign", 5], ["Water tower", 5],
        ["Drawbridge - closed", 10], ["Drawbridge - open", 15],
      ]},
      { label: "Scenic & Historic", cards: [
        ["Scenic overlook", 5], ["Historical marker or sign", 5],
        ["Waterfall", 15], ["Lighthouse", 15], ["Ferry", 15], ["Drive-in movie theater", 25],
      ]},
      { label: "Schools & Community", cards: [
        ["Elementary school", 5], ["Middle school", 5], ["High school", 5],
        ["College/university", 15], ["Daycare", 5], ["Public park", 5], ["Community garden", 10],
        ["Playground", 5], ["Cemetery", 5],
      ]},
      { label: "Sports & Recreation", cards: [
        ["Sports stadium/arena", 10], ["Baseball field", 5],
        ["Football field", 5], ["Soccer field", 5], ["Basketball court", 5],
        ["Tennis/pickleball court", 5], ["Golf course", 5], ["Mini golf course", 10],
        ["Driving range", 5], ["Campground", 10], ["State park", 10], ["National park", 25],
      ]},
      { label: "Attractions & Entertainment", cards: [
        ["Amusement park", 15], ["Water park", 15], ["Aquarium", 10],
        ["Museum", 10], ["Zoo", 10], ["Casino", 5], ["Town carnival or fair", 10],
      ]},
      { label: "Everyday Stops", cards: [
        ["Gas station", 5], ["Rest stop", 5], ["Mall", 5], ["Car dealership", 5],
        ["Storage facility", 5], ["Brewery", 5], ["Porta potty", 5], ["Park and ride", 5],
        ["Weigh station", 5],
      ]},
      { label: "Transit & Civic", cards: [
        ["Train station", 5], ["Bus station", 5], ["Police station", 5], ["Fire station", 5],
      ]},
      { label: "Structures & Roads", cards: [
        ["Abandoned building", 5], ["House for sale", 5],
        ["Political lawn sign", 5], ["Smoke stacks", 5], ["Pool - above ground", 5],
        ["Pool - in-ground", 5], ["Dirt road", 10], ["Cobblestone road", 10],
      ]},
    ],
  },
  {
    id: "signs", label: "Signs",
    groups: [
      { label: "Exits & Markers", cards: [
        ["1-digit exit sign", 5], ["2-digit exit sign", 5], ["3-digit exit sign", 5],
        ["Exit 67", 5], ["Mile marker 123", 10], ["Someone's birthday exit number", 15],
      ]},
      { label: "Interstates", cards: [
        ["Even interstate number", 5], ["Odd interstate number", 5],
      ]},
      { label: "Road Features", cards: [
        ["Grooved road", 10], ["Hill grade warning sign", 15],
        ["Construction zone", 5], ["Train tracks", 5], ["Drive through a state capital", 25],
      ]},
      { label: "Word Play", cards: [
        ["Real word spelled out on a plate", 10],
        ["Unnecessary apostrophe on a sign", 5], ["Same name as someone in the car", 5],
      ]},
    ],
  },
  {
    id: "town-names", label: "Town Names",
    groups: [
      { label: "Directions", cards: [
        ["North", 5], ["South", 5], ["East", 5], ["West", 5],
      ]},
      { label: "Descriptors", cards: [
        ["Old", 5], ["New", 5], ["Point", 5],
      ]},
      { label: "Endings", cards: [
        ["-ville", 5], ["-boro/-borough", 5], ["-town/-ton/-towne", 5],
        ["-bury/-berry", 5], ["-field", 5], ["-bridge", 5], ["-valley", 5], ["-falls", 5], ["-lane", 5],
      ]},
      { label: "Wildcard", cards: [
        ["Same town name in a different state", 5],
      ]},
    ],
  },
  {
    id: "street-types", label: "Street Types",
    groups: [
      { label: "Very Common", cards: [
        ["Street", 5], ["Road", 5], ["Drive", 5], ["Avenue", 5], ["Lane", 5],
        ["Court", 5], ["Boulevard", 5], ["Way", 5], ["Place", 5], ["Circle", 5],
      ]},
      { label: "Common", cards: [
        ["Terrace", 10], ["Trail", 10], ["Highway", 10], ["Parkway", 10], ["Loop", 10],
        ["Square", 10], ["Crossing", 10], ["Ridge", 10], ["Run", 10], ["Landing", 10], ["Bend", 10],
      ]},
      { label: "Less Common", cards: [
        ["Pike/Turnpike", 15], ["Expressway", 15], ["Freeway", 15], ["Alley", 15],
        ["Crescent", 15], ["Walk", 15], ["Point/Pointe", 15], ["Grove", 15], ["Glen", 15],
        ["Hollow", 15], ["Pass", 15], ["Row", 15], ["Cove", 15], ["Extension", 15], ["Plaza", 15],
      ]},
    ],
  },
  {
    id: "speed-limits", label: "Speed Limits", style: "sign",
    groups: [
      { label: null, cards: [
        ["5", 5], ["10", 5], ["15", 5], ["20", 5], ["25", 5], ["30", 5], ["35", 5], ["40", 5],
        ["45", 5], ["50", 5], ["55", 5], ["60", 5], ["65", 5], ["70", 5], ["75", 10], ["80", 10],
      ]},
    ],
  },
  {
    id: "oddities", label: "Oddities",
    groups: [
      { label: null, cards: [
        ["Trash on the side of the road", 5], ["Furniture on the side of the road", 5],
        ["Tire on the side of the road", 5], ["Tire skid marks", 5], ["Graffiti", 5],
        ["Homemade sign on a bridge", 5], ["Roadside cross", 5],
      ]},
    ],
  },
  {
    id: "interactive", label: "Sounds",
    groups: [
      { label: null, cards: [
        ["Car beeping", 5], ["Truck air brakes", 5], ["Train horn", 5], ["Church bells", 5],
        ["Rumble strips", 5], ["Loud motorcycle pipes", 5],
      ]},
    ],
  },
  {
    id: "family", label: "Family",
    groups: [
      { label: "The Classics", cards: [
        ["'Are we there yet?'", 5], ["'I'm hungry'", 5], ["'Can we have a snack?'", 5],
        ["'I have to pee'", 5], ["'I'm tired'", 5], ["'I'm bored'", 5], ["'What can I do?'", 5],
      ]},
      { label: "Sounds & Smells", cards: [
        ["Fart - loud", 5], ["Fart - stinky", 5], ["Burp", 5], ["Sneeze", 5],
        ["Snoring in the car", 5], ["Cow manure smell", 5], ["Skunk smell", 5],
      ]},
      { label: "Car Life", cards: [
        ["Falling asleep in the car", 5], ["Food falls on the floor", 5],
        ["Toy/activity falls on the floor", 5], ["Urgent bathroom break", 5],
      ]},
    ],
  },
  {
    id: "weather", label: "Weather",
    groups: [
      { label: null, cards: [
        ["Rain", 5], ["Snow", 10], ["Lightning", 10], ["Thunder", 10],
        ["Sunrise", 15], ["Sunset", 15], ["Rainbow", 25],
      ]},
    ],
  },
  {
    id: "novelty", label: "Billboards", hidden: true,
    groups: [
      { label: null, cards: [
        ["Lawyer billboard", 5], ["Jesus billboard", 5],
      ]},
    ],
  },
];

export const COLOR_SWATCHES = {
  "White": "#ffffff", "Black": "#1a1a1a", "Gray/Silver": "#b0b4b8", "Blue": "#2f5fa8", "Red": "#c8302e",
  "Green": "#2f7d4f", "Brown/Tan": "#a08356", "Yellow": "#f2ce39", "Orange": "#e8762c", "Purple": "#7a4b9e",
  "Gold": "#c9a227", "Turquoise/Teal": "#3aa8a0", "Fuchsia/Pink": "#d6479b", "Lime/Bright green": "#8dc63f",
  "Multi-color": "multi",
};

/** A card scoring this many points or more gets the RARE ribbon. */
export const RARE_THRESHOLD = 50;
