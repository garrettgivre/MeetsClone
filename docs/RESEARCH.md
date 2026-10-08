# Research: Tamagotchi Meets / Tamagotchi On

Notes on the original device, collected October 2026. These notes cover what the device does. We are building a game that works the same way, with **our own characters, art and names** (see [Legal note](#legal-note)).

## The device

| | |
|---|---|
| Name | Tamagotchi Meets (Japan, Nov 23 2018); released internationally as **Tamagotchi On** (2019) |
| Maker | Bandai |
| Predecessor | Tamagotchi m!x (2016), which introduced gene mixing |
| Screen | 2.25" colour LCD; text is readable and animations are smooth. Exact resolution isn't published. The earlier Tamagotchi iD was 128×128 |
| Input | 3 buttons (A = cycle, B = select, C = back) |
| Connectivity | Bluetooth to other devices and to the phone app (Tamagotchi Meets App / Tamagotchi On App) |
| Editions | Magical, Fairy, Pastel, Sanrio, Fantasy, Sweets Meets; On: Magical Garden, Fairy Forest, Wonder Garden, etc. Each edition swaps some locations and residents |

## Core loop

1. An egg hatches into a **baby**, which grows through **child → teen → adult** stages.
2. You care for it: feed it, play games, clean up poop, give medicine, and let it sleep.
3. You earn **Gotchi Points** from games and spend them in shops on food, toys, accessories and room backgrounds.
4. You **travel** to locations, meet resident characters in the park, give them liked items, make friends, and **propose**.
5. After marrying, a **baby** is born whose looks are a **genetic mix of both parents**. The parents leave and you raise the baby. This repeats every generation.

## Life cycle and timing

| Stage | Length |
|---|---|
| Egg | A few minutes |
| Baby | About 1 hour. Travel is locked |
| Child (toddler) | About 24 hours. The happiness meter only fills halfway |
| Teen | About 24 hours |
| Adult | Can marry after **24 hours of unpaused adulthood**. Lives on until it marries or dies |

- **Generation 1:** the quality of your care decides which character it grows into.
- **Generation 2 onward:** care has no effect on looks. Looks are **100% decided by genes**.
- Pause and **Drop-Off** (leaving the pet at the Tama Hotel) stop time. A dropped-off pet comes back when it gets hungry or unhappy.

## Care stats

| Stat | Display | How to raise it | Notes |
|---|---|---|---|
| Hunger | Rice-ball icons | Meals from the fridge, restaurant, or travel shops | Favourite foods fill more slots. Adults show disgust at a plain rice bowl |
| Happiness | Hearts | Games, snacks, toys | Each adult has favourite toys that fill it faster |
| Health | Skull icon = sick; black ghost = critical | Medicine | Causes: empty hunger or happiness, uncleaned poop, chance. Too many snacks cause a toothache, which medicine also fixes |
| Poop | Shown on screen | Toilet / clean | Leaving it raises the chance of sickness |
| Sleep | Lights | Sleeps at night | Bedtime depends on stage |

- **Death:** a pet that hits a critical state too often can't be saved (sources say about 4 times as an adult).
- **Snacks** in the fridge are free but limited to 3 of each.

## Menus (from the device and guides)

Status, Food (fridge), Toilet, Medicine, Items (item box: toys and accessories), Room (backgrounds and menu themes), Travel, Games, Connection, Settings (clock, sound, pause).

## Genetics (the "Meets" in the name)

- The body is split into **4 inheritable parts**:
  1. **Body:** head, torso and mouth
  2. **Eyes**
  3. **Headgear:** hair, ears, hats
  4. **Accessory:** wings, capes, tails, back items
- The device has over 1,000 possible combinations.
- **Colour:** the child may get either parent's colour, a **blend** of both, or a **random** colour. Grandparents' genes can come back.
- **Diet changes colour:** eating a coloured food **5 times** changes body colour (yellow, red, blue, white, pink, purple, grey). Specific favourite foods can unlock special "golden" looks.
- **Gender:** every character is male or female. Proposals need opposite genders.
- A **fortune teller** (on the m!x) previews what a child of two pets would look like.
- **Twins** exist on the m!x and fans think the chance is inherited.

## Social: friends and marriage

- **Park residents:** each location has 2 to 5 fixed resident characters. Giving liked items raises friendship, and once you are friends a **Propose** option appears.
- **Matchmaker:** if you have no partner, the matchmaker brings a random suitable one.
- **Device-to-device:** Bluetooth meetings between two physical units allow play dates, friendship and marriage across devices.
- **Phone app:** your pet visits a virtual world, plays games, earns points and items, then comes back. Weddings also happen in the app.

## Locations (Magic/Fairy edition, with how each unlocks)

Most locations follow the same pattern: **Park** (meet residents), **Shop**, **Activity/minigame**, **Propose**.

| Location | Activity | How it unlocks |
|---|---|---|
| Tama Hotel | Resort info, Drop-Off | Open from the start |
| Gourmet Street | Sushi minigame | Eat Omelette Rice 5 times |
| Tama Farm | Water your own farm daily | Visit Gourmet Street about 10 times |
| Toy Park | Trampoline minigame | Wear the Drum accessory (gen 2+) and visit the garden |
| Sports Plaza | Sports Festival | Connect with 2+ devices, play with the Ball |
| Starry Sky Lab | Telescope | Use the Starry Sky background (gen 2+), visit the garden after 7 PM |
| Beauty Salon | Hair salon (temporary hairstyle) | Change colour twice in one stage (gen 3+) |
| Fairy Land / Magical Land | Ride (animation only) | Use the edition's living-room background (gen 3+), visit the garden at a set time |

**Design patterns to copy:**
- Unlocks come from **odd, specific actions**: eating something N times, using an item, or visiting at a certain time of day or a certain generation. This drives curiosity and replay.
- Each new location also adds a **menu background theme** you can collect.
- Some content only appears at certain **times of day** or in **later generations**.

## Minigames (earn Gotchi Points)

- **Jump Rope:** press on time to jump the rope; aim for 30 jumps.
- **Surfing**, **Dolphin**: Department Store games
- **Sushi**: Gourmet Street
- **Trampoline**: Toy Park
- Two games are available on the device from the start. Others unlock with locations.

## Gaps and assumptions

- **Exact screen resolution is unknown.** We'll choose our own (see PLAN.md).
- Precise meter decay rates and sickness chances aren't documented anywhere we found. We'll tune them ourselves.
- The full character list and part list come from fan wikis that blocked automated access. Since we're making our own characters, we don't need them.

## Legal note

Character names, sprites, logos and the "Tamagotchi" trademark belong to Bandai. Game mechanics aren't copyrightable, but art and names are. This project will use **original characters, original pixel art, original names and an original title**. That keeps it safe to host publicly on GitHub Pages. "Tamagotchi Meets" is only mentioned as inspiration.

## Sources

- [Tamagotchi On (Meets) Location Guide: vPet Paradise](https://vpetparadise.com/tamagotchi/on-meets/location-guide-unlock-methods/)
- [Tamagotchi On (Meets) Basic Care Guide: vPet Paradise](https://vpetparadise.com/tamagotchi/on-meets/basic-care-guide/)
- [Tamagotchi m!x: Generational Genetics, TamaVault](https://tamavault.com/devices/mix/)
- [Tamagotchi On: Tamagotchi Wiki](https://tamagotchi.fandom.com/wiki/Tamagotchi_On)
- [Tamagotchi Life Cycle: Tamagotchi Wiki](https://tamagotchi.fandom.com/wiki/Tamagotchi_Life_Cycle)
- [Gotchi Points: Tamagotchi Wiki](https://tamagotchi.fandom.com/wiki/Gotchi_Points)
- [A first look at the Tamagotchi On: Super Cute Kawaii](https://www.supercutekawaii.com/2019/09/a-first-look-at-the-tamagotchi-on)
- [Pre-order Tamagotchi Meets: ZenMarket](https://zenmarket.jp/en/blog/post/7709/preorder-tamagotchi-meets-2018)
