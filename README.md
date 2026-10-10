# MeetsClone (working title)

A mobile-first virtual pet for the browser, inspired by the gameplay of *Tamagotchi Meets / Tamagotchi On*. All characters, art and names are original.

## Play

- **Online:** https://garrettgivre.github.io/MeetsClone/
- **Locally:** run a static server from the project folder, then open http://localhost:5173

```bash
python -m http.server 5173
```

**Settings → Debug** has the review pages (Pairing Lab, Character Gallery, Sprite Editor and the art sheets) and, once you switch **Cheats** on there (or add `?dev` to the URL), menus for testing: grow or change the pet, set its needs, illness, dirt and training, skip time, open the town, fill the toy box, and send a test alert. The version number is at the bottom of Settings.

**Pairing Lab:** open `tools/lab.html` (also on the live site) to test genetics.
- **One pair:** choose two parents (random or founders), see a litter of children with any new traits starred, inspect any child's genes, and use it as a new parent. Shows the odds of every trait from 500 simulated children.
- **Random pairings:** many random couples and their kids at once.
- **Lineage:** follow one family line across several generations.

The seed makes results repeatable, and "Random clothes" previews outfits.

## Controls

| | Button | Keyboard | Touch |
|---|---|---|---|
| Next / move cursor | **A** | ← / → / Z | tap an icon directly |
| Select | **B** | Enter / Space / X | tap a menu row |
| Back | **C** | Esc / Backspace / C | tap the menu title bar |

Tap your pet to give it a pat, and tap poop to clean it up.

## What's in the first build

- **The pet's room:** a hand-pixelled bedroom (curtained window, bed, bedside lamp, shelf of keepsakes, toy chest) whose window shows the sun and a drifting cloud by day, sunset colours at dusk, and the moon and stars at night; with the lights off it sinks to moonlit silhouettes.
- **Screen filter** (Settings; three styles, LCD, Soft and Off): the default LCD style is after a colour-screen Tamagotchi's panel, with a fine pixel grid, blacks and whites that are not quite black or white, and a short trail behind whatever moves. The Soft style is the earlier filter: makes the picture look like an old handheld's LCD rather than raw pixels, with slightly softened pixel edges, faint shadows under dark shapes, a hint of the screen's cell grid and a glassy sheen. Turn it off for plain sharp pixels.
- **Custom pixel engine:** a 128×224 portrait screen with a 64-colour palette, a bitmap font, square-wave sound and a 30 Hz loop. Pets are drawn at double pixel density (256×448), so they have finer detail than the room and menus. Faces are hand-drawn at that density; other hand-drawn parts are upscaled with Scale2x and their outlines thinned.
- **Life cycle with the device's timings:** egg (3 min), baby (1 h), child (24 h), teen (24 h), adult. Adults can marry after 24 h.
- **Care:**
  - Hunger and happiness hearts, poop, sickness, bedtime and lights.
  - Attention calls and care mistakes.
  - Toothaches from too many snacks.
  - **Discipline:** children, teens and (less often) adults throw whims, calling for nothing or refusing a meal. Tap a fussing pet to scold it (builds discipline) or comfort it (happier, but spoiled). A fully disciplined pet stops fussing, and an unruly generation-1 pet grows into a lower-tier founder.
  - **Weight:** meals add a gram, snacks two, and every game burns one off. A chubby pet gets sick more easily.
  - **Baths:** a pet gets grubby through the day (faster with poop on the floor), and it shows as mud on its coat. A dirty pet falls ill more easily and a filthy one calls for a bath. **Clean** on the top row sweeps the floor, runs a bath or sends the pet to the toilet.
  - **Toilet training:** a pet squirms for a few minutes before it poops. Tap it (or use Clean → Toilet) to get it there in time. After four catches it is toilet trained: it goes by itself from then on, and learns a point of discipline.
