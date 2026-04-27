// app.js — Pokédex 
// Author: Joanalyn Cadampog

/* ------------------------------------------------
   DATA: Type weakness table and colors
------------------------------------------------ */

const TYPE_WEAKNESSES = {
  normal:   ['fighting'],
  fire:     ['water', 'ground', 'rock'],
  water:    ['electric', 'grass'],
  grass:    ['flying', 'poison', 'bug', 'steel', 'fire', 'ice'],
  electric: ['ground'],
  ice:      ['fighting', 'rock', 'steel', 'fire'],
  fighting: ['flying', 'psychic', 'fairy'],
  poison:   ['ground', 'psychic'],
  ground:   ['water', 'grass', 'ice'],
  flying:   ['electric', 'rock', 'ice'],
  psychic:  ['bug', 'ghost', 'dark'],
  bug:      ['flying', 'rock', 'fire'],
  rock:     ['water', 'grass', 'fighting', 'ground', 'steel'],
  ghost:    ['ghost', 'dark'],
  dragon:   ['ice', 'dragon', 'fairy'],
  dark:     ['fighting', 'bug', 'fairy'],
  steel:    ['fighting', 'ground', 'fire'],
  fairy:    ['poison', 'steel'],
};

// Used for card stripes and the glow behind the modal image.
const TYPE_COLORS = {
  normal:   '#9099A1',
  fire:     '#e25822',
  water:    '#4A90D9',
  grass:    '#5a9e3a',
  electric: '#F8D030',
  ice:      '#61c4c4',
  fighting: '#C03028',
  poison:   '#8B3FA8',
  ground:   '#d4a637',
  flying:   '#7777cc',
  psychic:  '#dd3377',
  bug:      '#7a9c1e',
  rock:     '#9c8a44',
  ghost:    '#4c4488',
  dragon:   '#5522ee',
  dark:     '#5a4030',
  steel:    '#8888aa',
  fairy:    '#dd88bb',
};

const OAK_MESSAGES = [
  "There are {count} Pokémon registered in your Pokédex!",
  "Wild Pokémon appear! Click a card to view its data.",
  "This Pokémon has unique strengths. Study its stats!",
  "A new discovery! The world of Pokémon is vast.",
  "Remember: every Pokémon has something special about it!",
  "Use the search bar to find your favorite Pokémon!",
];

/* ------------------------------------------------
   STATE: Variables that track what the app is doing
------------------------------------------------ */
let allPokemons    = [];    // every Pokémon loaded so far
let currentOffset  = 0;    
let currentModalId = null; // ID of the Pokémon in the open modal
let activeFilter   = 'all'; // current type filter
const PAGE_SIZE    = 10;
const seenTypes    = new Set(); // unique types we've encountered

/* ------------------------------------------------
   DOM REFERENCES
------------------------------------------------ */
const introScreen  = document.getElementById('intro-screen');
const startBtn     = document.getElementById('start-btn');
const appDiv       = document.getElementById('app');
const grid         = document.getElementById('pokemon-grid');
const loadingMsg   = document.getElementById('loading-msg');
const noResults    = document.getElementById('no-results');
const loadMoreBtn  = document.getElementById('load-more-btn');
const loadMoreArea = document.getElementById('load-more-area');
const searchInput  = document.getElementById('search-input');
const clearSearch  = document.getElementById('clear-search');
const sortSelect   = document.getElementById('sort-select');
const typeFilters  = document.getElementById('type-filters');
const caughtCount  = document.getElementById('caught-count');
const oakText      = document.getElementById('oak-text');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const prevBtn      = document.getElementById('prev-btn');
const nextBtn      = document.getElementById('next-btn');
const battleFlash  = document.getElementById('battle-flash');

/* ------------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------ */

// Pad an ID to 3 digits: 1 → "001", 25 → "025"
function padId(id) {
  return String(id).padStart(3, '0');
}

