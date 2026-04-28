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
   STATE
------------------------------------------------ */
let allPokemons    = [];
let currentOffset  = 0;
let currentModalId = null;
let activeFilter   = 'all';
let isShiny        = false;
const PAGE_SIZE    = 10;
const seenTypes    = new Set();
let searchResults  = null;   // null = use allPokemons; array = API search results
let searchDebounce = null;

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
const randomBtn    = document.getElementById('random-btn');
const shinyBtn     = document.getElementById('shiny-btn');
const modalFavBtn  = document.getElementById('modal-fav-btn');
const scrollTopBtn = document.getElementById('scroll-top-btn');

/* ------------------------------------------------
   HELPERS
------------------------------------------------ */
function padId(id) {
  return String(id).padStart(3, '0');
}

function getSpriteUrl(id) {
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${padId(id)}.png`;
}

function getShinyUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWeaknesses(typeNames) {
  const weakSet = new Set();
  typeNames.forEach(type => {
    (TYPE_WEAKNESSES[type] || []).forEach(w => weakSet.add(w));
  });
  return [...weakSet];
}

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

function doBattleFlash() {
  battleFlash.classList.add('flash');
  setTimeout(() => battleFlash.classList.remove('flash'), 500);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatColor(value) {
  if (value >= 100) return '#4CAF50';
  if (value >= 70)  return '#8BC34A';
  if (value >= 50)  return '#FFC107';
  if (value >= 30)  return '#FF9800';
  return '#F44336';
}

/* ------------------------------------------------
   FAVORITES
------------------------------------------------ */
function getFavorites() {
  const stored = localStorage.getItem('pokedex-favorites');
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favs) {
  localStorage.setItem('pokedex-favorites', JSON.stringify(favs));
}

function isFavorite(pokemonId) {
  return getFavorites().includes(pokemonId);
}

function toggleFavorite(pokemonId) {
  let favs = getFavorites();
  if (favs.includes(pokemonId)) {
    favs = favs.filter(id => id !== pokemonId);
  } else {
    favs.push(pokemonId);
  }
  saveFavorites(favs);
  renderCards();
  updateModalFavBtn(pokemonId);
  renderTypeFilters();
}

// FIX: was crashing because modal-fav-icon / modal-fav-label didn't exist in HTML.
// They now exist, so this is safe. Guard added for extra safety.
function updateModalFavBtn(pokemonId) {
  if (!modalFavBtn) return;
  const favIcon  = document.getElementById('modal-fav-icon');
  const favLabel = document.getElementById('modal-fav-label');

  if (isFavorite(pokemonId)) {
    modalFavBtn.classList.add('is-fav');
    if (favIcon)  favIcon.textContent  = '❤️';
    if (favLabel) favLabel.textContent = 'Favorited!';
  } else {
    modalFavBtn.classList.remove('is-fav');
    if (favIcon)  favIcon.textContent  = '🤍';
    if (favLabel) favLabel.textContent = 'Add to Favorites';
  }
}

/* ------------------------------------------------
   SOUND
------------------------------------------------ */
function playClick() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) { /* audio not critical */ }
}

/* ------------------------------------------------
   FETCH POKÉMON
------------------------------------------------ */
async function fetchPokemons() {
  loadingMsg.classList.remove('hidden');
  loadMoreArea.style.display = 'none';

  try {
    const listRes  = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${currentOffset}`);
    const listData = await listRes.json();

    const details = await Promise.all(
      listData.results.map(p => fetch(p.url).then(r => r.json()))
    );

    allPokemons = allPokemons.concat(details);
    currentOffset += PAGE_SIZE;

    details.forEach(pokemon => {
      pokemon.types.forEach(t => seenTypes.add(t.type.name));
    });

    renderTypeFilters();
    renderCards();
    caughtCount.textContent = allPokemons.length;
    showOakMessage(OAK_MESSAGES[0].replace('{count}', allPokemons.length));

  } catch (error) {
    console.error('Error loading Pokémon:', error);
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:#ff6b6b;">
        <p style="font-size:32px">😵</p>
        <p style="margin-top:12px">Could not load Pokémon. Check your internet connection!</p>
      </div>
    `;
  }

  loadingMsg.classList.add('hidden');
  loadMoreArea.style.display = 'block';
}

/* ------------------------------------------------
   RENDER CARDS
------------------------------------------------ */
/* ------------------------------------------------
   RENDER CARDS
   Uses `searchResults` when set (API search),
   otherwise filters `allPokemons` locally.
------------------------------------------------ */
function renderCards() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const sortBy     = sortSelect.value;
  const favs       = getFavorites();

  // If we have API search results, show them directly (skip local filter)
  let pool = searchResults !== null ? searchResults : allPokemons;

  let filtered = pool.filter(pokemon => {
    if (searchResults !== null) return true; // already searched via API

    const matchesSearch =
      pokemon.name.includes(searchTerm) ||
      String(pokemon.id).includes(searchTerm);

    const types = pokemon.types.map(t => t.type.name);
    const matchesType =
      activeFilter === 'all'       ? true :
      activeFilter === 'favorites' ? favs.includes(pokemon.id) :
      types.includes(activeFilter);

    return matchesSearch && matchesType;
  });

  filtered.sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name) : a.id - b.id
  );

  grid.innerHTML = '';

  if (filtered.length === 0 && searchResults !== null) {
    noResults.classList.remove('hidden');
    return;
  }
  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  filtered.forEach((pokemon, index) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.style.animationDelay = `${index * 40}ms`;

    const primaryType = pokemon.types[0].type.name;
    const typeColor   = TYPE_COLORS[primaryType] || '#888';

    card.style.setProperty('--type-color', typeColor);

    const typeBadgesHTML = pokemon.types
      .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
      .join('');

    const isFav = favs.includes(pokemon.id);

    card.innerHTML = `
      <div class="card-shine-stripe"></div>
      <div class="card-type-stripe" style="background: linear-gradient(90deg, ${typeColor}, ${typeColor}99)"></div>
      <div class="card-bg-id">${padId(pokemon.id)}</div>
      <button class="fav-btn ${isFav ? 'is-fav' : ''}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '❤️' : '🤍'}</button>
      <div class="card-img-wrap">
        <div class="card-img-glow" style="background: radial-gradient(circle, ${typeColor}55 0%, transparent 70%)"></div>
        <img
          class="card-img"
          src="${getSpriteUrl(pokemon.id)}"
          alt="${pokemon.name}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'"
        />
      </div>
      <div class="card-footer">
        <div class="card-id">#${padId(pokemon.id)}</div>
        <div class="card-name">${capitalize(pokemon.name)}</div>
        <div class="types-row">${typeBadgesHTML}</div>
      </div>
    `;

    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
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
   RENDER TYPE FILTERS (with Favorites tab)
------------------------------------------------ */
function renderTypeFilters() {
  const favCount = getFavorites().length;

  // All button
  typeFilters.innerHTML = `
    <button class="type-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-type="all">All</button>
  `;

  // Favorites tab — always shown
  const favBtn = document.createElement('button');
  favBtn.className = 'type-filter-btn' + (activeFilter === 'favorites' ? ' active' : '');
  favBtn.dataset.type = 'favorites';
  favBtn.textContent = `❤️ Favorites${favCount > 0 ? ` (${favCount})` : ''}`;
  typeFilters.appendChild(favBtn);

  // Type buttons
  [...seenTypes].sort().forEach(typeName => {
    const btn = document.createElement('button');
    btn.className = 'type-filter-btn' + (activeFilter === typeName ? ' active' : '');
    btn.dataset.type = typeName;
    btn.textContent  = capitalize(typeName);
    typeFilters.appendChild(btn);
  });
}

/* ------------------------------------------------
   MODAL
------------------------------------------------ */
async function openModal(pokemonId) {
  currentModalId = pokemonId;
  isShiny = false;

  // Reset shiny button
  if (shinyBtn) {
    shinyBtn.classList.remove('shiny-on');
    document.getElementById('shiny-label').textContent = 'Shiny';
  }

  modalOverlay.classList.remove('hidden');
  document.getElementById('modal-name').textContent     = 'Loading...';
  document.getElementById('modal-id-chip').textContent  = `#${padId(pokemonId)}`;
  document.getElementById('modal-img').src              = getSpriteUrl(pokemonId);
  document.getElementById('modal-types').innerHTML      = '';
  document.getElementById('modal-info-grid').innerHTML  = '';
  document.getElementById('modal-weaknesses').innerHTML = '';
  document.getElementById('modal-stats').innerHTML      = '';
  document.getElementById('modal-moves').innerHTML      = '';

  // Reset tabs to Info
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="info"]').classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('tab-info').classList.remove('hidden');

  prevBtn.disabled = true;
  nextBtn.disabled = true;

  // Update fav button immediately
  updateModalFavBtn(pokemonId);

  try {
    const [pokemonData, speciesData] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(r => r.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`).then(r => r.json()),
    ]);

    const genusObj   = speciesData.genera?.find(g => g.language.name === 'en');
    const category   = genusObj ? genusObj.genus : 'Unknown';

    const flavorEntry = speciesData.flavor_text_entries?.find(e => e.language.name === 'en');
    const description = flavorEntry
      ? flavorEntry.flavor_text.replace(/\f|\n/g, ' ')
      : 'No description available.';

    const typeNames  = pokemonData.types.map(t => t.type.name);
    const weaknesses = getWeaknesses(typeNames);
    const bgColor    = TYPE_COLORS[typeNames[0]] || '#888';

    document.getElementById('modal-hero').style.background =
      `linear-gradient(135deg, ${bgColor}33 0%, transparent 70%)`;
    document.getElementById('modal-bg-circle').style.background = bgColor;
    document.getElementById('modal-name').textContent    = capitalize(pokemonData.name);
    document.getElementById('modal-id-chip').textContent = `#${padId(pokemonData.id)}`;

    const typesDiv = document.getElementById('modal-types');
    typesDiv.innerHTML = '';
    typeNames.forEach(t => typesDiv.appendChild(makeTypeBadge(t)));

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

    const weakDiv = document.getElementById('modal-weaknesses');
    weakDiv.innerHTML = '';
    if (weaknesses.length === 0) {
      weakDiv.innerHTML = '<span style="color:var(--muted)">None</span>';
    } else {
      weaknesses.forEach(w => weakDiv.appendChild(makeTypeBadge(w)));
    }

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

    const movesDiv = document.getElementById('modal-moves');
    movesDiv.innerHTML = '';
    pokemonData.moves.slice(0, 10).forEach((m, i) => {
      const chip = document.createElement('div');
      chip.className = 'move-chip';
      chip.style.animationDelay = `${i * 50}ms`;
      chip.textContent = capitalize(m.move.name.replace(/-/g, ' '));
      movesDiv.appendChild(chip);
    });

    prevBtn.disabled = pokemonId <= 1;
    nextBtn.disabled = false;
    updateNavButtonNames(pokemonId);

    showOakMessage(`${capitalize(pokemonData.name)} — ${description.substring(0, 80)}...`);

  } catch (error) {
    console.error('Error loading Pokémon detail:', error);
    document.getElementById('modal-name').textContent = 'Error loading data!';
  }
}

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