- **Skills:** Smarts, Arts, Sports and Charm, each with five levels (Status → Training). School teaches two classes a day (Manners, Reading, Art or Gym; free for children and teens, a small fee for adults), a good minigame gives a point in its skill, and so do chatting with residents, swimming, the playground and performing. A child starts with a third of what its parent learned.
- **Jobs:** any adult can help out at the Workshop. Its job board has eight better jobs that ask for a skill level; apply without it and you're turned down. Every third shift in the same job earns a promotion and a raise.
- **Care alerts** (Settings → Care alerts): browser notifications when your pet is hungry, sad, sick, filthy, needs the toilet, falls asleep with the lights on, hatches or grows. The game has no server, so alerts only arrive while it is still open somewhere: a background tab, a minimised window or the installed app. On an iPhone, add the game to the Home Screen first.
- **Pets can die or run away:** from untreated illness or starvation, or from long unhappiness.
- **Generation 1:** the quality of your care decides which of 7 original founders your pet becomes: Kitsu the ember fox, Gloop the lemon jelly, Lotl the pond axolotl, Ryu the storm dragon, Glimmer the lantern jellyfish, Inchy the garden caterpillar or Hoolet the moon owlet. Every pet is hand-pixel art with breathing, blinking and expression animation (see `docs/STYLE.md`).
- **Seven body plans:** biped, blob, four-legged, floater, serpent, bird and drake. A pet's form is a gene, and every body part is drawn separately for every form, so an axolotl-line child with a jellyfish's body plan still looks hand-made.
- **Founders are the genetic lines:** every body part belongs to exactly one founder, and no two founders share a part. The Pairing Lab shows which line each part comes from.
- **Genetics:** every trait has two alleles with dominance, so recessive traits can skip a generation. Having no tail, topper or wings neither beats nor loses to having one (a coin flip), so a rare part can show in the first mixed litter.
  - Body plans are codominant (a coin flip between the parents), colours can blend or drift around the colour wheel, and rare mutations happen.
  - Base parts every pet has: head, body, eyes, ears, mouth, markings and forehead mark. Optional parts: tail, topper, feet, nose, wings and hair. Plus body, accent, eye and hair colour.
  - Temperament genes (appetite, energy, taste) change how the pet plays.
  - The status screen shows the hidden genes a pet carries.
