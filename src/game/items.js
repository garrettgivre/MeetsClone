// Foods and toys. `taste` matches the pet's taste gene: favourite tastes fill
// more and make the pet happier. `color` foods change body colour after 5 meals.

export const FOODS = {
  // meals: fill hunger
  riceball:    { name: 'Rice Ball',     kind: 'meal',  taste: 'savory', price: 0, free: true },
  milk:        { name: 'Milk',          kind: 'meal',  taste: 'sweet',  price: 0, free: true, babyOnly: true },
  omelette:    { name: 'Omelette',      kind: 'meal',  taste: 'savory', price: 30 },
  noodles:     { name: 'Noodles',       kind: 'meal',  taste: 'savory', price: 40 },
  curry:       { name: 'Curry',         kind: 'meal',  taste: 'spicy',  price: 45 },
  pancake:     { name: 'Pancakes',      kind: 'meal',  taste: 'sweet',  price: 40 },
  fruitbowl:   { name: 'Fruit Bowl',    kind: 'meal',  taste: 'fruity', price: 40 },
  berrypie:    { name: 'Berry Pie',     kind: 'meal',  taste: 'fruity', price: 60, color: 'blue' },
  tomatosoup:  { name: 'Tomato Soup',   kind: 'meal',  taste: 'savory', price: 60, color: 'red' },
  lemoncake:   { name: 'Lemon Cake',    kind: 'meal',  taste: 'sweet',  price: 60, color: 'gold' },
  grapejelly:  { name: 'Grape Jelly',   kind: 'meal',  taste: 'fruity', price: 60, color: 'violet' },
  mintpudding: { name: 'Mint Pudding',  kind: 'meal',  taste: 'sweet',  price: 60, color: 'mint' },
  peachbun:    { name: 'Peach Bun',     kind: 'meal',  taste: 'fruity', price: 60, color: 'pink' },
  // snacks: raise happiness, too many cause a toothache
  cookie:      { name: 'Cookie',        kind: 'snack', taste: 'sweet',  price: 15 },
  candy:       { name: 'Candy',         kind: 'snack', taste: 'sweet',  price: 10 },
  icecream:    { name: 'Ice Cream',     kind: 'snack', taste: 'sweet',  price: 25 },
  chips:       { name: 'Chips',         kind: 'snack', taste: 'savory', price: 15 },
  juice:       { name: 'Juice',         kind: 'snack', taste: 'fruity', price: 15 },
  chilipuff:   { name: 'Chili Puff',    kind: 'snack', taste: 'spicy',  price: 20 },
};

// `where`: the room a toy is played with in. What belongs out of doors is played with in the garden, the rest in the bedroom.
export const TOYS = {
  ball:    { name: 'Ball',    price: 80,  where: 'garden' },
  yoyo:    { name: 'Yo-yo',   price: 100, where: 'bedroom' },
  blocks:  { name: 'Blocks',  price: 100, where: 'bedroom' },
  kite:    { name: 'Kite',    price: 120, where: 'garden' },
  drum:    { name: 'Drum',    price: 120, where: 'bedroom' },
  plushie: { name: 'Plushie', price: 150, where: 'bedroom' },
};

export const COLOR_FOOD_MEALS = 5;