function closeModal() {
  modalOverlay.classList.add('hidden');
  currentModalId = null;
  isShiny = false;
}

/* ------------------------------------------------
   SHINY TOGGLE
------------------------------------------------ */
function toggleShiny() {
  const img = document.getElementById('modal-img');
  isShiny = !isShiny;

  if (isShiny) {
    img.src = getShinyUrl(currentModalId);
    shinyBtn.classList.add('shiny-on');
    document.getElementById('shiny-label').textContent = 'Shiny ON';
    showOakMessage('Whoa! A shiny Pokémon! How rare!');
  } else {
    img.src = getSpriteUrl(currentModalId);
    shinyBtn.classList.remove('shiny-on');
    document.getElementById('shiny-label').textContent = 'Shiny';
  }
}

/* ------------------------------------------------
   EVENT LISTENERS
------------------------------------------------ */

// PRESS START
startBtn.addEventListener('click', () => {
  doBattleFlash();
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    appDiv.classList.remove('hidden');
    fetchPokemons();
  }, 600);
});

// Search — local filter first, then API lookup for unloaded Pokémon
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim();
  clearSearch.style.display = term ? 'block' : 'none';

  clearTimeout(searchDebounce);

  if (!term) {
    // Cleared — go back to normal browsing
    searchResults = null;
    noResults.classList.add('hidden');
    renderCards();
    return;
  }

  // Check if any locally loaded Pokémon match
  const localHits = allPokemons.filter(p =>
    p.name.toLowerCase().includes(term.toLowerCase()) ||
    String(p.id).includes(term)
  );

  if (localHits.length > 0) {
    // Enough local results — show immediately, no API call needed
    searchResults = null;
    renderCards();
    return;
  }

  // No local hits → debounce then hit the API
  showOakMessage('Searching the Pokédex...');
  searchDebounce = setTimeout(() => searchPokemonAPI(term), 420);
});

