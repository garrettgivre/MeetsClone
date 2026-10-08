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

export const TOYS = {
  ball:    { name: 'Ball',    price: 80 },
  yoyo:    { name: 'Yo-yo',   price: 100 },
  blocks:  { name: 'Blocks',  price: 100 },
  kite:    { name: 'Kite',    price: 120 },
  drum:    { name: 'Drum',    price: 120 },
  plushie: { name: 'Plushie', price: 150 },
};

export const COLOR_FOOD_MEALS = 5;