// Clothing is bought and worn, never inherited. Teens and adults can dress up.
// `color` is the item's own colour ramp (the id doubles as the art key).
// `set` marks the two pieces made to go with a furniture set (src/game/decor.js): a hat and something for the neck.
export const SLOTS = ['head', 'face', 'body', 'back', 'feet'];
export const SLOT_LABEL = { head: 'HEAD', face: 'FACE', body: 'BODY', back: 'BACK', feet: 'FEET' };
export const CLOTHES = {
  bow:      { name: 'Bow',          slot: 'head', price: 60,  color: 'pink' },
  ribbon:   { name: 'Side Ribbon',  slot: 'head', price: 60,  color: 'red' },
  cap:      { name: 'Cap',          slot: 'head', price: 80,  color: 'blue' },
  beret:    { name: 'Beret',        slot: 'head', price: 90,  color: 'red' },
  tiara:    { name: 'Tiara',        slot: 'head', price: 250, color: 'sky' },
  crown:    { name: 'Crown',        slot: 'head', price: 300, color: 'gold' },
  glasses:  { name: 'Glasses',      slot: 'face', price: 80,  color: 'slate' },
  shades:   { name: 'Shades',       slot: 'face', price: 100, color: 'slate' },
  monocle:  { name: 'Monocle',      slot: 'face', price: 150, color: 'gold' },
  bandaid:  { name: 'Bandage',      slot: 'face', price: 20,  color: 'cream' },
  sticker:  { name: 'Star Sticker', slot: 'face', price: 30,  color: 'gold' },
  bowtie:   { name: 'Bow Tie',      slot: 'body', price: 70,  color: 'red' },
  tie:      { name: 'Necktie',      slot: 'body', price: 70,  color: 'indigo' },
  scarf:    { name: 'Scarf',        slot: 'body', price: 80,  color: 'orange' },
  sweater:  { name: 'Sweater',      slot: 'body', price: 110, color: 'green' },
  overalls: { name: 'Overalls',     slot: 'body', price: 120, color: 'blue' },
  dress:    { name: 'Dress',        slot: 'body', price: 140, color: 'pink' },
  collar:   { name: 'Sailor Top',   slot: 'body', price: 100, color: 'blue' },
  apron:    { name: 'Apron',        slot: 'body', price: 60,  color: 'gold' },
  sash:     { name: 'Sash',         slot: 'body', price: 90,  color: 'violet' },
  cape:     { name: 'Cape',         slot: 'back', price: 160, color: 'red' },
  heartclip:  { name: 'Heart Clip',     slot: 'head', price: 90,  color: 'pink',   set: 'sweet' },
  locket:     { name: 'Heart Locket',   slot: 'body', price: 110, color: 'pink',   set: 'sweet' },
  nightcap:   { name: 'Nightcap',       slot: 'head', price: 110, color: 'indigo', set: 'starry' },
  starcharm:  { name: 'Star Charm',     slot: 'body', price: 110, color: 'gold',   set: 'starry' },
  toadstool:  { name: 'Toadstool Hat',  slot: 'head', price: 120, color: 'red',    set: 'forest' },
  kerchief:   { name: 'Leaf Kerchief',  slot: 'body', price: 80,  color: 'orange', set: 'forest' },
  sailor:     { name: 'Sailor Cap',     slot: 'head', price: 100, color: 'blue',   set: 'seaside' },
  shells:     { name: 'Shell Necklace', slot: 'body', price: 90,  color: 'pink',   set: 'seaside' },
  beanie:     { name: 'Beanie',         slot: 'head', price: 90,  color: 'mint',   set: 'modern' },
  headphones: { name: 'Headphones',     slot: 'body', price: 140, color: 'mint',   set: 'modern' },
  partyhat:   { name: 'Party Hat',      slot: 'head', price: 90,  color: 'pink',   set: 'squiggle' },
  ruff:       { name: 'Zigzag Ruff',    slot: 'body', price: 100, color: 'pink',   set: 'squiggle' },
  visor:      { name: 'Sun Visor',      slot: 'head', price: 100, color: 'sky',    set: 'aqua' },
  bubbles:    { name: 'Bubble Beads',   slot: 'body', price: 110, color: 'sky',    set: 'aqua' },
  witchhat:   { name: 'Witch Hat',      slot: 'head', price: 130, color: 'violet', set: 'hollow' },
  batbow:     { name: 'Bat Bow Tie',    slot: 'body', price: 90,  color: 'slate',  set: 'hollow' },
  shoes:    { name: 'Shoes',        slot: 'feet', price: 70,  color: 'red' },
};
