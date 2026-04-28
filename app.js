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
   FAVORITES 
------------------------------------------------ */

//Load the saved list from localStorage 
function getFavorites() {
  const stored = localStorage.getItem('pokedex-favorites');
  return stored ? JSON.parse(stored) : [];
}
 
//Save the updated list back to localStorage
function saveFavorites(favs) {
  localStorage.setItem('pokedex-favorites', JSON.stringify(favs));
}
 
//Returns true if the given Pokémon ID is in the favorites list.
function isFavorite(pokemonId) {
  return getFavorites().includes(pokemonId);
}
 
//Add or remove a Pokémon from favorites, then refresh the UI.
function toggleFavorite(pokemonId) {
  let favs = getFavorites();
 
  if (favs.includes(pokemonId)) {
    // It's already a favorite → remove it
    favs = favs.filter(id => id !== pokemonId);
  } else {
    // Not yet a favorite → add it
    favs.push(pokemonId);
  }
 
  saveFavorites(favs);
 
  //Refresh the card grid and the modal button to reflect the new state
  renderCards();
  updateModalFavBtn(pokemonId);
}
 
//Updates the heart button inside the modal to show the current favorite state.
function updateModalFavBtn(pokemonId) {
  const favIcon  = document.getElementById('modal-fav-icon');
  const favLabel = document.getElementById('modal-fav-label');
 
  if (isFavorite(pokemonId)) {
    modalFavBtn.classList.add('is-fav');
    favIcon.textContent  = '❤️';
    favLabel.textContent = 'Favorited!';
  } else {
    modalFavBtn.classList.remove('is-fav');
    favIcon.textContent  = '🤍';
    favLabel.textContent = 'Add to Favorites';
  }
}