async function searchPokemonAPI(term) {
  const query = term.toLowerCase().trim();

  // Detect numeric search (exact ID lookup) vs name search
  const isNumeric = /^\d+$/.test(query);

  try {
    let results = [];

    if (isNumeric) {
      // Exact ID fetch
      const id = parseInt(query, 10);
      if (id >= 1 && id <= 1010) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (res.ok) results = [await res.json()];
      }
    } else {
      // Name fetch — PokéAPI supports direct name lookup
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (res.ok) {
        results = [await res.json()];
      } else {
        // Partial name: fetch the full list (lightweight — only names+urls)
        // and find all matches, then fetch details for up to 8
        const listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010&offset=0');
        const listData = await listRes.json();
        const matches = listData.results.filter(p => p.name.includes(query)).slice(0, 8);
        results = await Promise.all(matches.map(p => fetch(p.url).then(r => r.json())));
      }
    }

    // Merge any new results into allPokemons cache
    results.forEach(p => {
      if (!allPokemons.find(a => a.id === p.id)) {
        allPokemons.push(p);
        p.types.forEach(t => seenTypes.add(t.type.name));
      }
    });

    searchResults = results;
    renderCards();

    if (results.length === 0) {
      noResults.classList.remove('hidden');
      showOakMessage("Hmm... that Pokémon wasn't found in any region!");
    } else {
      noResults.classList.add('hidden');
      showOakMessage(`Found ${results.length} Pokémon matching "${term}"!`);
    }

  } catch (err) {
    console.error('Search API error:', err);
    searchResults = [];
    noResults.classList.remove('hidden');
    showOakMessage("Couldn't reach the Pokédex servers. Try again!");
  }
}

