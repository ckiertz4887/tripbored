export type WwwAnimal = {
  readonly id: string;
  readonly name: string;
  readonly atk: number;
  readonly atkName: string;
  readonly def: number;
  readonly defName: string | null;
  readonly spd: number;
  readonly size: number;
  readonly superlatives: readonly string[];
  readonly photoUrl: string | null;
  readonly photoAttribution: string | null;
};

export type WwwMatchup = {
  readonly id: string;
  readonly animalA: string;
  readonly animalB: string;
};

export type WwwCategory = {
  readonly id: string;
  readonly label: string;
  readonly animals: readonly WwwAnimal[];
  readonly matchups: readonly WwwMatchup[];
};

export const VOTE_THRESHOLD = 50;

// Stats are placeholders — to be researched and filled in before launch.
// ATK/DEF/SPD/SIZE all on a 1–10 scale anchored against the full animal kingdom,
// not just within wild cats. See design doc for rubric anchors.
const WILD_CAT_ANIMALS: readonly WwwAnimal[] = [
  {
    id: "tiger",
    name: "Tiger",
    atk: 9, atkName: "Crushing Ambush",
    def: 7, defName: null,
    spd: 7, size: 9,
    superlatives: ["Most powerful big cat", "Can take down prey twice its size"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg",
    photoAttribution: "Tisha Mukherjee / CC BY-SA 4.0",
  },
  {
    id: "siberian-tiger",
    name: "Siberian Tiger",
    atk: 9, atkName: "Arctic Strike",
    def: 8, defName: "Winter Coat",
    spd: 6, size: 10,
    superlatives: ["Largest cat on Earth", "Survives -40° winters"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b9/P.t.altaica_Tomak_Male.jpg",
    photoAttribution: "Appaloosa / CC BY-SA 3.0",
  },
  {
    id: "lion",
    name: "Lion",
    atk: 8, atkName: "Pride Rush",
    def: 7, defName: "Mane Shield",
    spd: 7, size: 8,
    superlatives: ["Only social cat", "Males fight to the death for their pride"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg",
    photoAttribution: "Giles Laurent / CC BY-SA 4.0",
  },
  {
    id: "jaguar",
    name: "Jaguar",
    atk: 9, atkName: "Skull Crush",
    def: 6, defName: null,
    spd: 7, size: 7,
    superlatives: ["Strongest bite-to-size of any cat", "Bites through turtle shells"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    photoAttribution: "U.S. Fish and Wildlife Service / Public Domain",
  },
  {
    id: "leopard",
    name: "Leopard",
    atk: 7, atkName: "Tree Drag",
    def: 6, defName: null,
    spd: 8, size: 6,
    superlatives: ["Hauls prey up trees to protect it", "Most adaptable big cat"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/African_leopard_male_%28cropped%29.jpg",
    photoAttribution: "Sumeet Moghe / CC BY-SA 4.0",
  },
  {
    id: "snow-leopard",
    name: "Snow Leopard",
    atk: 7, atkName: "High-Altitude Lunge",
    def: 5, defName: null,
    spd: 8, size: 5,
    superlatives: ["Hunts at 18,000 ft altitude", "Can't roar — only chuffs"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Irbis4.JPG",
    photoAttribution: "Irbis1983 / Public Domain",
  },
  {
    id: "cheetah",
    name: "Cheetah",
    atk: 6, atkName: "Blur Tackle",
    def: 3, defName: null,
    spd: 10, size: 5,
    superlatives: ["Fastest land animal — 70 mph", "Sacrificed strength for pure speed"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/Male_cheetah_facing_left_in_South_Africa.jpg",
    photoAttribution: "AfricanConservation / CC BY-SA 4.0",
  },
  {
    id: "cougar",
    name: "Cougar",
    atk: 7, atkName: "Death Leap",
    def: 6, defName: null,
    spd: 7, size: 6,
    superlatives: ["Widest range of any land mammal", "Lives from Canada to Patagonia"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Mountain_Lion_in_Glacier_National_Park.jpg",
    photoAttribution: "National Park Service / Public Domain",
  },
  {
    id: "clouded-leopard",
    name: "Clouded Leopard",
    atk: 7, atkName: "Canine Lock",
    def: 5, defName: null,
    spd: 7, size: 4,
    superlatives: ["Longest canines relative to skull of any living cat", "Walks upside-down on branches"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Neofelis_nebulosa%2C_Clouded_leopard.jpg",
    photoAttribution: "Rushenb / CC BY-SA 4.0",
  },
  {
    id: "eurasian-lynx",
    name: "Eurasian Lynx",
    atk: 6, atkName: "Throat Hold",
    def: 5, defName: null,
    spd: 6, size: 5,
    superlatives: ["Largest lynx species", "Takes down full-grown deer alone"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/49/Lynx_Nationalpark_Bayerischer_Wald_01.jpg",
    photoAttribution: "Aconcagua / CC BY-SA 3.0",
  },
  {
    id: "canadian-lynx",
    name: "Canadian Lynx",
    atk: 5, atkName: "Snow Pounce",
    def: 4, defName: "Snowshoe Paws",
    spd: 6, size: 4,
    superlatives: ["Built for deep snow — paws act like snowshoes", "Tracks snowshoe hares for miles"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Canada_lynx_by_Michael_Zahra_%28cropped%29.jpg",
    photoAttribution: "Michael Zahra / CC BY-SA 3.0",
  },
  {
    id: "iberian-lynx",
    name: "Iberian Lynx",
    atk: 5, atkName: "Silent Stalk",
    def: 4, defName: null,
    spd: 6, size: 3,
    superlatives: ["Rarest wild cat on Earth (~1,000 left)", "Came back from the edge of extinction"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Lince_ib%C3%A9rico_%28Lynx_pardinus%29%2C_Almuradiel%2C_Ciudad_Real%2C_Espa%C3%B1a%2C_2021-12-19%2C_DD_07.jpg",
    photoAttribution: "Diego Delso / CC BY-SA 4.0",
  },
  {
    id: "caracal",
    name: "Caracal",
    atk: 6, atkName: "Bird Snatch",
    def: 4, defName: null,
    spd: 7, size: 4,
    superlatives: ["Leaps 10 ft to snatch birds mid-flight", "Fastest cat of its size"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/African_Caracal_%283837748712%29.jpg",
    photoAttribution: "Steve Jurvetson / CC BY 2.0",
  },
  {
    id: "serval",
    name: "Serval",
    atk: 6, atkName: "Pinpoint Pounce",
    def: 3, defName: null,
    spd: 7, size: 3,
    superlatives: ["Highest kill rate of any wild cat", "Can hear prey moving underground"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/66/African-serval-cat-close-up.jpg",
    photoAttribution: "Sheila Brown / CC0",
  },
  {
    id: "ocelot",
    name: "Ocelot",
    atk: 5, atkName: "Night Strike",
    def: 4, defName: null,
    spd: 6, size: 3,
    superlatives: ["Double-jointed ankles let it climb upside-down", "Supreme night ambush hunter"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/016_Ocelot_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
    photoAttribution: "Giles Laurent / CC BY-SA 4.0",
  },
  {
    id: "fishing-cat",
    name: "Fishing Cat",
    atk: 5, atkName: "Hook Swipe",
    def: 5, defName: null,
    spd: 5, size: 3,
    superlatives: ["Swims underwater to ambush fish", "Shockingly aggressive for its size"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Portrait_of_a_Fishing_Cat_at_Taronga.jpg",
    photoAttribution: "Bjørn Christian Tørrissen / CC BY-SA 3.0",
  },
  {
    id: "bobcat",
    name: "Bobcat",
    atk: 5, atkName: "Bob-and-Strike",
    def: 4, defName: null,
    spd: 6, size: 3,
    superlatives: ["Most common wild cat in North America", "Thrives in deserts, forests, and swamps"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Bobcat_%28Lynx_rufus%29_portrait.jpg",
    photoAttribution: "Alan Vernon / CC BY 2.0",
  },
  {
    id: "sand-cat",
    name: "Sand Cat",
    atk: 4, atkName: "Desert Dart",
    def: 5, defName: "Heat Resistance",
    spd: 6, size: 2,
    superlatives: ["Survives 125°F heat with no water needed", "Disappears into sand — nearly impossible to track"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Sand_cat_%28Kuwait%29.jpg",
    photoAttribution: "Alahamali70 / CC BY-SA 4.0",
  },
  {
    id: "pallas-cat",
    name: "Pallas's Cat",
    atk: 4, atkName: "Rock Ambush",
    def: 5, defName: "Dense Fur Armor",
    spd: 4, size: 2,
    superlatives: ["Densest fur of any cat", "Looks twice its actual size"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Pallas%27s_cat_%28Otocolobus_manul%29_in_Zooparc_de_Tr%C3%A9gomeur%2C_2025.jpg",
    photoAttribution: "Animalculum / CC BY 4.0",
  },
  {
    id: "margay",
    name: "Margay",
    atk: 4, atkName: "Canopy Drop",
    def: 3, defName: null,
    spd: 7, size: 2,
    superlatives: ["Only cat that can climb headfirst down trees", "Rotates ankles 180° — grips like a squirrel"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/32/Margaykat_Leopardus_wiedii.jpg",
    photoAttribution: "Malene Thyssen / CC BY-SA 3.0",
  },
];

export const WWW_CATEGORIES: readonly WwwCategory[] = [
  {
    id: "wild-cats",
    label: "Wild Cats",
    animals: WILD_CAT_ANIMALS,
    matchups: [
      { id: "tiger-vs-lion",               animalA: "tiger",          animalB: "lion" },
      { id: "siberian-tiger-vs-jaguar",     animalA: "siberian-tiger", animalB: "jaguar" },
      { id: "leopard-vs-snow-leopard",      animalA: "leopard",        animalB: "snow-leopard" },
      { id: "cheetah-vs-cougar",            animalA: "cheetah",        animalB: "cougar" },
      { id: "clouded-leopard-vs-margay",    animalA: "clouded-leopard",animalB: "margay" },
      { id: "eurasian-lynx-vs-canadian-lynx", animalA: "eurasian-lynx", animalB: "canadian-lynx" },
      { id: "iberian-lynx-vs-bobcat",       animalA: "iberian-lynx",   animalB: "bobcat" },
      { id: "serval-vs-caracal",            animalA: "serval",         animalB: "caracal" },
      { id: "ocelot-vs-fishing-cat",        animalA: "ocelot",         animalB: "fishing-cat" },
      { id: "sand-cat-vs-pallas-cat",       animalA: "sand-cat",       animalB: "pallas-cat" },
    ],
  },
];

export function getAnimal(category: WwwCategory, id: string): WwwAnimal | undefined {
  return category.animals.find((a) => a.id === id);
}

// Computed advantage: weighted sum of stats as a tiebreaker before real votes exist.
// Weights: ATK 40%, SPD 25%, SIZE 20%, DEF 15%
export function computedAdvantage(animal: WwwAnimal): number {
  return animal.atk * 0.4 + animal.spd * 0.25 + animal.size * 0.2 + animal.def * 0.15;
}