- **Clothing is not genetic:** buy hats, glasses, outfits, a cape and shoes in the shop, and dress teens and adults in the Wardrobe (Items menu). Hats, glasses and neckwear show on the pet; each furniture set has a hat and a neck piece to match it.
- **Diet colours:** eating a coloured food 5 times changes body colour, and the new colour is passed on to children.
- **Economy:** Gotchi Points, shops in town for food, toys and clothes, and favourite foods and toys.
- **Daily wishes:** each day the pet wants three things (a food, a game, a bath, a trip into town...); granting them pays points, and all three pay a bonus. They are on the first Status page, under the pet's hunger and happiness.
- **A vegetable bed and a kitchen to cook in:** plant seeds in the garden, water them each day and pick the crop; then try two ingredients together at the stove to find recipes. Home-cooked dishes fill more than shop food.
- **A house of four rooms:** garden, kitchen, bedroom and bathroom, side by side. Tap the arrows at the edges, swipe, or press C to walk next door; the pet goes to the kitchen to eat at its table, the bathroom to use its own bath and toilet, and its bedroom to sleep; outdoor toys are played with in the garden, where there is also something to play on, and indoor toys in the bedroom.
- **Decorating:** every room has its own slots (the bedroom's ten are wallpaper, floor, window, picture, shelf, lamp, bed, rug and two corners). Furniture comes in themed sets from the Department Store; buy a set or single pieces, mix them freely in Items > Decorate, and a room dressed all in one set earns a bonus.
- **Minigames:** Jump Rope and Snack Catch (Sports), Which Way? (guess where your pet hops; Smarts) and Copy Me (repeat your pet's left/right dance; Arts).
- **Family:** a matchmaker (3 partners a day, each a wild pet from one of the founder lines with a twist or two), a wedding, the next-generation egg, and a family album.
- **Town** (bottom row): 23 places to visit, each with its own backdrop and a resident who becomes a friend the more you chat (with gifts at 3 and 7 hearts).
  - **The town grows up with you.** Whoever keeps a place holds it for two weeks: new and young at first, then grown, then old (grey-haired, with a walking stick, nodding off). Halfway through they have a baby, who grows up beside them in the shop and takes the place over when they retire. Children inherit their looks from their parent and a partner from out of town, so each family drifts over the generations, and every save's families turn out differently. Half of your friendship passes on to the child. **Town news** at the top of the map lists the latest babies and retirements, and a place with a keeper you haven't met is marked NEW. The Elder of the Hidden Village and Stella of Star Isle never age.
  - **Town families at the matchmaker:** the child who inherits a place has a brother or sister who doesn't. Once grown, they may be the one the matchmaker introduces ("Chef Momo's daughter") instead of a stranger. Marrying one is town news, earns two hearts at their family's place, and their sibling will mention it.
  - **Sunset Cottages** (Downtown): where keepers go when they retire. Gran Willow looks after them; step from neighbour to neighbour, chat about the places they used to run, and hear one story a day (a point of Smarts).
  - **Downtown** (walk): Town Square (fountain fortunes), Park (daily stroll finds), Playground, Cafe (dish of the day), Bakery, Toy Shop, Boutique, Arcade (all the minigames), Hospital (treatment and check-ups) and Sunset Cottages (the retired keepers).
  - **Uptown** (Bus Pass): Department Store (with a daily sale), Beauty Salon (hair dye, not inherited), School (two classes a day), Workshop (shifts and the job board), Wedding Chapel (the matchmaker) and Photo Studio (a photo album).
  - **Seaside** (Train Pass): Beach (swimming and shells), Forest (foraging), Amusement Park and Concert Hall (daily shows and fans).
  - **Far Away** (Balloon Ticket): Royal Castle (well-mannered pets only, and a crown on the first visit) and Star Isle (a wish gives your next egg a part you've never found).
  - **Hidden Village:** find three pieces of an old map in the park and forest. Its elder introduces you to a founder's family, for a partner with pure founder genes.
- **Gene Book** (Family menu): every body plan, part and body colour, shown on a little pet, with silhouettes for ones not found yet. Your pets fill it in as they grow into their looks, and so do the partners they marry. Each find pays points, and finding every part of a founder's line pays a bonus.
- **Install:** Settings → Install app adds the game to your phone or computer as its own app (where the browser supports it).
- **Saving:** automatic saves, catch-up for time spent away, and backup and restore codes.
- **Updates:** the game checks for a newer release when it starts (and when you come back to it) and reloads into it, so you never play a stale copy. It also opens without a connection, using the last copy it fetched.

## Project layout

```
index.html, style.css     page shell: the screen, and a black strip with the three buttons (left A, middle B, right C)
src/engine/               pixel engine: palette, screen, sprites, font, input, audio
src/art/                  all pixel art (sprites as text grids); pets in src/art/pets/forms/
src/game/                 simulation, genetics, rendering, items, saving
src/scenes/               home, menus, status, minigames, family, endings
tests/                    node --test unit tests for game logic
tools/sprite-editor/      in-browser editor for the sprite format
tools/gallery.html        preview growth stages, expressions, poses and every option of each gene (?gene=tail&form=quad)
tools/parts.html          every hand-drawn part: one row per allele, one column per form
tools/lab.html            Pairing Lab: breed any two pets, inspect genes, odds, random pairings, lineages
tools/founders.html       founder review sheets (?f=Name&s=560 for one, ?grid for the set, ?grid&sil for silhouettes)
tools/compare.html        art review: founders, children, wild pets, growth, expressions
tools/town.html           every town backdrop at full detail (?only=park&z=3, &pets for scale)
tools/props.html          the hand-pixelled town props, enlarged (?only=a,b&z=4)
tools/icons.html          the small sprites, foods, toys and wardrobe icons, enlarged (?only=TUB,riceball&z=6)
tools/art-scripts/        drafting helpers: town_kit.py for town props, draft.py / ed.py for pet parts
tools/sketch.mjs          silhouette drafts for hand-pixelling new characters
tools/dump.mjs            print a composed pet as text for pixel-level review
sw.js                     service worker: fetches files fresh (offline copy as a fallback) and shows care alerts
docs/                     research notes and the build plan
```

## Development

```bash
npm test
```

Tests run in Node 22 with no dependencies.

### Deploying

Every push to `main` runs the tests and publishes the site with GitHub Actions. This needs a one-time setup in the GitHub repo: go to **Settings → Pages** and set **Source** to **GitHub Actions**.