function getSpriteUrl(id) {
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${padId(id)}.png`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get all weakness types for a given array of type names
function getWeaknesses(typeNames) {
  const weakSet = new Set();
  typeNames.forEach(type => {
    (TYPE_WEAKNESSES[type] || []).forEach(w => weakSet.add(w));
  });
  return [...weakSet];
}

// Create a colored <span> type badge element
function makeTypeBadge(typeName) {
  const span = document.createElement('span');
  span.className = `type-badge type-${typeName}`;
  span.textContent = typeName;
  return span;
}

function showOakMessage(message) {
  oakText.textContent = '';
  let index = 0;

  const interval = setInterval(() => {
    oakText.textContent += message[index];
    index++;
    if (index >= message.length) clearInterval(interval);
  }, 22);
}

// Trigger the white battle-flash screen animation
function doBattleFlash() {
  battleFlash.classList.add('flash');
  setTimeout(() => battleFlash.classList.remove('flash'), 500);
}

// Pick a color for a stat bar based on its value
function getStatColor(value) {
  if (value >= 100) return '#4CAF50'; // green  — excellent
  if (value >= 70)  return '#8BC34A'; // light green — good
  if (value >= 50)  return '#FFC107'; // yellow — average
  if (value >= 30)  return '#FF9800'; // orange — below average
  return '#F44336';                   // red    — very low
}

/* ------------------------------------------------
   Used the official PokéAPI (https://pokeapi.co/) to get Pokémon information.
------------------------------------------------ */

async function fetchPokemons() {
  loadingMsg.classList.remove('hidden');
  loadMoreArea.style.display = 'none';

  try {
    // Step 1: Get a list of Pokémon names + their individual URLs
    const listRes  = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${currentOffset}`);
    const listData = await listRes.json();

    // Step 2: Fetch full details for all of them at the same time
    const details = await Promise.all(
      listData.results.map(p => fetch(p.url).then(r => r.json()))
    );

    // Step 3: Add to master list and advance the offset
    allPokemons = allPokemons.concat(details);
    currentOffset += PAGE_SIZE;

    // Step 4: Record any new types we've seen
    details.forEach(pokemon => {
      pokemon.types.forEach(t => seenTypes.add(t.type.name));
    });

    // Step 5: Rebuild the type filter buttons
    renderTypeFilters();

    // Step 6: Rebuild the card grid 
    renderCards();

     // Step 7: Update the "X seen" counter in the header
    caughtCount.textContent = allPokemons.length;

    // Step 8: fun message from me 
    showOakMessage(OAK_MESSAGES[0].replace('{count}', allPokemons.length));

  } catch (error) {
    // Something went wrong (e.g. no internet, API down)
    console.error('Error loading Pokémon:', error);
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:#ff6b6b;">
        <p style="font-size:32px">😵</p>
        <p style="margin-top:12px">Could not load Pokémon. Check your internet connection!</p>
      </div>
    `;
  }

// Always hide the spinner and restore the Load More button
  loadingMsg.classList.add('hidden');
  loadMoreArea.style.display = 'block';
}

/* ------------------------------------------------
   RENDER CARDS: Apply search/sort/filter and draw the grid
------------------------------------------------ */

function renderCards() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const sortBy     = sortSelect.value;

  // Filter by search term and active type
  let filtered = allPokemons.filter(pokemon => {
    const matchesSearch = pokemon.name.includes(searchTerm) || String(pokemon.id).includes(searchTerm);
    const types = pokemon.types.map(t => t.type.name);
    const matchesType = activeFilter === 'all' || types.includes(activeFilter);
    return matchesSearch && matchesType;
  });

  // Sort the results
  filtered.sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name) : a.id - b.id
  );

  grid.innerHTML = '';

 // Show "no results" message if nothing matched
  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  // Build a card for each Pokémon
  filtered.forEach((pokemon, index) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.style.animationDelay = `${index * 40}ms`;

    const primaryType = pokemon.types[0].type.name;
    const stripeColor = TYPE_COLORS[primaryType] || '#888';
    const typeBadgesHTML = pokemon.types
      .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-type-stripe" style="background:${stripeColor}"></div>
      <div class="card-bg-id">${padId(pokemon.id)}</div>
      <img
        class="card-img"
        src="${getSpriteUrl(pokemon.id)}"
        alt="${pokemon.name}"
        loading="lazy"
        onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'"
      />
      <div class="card-id">#${padId(pokemon.id)}</div>
      <div class="card-name">${capitalize(pokemon.name)}</div>
      <div class="types-row">${typeBadgesHTML}</div>
    `;

    card.addEventListener('click', () => {
      doBattleFlash();
      setTimeout(() => openModal(pokemon.id), 150);
    });

    grid.appendChild(card);
  });
}

/* ------------------------------------------------
   RENDER TYPE FILTERS: Rebuild the filter button bar
------------------------------------------------ */

function renderTypeFilters() {
  //Always start with the All button
  typeFilters.innerHTML = `
    <button
      class="type-filter-btn ${activeFilter === 'all' ? 'active' : ''}"
      data-type="all"
    >All</button>
  `;
 
  //Sort types alphabetically, then add a button for each
  [...seenTypes].sort().forEach(typeName => {
    const btn = document.createElement('button');
    btn.className = 'type-filter-btn' + (activeFilter === typeName ? ' active' : '');
    btn.dataset.type = typeName;
    btn.textContent  = capitalize(typeName);
    typeFilters.appendChild(btn);
  });
}