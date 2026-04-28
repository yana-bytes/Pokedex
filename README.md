# 📖 Pokédex

A modern, interactive Pokédex web application that lets you explore and catalog Pokémon with style. Built with vanilla JavaScript, featuring a sleek design, powerful search capabilities, and persistent favorites.

![Pokédex App](https://img.shields.io/badge/Version-1.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Active-brightgreen)

---

## ✅ Technical Assessment Requirements

This project **adapts all requirements** :

| Requirement | Implementation | Status |
|---|---|---|
| **Card View List** | Grid layout displaying ID, Name, Photo, and Type for each Pokémon | ✅ |
| **API Integration** | Uses PokéAPI v2 to fetch comprehensive Pokémon data | ✅ |
| **Image Assets** | Official artwork via `https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png` with proper 3-digit ID formatting (001, 002, etc.) | ✅ |
| **Search Functionality** | Real-time search by Pokémon ID number or name | ✅ |
| **Filtering & Sorting** | Filter by Type, Sort by ID or Name | ✅ |
| **Load More Feature** | "Load 10 More Pokémon" button for pagination (initial load: 10, expandable) | ✅ |
| **Detailed Info View** | Modal pop-up with comprehensive Pokémon information | ✅ |
| **Info Display** | Shows ID, Name, Height, Weight, Types, Categories, Stats, Abilities, Description | ✅ |
| **Type Weakness** | Calculated and displayed based on type matchups | ✅ |
| **Navigation** | Previous/Next buttons to browse through Pokémon by ID | ✅ |
| **Responsive Design** | Works seamlessly on desktop, tablet, and mobile devices | ✅ |
| **Modern Styling** | Professional dark theme with gradients, animations, and SVG logos | ✅ |

---

## ✨ Features

### Core Functionality
- **Browse Pokémon**: Load and explore Pokémon data in a beautiful card grid with infinite scrolling
- **Search & Filter**: Find Pokémon by name or ID number with instant results
- **Type Filtering**: Sort Pokémon by type (Fire, Water, Electric, etc.) with dynamically generated filter buttons
- **Sort Options**: Organize results by Pokémon ID or alphabetical name order
- **Detailed Modal**: View comprehensive information about each Pokémon including stats, moves, abilities, and weaknesses

### User Experience
- **Favorites System**: Save your favorite Pokémon to localStorage for quick access (stored locally on your device)
- **Responsive Design**: Beautiful, dark-themed interface that works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions, floating effects, and engaging visual feedback
- **Battle Flash Effects**: Interactive animations when opening Pokémon details
- **Keyboard Navigation**: Use arrow keys to navigate between Pokémon in the modal, Escape to close

### Advanced Features
- **Stat Visualization**: Color-coded stat bars showing HP, Attack, Defense, Speed, and special stats at a glance
- **Type Weakness Display**: See what types each Pokémon is weak to for better strategy
- **Move Lists**: View the first 10 learnable moves for each Pokémon
- **Category & Description**: Read official Pokédex entries and classifications
- **Height & Weight Info**: See detailed physical specifications

---

### No Installation Required
- Pure vanilla HTML, CSS, and JavaScript
- No npm packages or dependencies
- Works in all modern browsers
- Uses public PokéAPI (free, no authentication needed)

---

## 🎮 How to Use

### Exploring Pokémon
1. Click the **PRESS START** button to enter the Pokédex
2. Browse the grid of Pokémon cards
3. Use the **Load 10 More Pokémon** button to see additional entries
4. Scroll through the entire Pokédex with infinite loading

### Searching
- Use the **search bar** to find Pokémon by name (e.g., "Pikachu") or ID number (e.g., "25")
- Results update in real-time as you type
- Click the **✕ button** to clear your search

### Filtering by Type
- Click any **type button** below the search bar (Fire, Water, Electric, etc.)
- Only Pokémon of that type will be displayed
- Click **"All"** to show all Pokémon again
- Click **"Favorites"** to view only your saved Pokémon (if any exist)

### Sorting
- Use the **Sort dropdown** to organize by:
  - **By ID #**: Numerical order (National Pokédex)
  - **By Name**: Alphabetical order

### Viewing Details
1. **Click any Pokémon card** to open the detail modal
2. View information across three tabs:
   - **📋 Info**: Category, height, weight, base experience, abilities, and official description
   - **📊 Stats**: Visual stat bars for HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed
   - **⚡ Moves**: The first 10 learnable moves for this Pokémon
3. **Navigate** between Pokémon using the Previous/Next buttons or arrow keys
4. **Add to Favorites** by clicking the heart button (❤️)
5. **Close** the modal with the ✕ button or by pressing Escape

### Random Pokémon
- Click the **🎲 Random** button in the header to jump to a random Pokémon (1-898)
- Great for discovering new favorites!

---

## 🛠️ Technical Implementation

### Architecture & Key Concepts
This project demonstrates proficiency in:

#### **JavaScript ES6+ Features**
- **Async/Await**: Clean asynchronous API calls with `async function fetchPokemons()`
- **Promise.all()**: Parallel data fetching for efficient API usage
- **Template Literals**: Dynamic HTML generation with backticks
- **Arrow Functions**: Concise event handlers and array methods
- **Destructuring**: Extracting data from nested objects
- **Spread Operator**: Merging and duplicating arrays

#### **DOM Manipulation**
- `document.getElementById()`: Efficient element selection and caching
- `document.createElement()`: Dynamic card generation
- `addEventListener()`: Event delegation for interactive features
- `classList` manipulation: Dynamic styling and state management
- `innerHTML` updates: Efficient batch DOM updates

#### **Data Processing**
- **Array Methods**: `filter()`, `map()`, `sort()`, `find()`, `forEach()`
- **Set Data Structure**: Tracking unique types with `new Set()`
- **Object Iteration**: Working with nested API responses
- **String Methods**: Case conversion, trimming, padding for ID formatting

#### **API Integration**
- **Fetch API**: Making HTTP requests to PokéAPI
- **Error Handling**: Try/catch blocks for robust error management
- **Pagination**: Loading data in chunks (10 at a time) for performance
- **Parallel Requests**: `Promise.all()` for simultaneous data fetching

### Code Quality Highlights

| Aspect | Implementation |
|---|---|
| **Code Organization** | Separated into logical sections: Data, State, DOM References, Helper Functions, Event Listeners |
| **Performance** | Lazy loading images, pagination to avoid loading all 1000+ Pokémon at once |
| **Error Handling** | Try/catch blocks, null checks, user-friendly error messages |
| **Maintainability** | Clear variable names, comments, modular functions with single responsibility |
| **Reusability** | Helper functions like `padId()`, `capitalize()`, `makeTypeBadge()` used throughout |
| **Accessibility** | Semantic HTML, ARIA labels on SVG elements, keyboard navigation support |

---

## 🛠️ Technologies & API

### Frontend Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables, gradients, and animations
- **JavaScript (ES6+)**: Vanilla JS with async/await for clean API calls

### External Resources
- **[Pokémon API (PokéAPI)](https://pokeapi.co/)**: Free, open-source API providing comprehensive Pokémon data
  - Endpoint: `https://pokeapi.co/api/v2/pokemon?limit=10&offset=0`
  - Includes: Stats, types, abilities, moves, height, weight, species data
- **[Official Pokémon Images](https://assets.pokemon.com/)**: High-quality artwork
  - Format: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png`
  - ID Format: 3-digit (001, 002, ... 1010)
- **Google Fonts**: Press Start 2P (retro font) and Nunito (body font)

---

## 📊 Type Weakness System

The weakness calculation is derived from official Pokémon type matchups:

```javascript
const TYPE_WEAKNESSES = {
  normal:   ['fighting'],
  fire:     ['water', 'ground', 'rock'],
  water:    ['electric', 'grass'],
  grass:    ['flying', 'poison', 'bug', 'steel', 'fire', 'ice'],
  // ... etc
};

// Example: A Grass-type Pokémon shows weaknesses:
// Flying, Poison, Bug, Steel, Fire, Ice
```

**How it works:**
1. Extract Pokémon's type(s) from API response
2. Look up each type in `TYPE_WEAKNESSES` table
3. Collect all weaknesses into a Set (removes duplicates)
4. Display as colored type badges

This matches the assessment requirement: "Weakness of Pokemon can be derived by Type" with reference to official type effectiveness charts.

---

## 🔄 Data Flow Architecture

### Card Grid Flow
```
Page Load
  ↓
fetchPokemons() called
  ↓
Fetch 10 Pokémon list from API
  ↓
Fetch detailed data for each (parallel with Promise.all)
  ↓
Store in allPokemons array
  ↓
User interacts (search/filter/sort)
  ↓
renderCards() processes allPokemons
  ↓
Apply search filter (name or ID match)
  ↓
Apply type filter (check Pokémon.types)
  ↓
Apply sort (by ID or name)
  ↓
Generate HTML for filtered results
  ↓
Display in grid
```

### Modal Detail Flow
```
User clicks Pokémon card
  ↓
openModal(pokemonId) called
  ↓
Fetch Pokémon data from API
  ↓
Fetch species data (for description, category)
  ↓
Calculate weaknesses from type(s)
  ↓
Format stats for visualization
  ↓
Populate modal HTML
  ↓
Show modal overlay
  ↓
User can navigate with Next/Previous
```

---

## 💾 Local Storage & Persistence

The app uses browser localStorage to save favorites:
- **Storage Key**: `pokedex-favorites`
- **Data Format**: JSON array of Pokémon IDs
- **Persistence**: Survives browser restart
- **Example**: `[25, 6, 9]` represents Pikachu, Charizard, Blastoise

This is an enhancement beyond the base assessment requirements, demonstrating additional JavaScript knowledge.

---

## 📁 Project File Structure

```
Pokédex/
├── index.html          # Single-file app structure and styling
│                       # - Intro screen with SVG logo
│                       # - Header with controls
│                       # - Search bar and type filters
│                       # - Pokémon card grid container
│                       # - Modal for detailed view
│                       # - All CSS in <style> tag
│
├── app.js              # Complete JavaScript logic (~750 lines)
│                       # - State management
│                       # - API integration (fetchPokemons)
│                       # - Card rendering (renderCards)
│                       # - Modal functionality (openModal)
│                       # - Type weakness calculation
│                       # - Favorites management
│                       # - Event listeners
│
└── README.md           # This file
```

### index.html Sections
- **CSS Variables**: Theme colors, responsive sizing
- **SVG Logos**: Professional Pokéball design
- **Intro Screen**: "PRESS START" to begin
- **Header**: Logo, title, controls (Random button, catch counter)
- **Controls Bar**: Search input, sort dropdown
- **Type Filters**: Dynamically generated buttons
- **Card Grid**: Auto-populated by JavaScript
- **Modal**: Tabbed interface (Info / Stats / Moves)
- **Navigation**: Previous/Next buttons

### app.js Key Functions
- `fetchPokemons()`: Load 10 Pokémon at a time with pagination
- `renderCards()`: Filter, sort, and display cards
- `openModal(pokemonId)`: Fetch and display detailed info
- `renderTypeFilters()`: Generate type filter buttons
- `getWeaknesses(typeNames)`: Calculate type weaknesses
- `toggleFavorite(pokemonId)`: Save/unsave to localStorage
- Event listeners for all user interactions

---

## 🎨 Design & Styling

### Color Scheme
Dark Pokémon-themed palette with CSS variables:
- **Primary Red**: #cc0000 (Pokéball, header)
- **Dark Background**: #1a1a2e (main bg)
- **Darker**: #0f0f1a (deeper bg)
- **Accent Gold**: #ffd700 (buttons, highlights)
- **Text Color**: #e8eaf0 (readable on dark)
- **Type Colors**: Match official Pokémon type colors (18 types)

### Responsive Design
- **Mobile First**: Works on devices 320px and up
- **Breakpoints**: Flexible grid that adapts to screen size
- **Font Scaling**: `clamp()` for responsive typography
- **Touch Friendly**: Large click targets, proper spacing

### Animations
- **Float Effect**: Logo bobs up and down (3s loop)
- **Card Entrance**: Staggered animation (40ms per card)
- **Modal Transition**: 600ms smooth fade and scale
- **Battle Flash**: White screen flash when opening details
- **Type Buttons**: Smooth highlight on active/hover

---

## 🐛 Troubleshooting

### Issue: "Could not load Pokémon. Check your internet connection!"
**Solution**: 
- Verify your internet connection
- Check that PokéAPI (pokeapi.co) is accessible
- Try refreshing the page
- Use a local server instead of `file://` protocol

### Issue: Page displays but no Pokémon load
**Solution**:
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try opening in a different browser
- Verify API endpoint is accessible

### Issue: Favorites not saving
**Solution**:
- Check if localStorage is enabled in your browser
- Clear browser cookies/cache and try again
- Verify you're not in private/incognito mode (data doesn't persist)

### Issue: Shiny sprites not loading
**Solution**:
- These come from an external GitHub repository
- Check your internet connection
- Some Pokémon may not have official shiny sprites

---

## 📊 Statistics & Info

### Pokémon Coverage
- **Total Pokémon**: 1025+ (covers Gen 1-9)
- **Types**: 18 official types (plus combinations)
- **Data Points**: ID, name, type(s), height, weight, stats, moves, abilities, and more

### API Rate Limiting
- PokéAPI has generous rate limits
- The app loads 10 Pokémon at a time to be respectful
- No authentication required for basic access

---

## 📄 License

This project is open source and available under the **MIT License**. Feel free to use, modify, and distribute as you see fit. Attribution is appreciated but not required.

### Credits
- **Pokémon Data**: [PokéAPI](https://pokeapi.co/)
- **Sprites**: Official Pokémon artwork and community resources
- **Fonts**: [Google Fonts](https://fonts.google.com/)
- **Inspiration**: The official Pokémon Pokédex

---

**Happy exploring, trainer! Go catch 'em all! 🔴⚪🔵**

---

*Crafted with ❤️ by Joanalyn Cadampog*