// Clear search
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.style.display = 'none';
  searchResults = null;
  searchInput.focus();
  renderCards();
});

// Sort
sortSelect.addEventListener('change', renderCards);

// Type filter buttons
typeFilters.addEventListener('click', (event) => {
  const btn = event.target.closest('.type-filter-btn');
  if (!btn) return;

  activeFilter = btn.dataset.type;
  document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  playClick();
  renderCards();
  showOakMessage(
    activeFilter === 'all'       ? 'Showing all Pokémon!' :
    activeFilter === 'favorites' ? `You have ${getFavorites().length} favorite Pokémon!` :
    `Showing ${capitalize(activeFilter)}-type Pokémon!`
  );
});

// Load More
loadMoreBtn.addEventListener('click', () => {
  playClick();
  fetchPokemons();
});

// Random
if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    const id = randomBetween(1, 898);
    playClick();
    doBattleFlash();
    setTimeout(() => openModal(id), 150);
    showOakMessage('A wild Pokémon appears! 🎲');
  });
}

// Modal close button
modalClose.addEventListener('click', () => {
  playClick();
  closeModal();
});

// Close on backdrop click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Favorite button in modal
if (modalFavBtn) {
  modalFavBtn.addEventListener('click', () => {
    if (currentModalId === null) return;
    playClick();
    toggleFavorite(currentModalId);
  });
}

// Shiny button
if (shinyBtn) {
  shinyBtn.addEventListener('click', () => {
    if (currentModalId === null) return;
    playClick();
    toggleShiny();
  });
}

// Click image to toggle shiny
document.getElementById('modal-img').addEventListener('click', () => {
  if (currentModalId === null) return;
  playClick();
  toggleShiny();
});

// Prev / Next
prevBtn.addEventListener('click', () => {
  if (currentModalId > 1) {
    playClick();
    doBattleFlash();
    setTimeout(() => openModal(currentModalId - 1), 150);
  }
});

nextBtn.addEventListener('click', () => {
  playClick();
  doBattleFlash();
  setTimeout(() => openModal(currentModalId + 1), 150);
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playClick();
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (currentModalId !== null) {
    if (e.key === 'ArrowLeft' && currentModalId > 1) {
      doBattleFlash();
      setTimeout(() => openModal(currentModalId - 1), 150);
    }
    if (e.key === 'ArrowRight') {
      doBattleFlash();
      setTimeout(() => openModal(currentModalId + 1), 150);
    }
  }
});

/* ------------------------------------------------
   HOLOGRAPHIC SHIMMER — track cursor per card
------------------------------------------------ */
grid.addEventListener('mousemove', (e) => {
  const card = e.target.closest('.pokemon-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width)  * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  card.style.setProperty('--mx', `${x}%`);
  card.style.setProperty('--my', `${y}%`);

  // Subtle 3-D tilt toward cursor
  const tiltX = ((y / 100) - 0.5) * 14;
  const tiltY = ((x / 100) - 0.5) * -14;
  card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.03)`;
});

grid.addEventListener('mouseover', (e) => {
  const prev = grid.querySelector('.pokemon-card[data-hovered]');
  const card  = e.target.closest('.pokemon-card');
  if (prev && prev !== card) {
    prev.style.transform = '';
    prev.removeAttribute('data-hovered');
  }
  if (card) card.setAttribute('data-hovered', '1');
});

grid.addEventListener('mouseleave', () => {
  const hovered = grid.querySelector('.pokemon-card[data-hovered]');
  if (hovered) { hovered.style.transform = ''; hovered.removeAttribute('data-hovered'); }
}, true);

// Scroll to top button
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}