/* ------------------------------------------------
   SOUND
------------------------------------------------ */
function playClick() {
  const ctx  = new AudioContext();
  //An oscillator generates a simple tone.
  const osc  = ctx.createOscillator();
  //A GainNode controls volume.
  const gain = ctx.createGain();
 
  osc.connect(gain);
  gain.connect(ctx.destination);
 
  osc.type      = 'square'; 
  osc.frequency.value = 880; 
 
  //Fade the volume out quickly 
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
 
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/* ------------------------------------------------
   Used the official PokéAPI (https://pokeapi.co/) to get Pokémon information.
------------------------------------------------ */


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
  const favs       = getFavorites();

  // Filter by search term and active type
  let filtered = allPokemons.filter(pokemon => {
    const matchesSearch =
      pokemon.name.includes(searchTerm) ||
      String(pokemon.id).includes(searchTerm);
 
    const types       = pokemon.types.map(t => t.type.name);
    const matchesType =
      activeFilter === 'all'       ? true :
      activeFilter === 'favorites' ? favs.includes(pokemon.id) :
      types.includes(activeFilter);
 
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
    card.style.background =
      `linear-gradient(145deg, ${typeColor}22 0%, var(--card-bg) 60%)`;

    const typeBadgesHTML = pokemon.types
      .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
      .join('');

    const isFav = favs.includes(pokemon.id);

    card.innerHTML = `
      <div class="card-type-stripe" style="background:${stripeColor}"></div>
      <div class="card-bg-id">${padId(pokemon.id)}</div>
      <img
        class="card-img"
        src="${getSpriteUrl(pokemon.id)}"
        alt="${pokemon.name}"
        loading="lazy"
        //In renderCards(), update the card img tag
        onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'"
      />
      <div class="card-id">#${padId(pokemon.id)}</div>
      <div class="card-name">${capitalize(pokemon.name)}</div>
      <div class="types-row">${typeBadgesHTML}</div>
    `;

    // Clicking the heart button toggles favorite
    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // prevent the card click from firing
      playClick();
      toggleFavorite(pokemon.id);
    });

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

/* ------------------------------------------------
   MODAL: Open the detail popup for a given Pokémon ID
------------------------------------------------ */

async function openModal(pokemonId) {
  currentModalId = pokemonId;

  // Show the modal immediately with placeholder content
  modalOverlay.classList.remove('hidden');
  document.getElementById('modal-name').textContent     = 'Loading...';
  document.getElementById('modal-id-chip').textContent  = `#${padId(pokemonId)}`;
  document.getElementById('modal-img').src              = getSpriteUrl(pokemonId);
  document.getElementById('modal-types').innerHTML      = '';
  document.getElementById('modal-info-grid').innerHTML  = '';
  document.getElementById('modal-weaknesses').innerHTML = '';
  document.getElementById('modal-stats').innerHTML      = '';
  document.getElementById('modal-moves').innerHTML      = '';
  
  // Disable nav buttons until data loads
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  try {
    // Fetch Pokémon data and species data at the same time
    const [pokemonData, speciesData] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(r => r.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`).then(r => r.json()),
    ]);

    // English category (e.g. "Seed Pokémon")
    const genusObj   = speciesData.genera?.find(g => g.language.name === 'en');
    const category   = genusObj ? genusObj.genus : 'Unknown';

    // English Pokédex description
    const flavorEntry = speciesData.flavor_text_entries?.find(e => e.language.name === 'en');
    const description = flavorEntry
      ? flavorEntry.flavor_text.replace(/\f|\n/g, ' ')
      : 'No description available.';

    // Types, weaknesses, and colors
    const typeNames   = pokemonData.types.map(t => t.type.name);
    const weaknesses  = getWeaknesses(typeNames);
    const bgColor     = TYPE_COLORS[typeNames[0]] || '#888';

    // Fill hero section
    document.getElementById('modal-hero').style.background =
      `linear-gradient(135deg, ${bgColor}33 0%, transparent 70%)`;
    document.getElementById('modal-bg-circle').style.background = bgColor;
    document.getElementById('modal-name').textContent    = capitalize(pokemonData.name);
    document.getElementById('modal-id-chip').textContent = `#${padId(pokemonData.id)}`;

    // Fill type badges
    const typesDiv = document.getElementById('modal-types');
    typesDiv.innerHTML = '';
    typeNames.forEach(t => typesDiv.appendChild(makeTypeBadge(t)));

    // Fill info grid
    const infoGrid = document.getElementById('modal-info-grid');
    infoGrid.innerHTML = '';
    const infoItems = [
      { label: 'Category',    value: category },
      { label: 'Height',      value: `${(pokemonData.height / 10).toFixed(1)} m` },
      { label: 'Weight',      value: `${(pokemonData.weight / 10).toFixed(1)} kg` },
      { label: 'Base Exp',    value: pokemonData.base_experience ?? '—' },
      { label: 'Abilities',   value: pokemonData.abilities.map(a => capitalize(a.ability.name)).join(', ') },
      { label: 'Description', value: description },
    ];
    infoItems.forEach(item => {
      const cell = document.createElement('div');
      cell.className = 'info-cell';
      if (item.label === 'Description' || item.label === 'Abilities') {
        cell.style.gridColumn = '1 / -1';
      }
      cell.innerHTML = `
        <div class="info-cell-label">${item.label}</div>
        <div class="info-cell-value" style="font-size:${item.label === 'Description' ? '12px' : ''}">
          ${item.value}
        </div>
      `;
      infoGrid.appendChild(cell);
    });

    // Fill weaknesses
    const weakDiv = document.getElementById('modal-weaknesses');
    weakDiv.innerHTML = '';
    if (weaknesses.length === 0) {
      weakDiv.innerHTML = '<span style="color:var(--muted)">None</span>';
    } else {
      weaknesses.forEach(w => weakDiv.appendChild(makeTypeBadge(w)));
    }

    // Fill stat bars
    const statsDiv = document.getElementById('modal-stats');
    statsDiv.innerHTML = '';
    pokemonData.stats.forEach(s => {
      const value = s.base_stat;
      const pct   = Math.min((value / 150) * 100, 100);
      const color = getStatColor(value);
      const row   = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <div class="stat-label">${s.stat.name.replace('special-', 'sp. ')}</div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width:0%; background:${color}"></div>
        </div>
        <div class="stat-value">${value}</div>
      `;
      statsDiv.appendChild(row);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.stat-bar-fill').style.width = `${pct}%`;
        });
      });
    });

    // Fill moves (first 10)
    const movesDiv = document.getElementById('modal-moves');
    movesDiv.innerHTML = '';
    pokemonData.moves.slice(0, 10).forEach((m, i) => {
      const chip = document.createElement('div');
      chip.className = 'move-chip';
      chip.style.animationDelay = `${i * 50}ms`;
      chip.textContent = capitalize(m.move.name.replace(/-/g, ' '));
      movesDiv.appendChild(chip);
    });

    // Set up Prev / Next buttons
    prevBtn.disabled = pokemonId <= 1;
    nextBtn.disabled = false;
    updateNavButtonNames(pokemonId);

    showOakMessage(`${capitalize(pokemonData.name)} — ${description.substring(0, 80)}...`);

  } catch (error) {
    console.error('Error loading Pokémon detail:', error);
    document.getElementById('modal-name').textContent = 'Error loading data!';
  }
}

// Update the Previous / Next button labels with the neighbouring Pokémon names
function updateNavButtonNames(currentId) {
  document.getElementById('prev-name').textContent = 'Previous';
  document.getElementById('next-name').textContent = 'Next';

  if (currentId > 1) {
    prevBtn.disabled = false;
    const prev = allPokemons.find(p => p.id === currentId - 1);
    if (prev) document.getElementById('prev-name').textContent = capitalize(prev.name);
  } else {
    prevBtn.disabled = true;
  }

  const next = allPokemons.find(p => p.id === currentId + 1);
  if (next) document.getElementById('next-name').textContent = capitalize(next.name);
}


// Close the modal
function closeModal() {
  modalOverlay.classList.add('hidden');
  currentModalId = null;
}

/* ------------------------------------------------
   EVENT LISTENERS: Connect UI interactions to functions
------------------------------------------------ */

//PRESS START button
startBtn.addEventListener('click', () => {
  doBattleFlash();
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    appDiv.classList.remove('hidden');
    fetchPokemons(); // load the first 10 Pokémon
  }, 600);
});

// Search: re-render as the user types
searchInput.addEventListener('input', () => {
  clearSearch.style.display = searchInput.value ? 'block' : 'none';
  renderCards();
});

// Clear (✕) button: reset the search
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.style.display = 'none';
  searchInput.focus();
  renderCards();
});

// Sort dropdown: re-render when changed
sortSelect.addEventListener('change', renderCards);

// Type filter buttons: filter by the clicked type
typeFilters.addEventListener('click', (event) => {
  const btn = event.target.closest('.type-filter-btn');
  if (!btn) return;
  activeFilter = btn.dataset.type;
  document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCards();
  showOakMessage(
    activeFilter === 'all'
      ? 'Showing all Pokémon!'
      : `Showing ${capitalize(activeFilter)}-type Pokémon!`
  );
});

//Load More button
loadMoreBtn.addEventListener('click', () => fetchPokemons());

//close with the ✕ button
modalClose.addEventListener('click', closeModal);

//close by clicking the dark backdrop
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) closeModal();
});

//Previous Pokémon button
prevBtn.addEventListener('click', () => {
  if (currentModalId > 1) {
    doBattleFlash();
    setTimeout(() => openModal(currentModalId - 1), 150);
  }
});

//Next Pokémon button
nextBtn.addEventListener('click', () => {
  doBattleFlash();
  setTimeout(() => openModal(currentModalId + 1), 150);
});

//tab switching (Info / Stats / Moves)
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });
});

//Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Escape: close the modal
  if (event.key === 'Escape') {
    closeModal();
  }
 
  // Arrow keys: navigate Pokémon while the modal is open
  if (currentModalId !== null) {
    if (event.key === 'ArrowLeft' && currentModalId > 1) {
      doBattleFlash();
      setTimeout(() => openModal(currentModalId - 1), 150);
    }
    if (event.key === 'ArrowRight') {
      doBattleFlash();
      setTimeout(() => openModal(currentModalId + 1), 150);
    }
  }
});