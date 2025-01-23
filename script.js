let pokemonData = [];

async function loadPokemonData() {
    try {
        const response = await fetch('seaglass_all_pokemon.csv');
        const csvText = await response.text();
        
        // Split into lines and remove empty lines
        const lines = csvText.split('\n').filter(line => line.trim());
        
        // Skip the header row (first line)
        pokemonData = lines.slice(1).map(line => {
            const [POKEMON, TYPE, HP, ATK, DEF, SPA, SPD, SPE, BST, ABILITIES, hiddenAbility] = line.split(',');
            return {
                POKEMON: POKEMON.trim(),
                types: TYPE.trim().split('/'),
                HP: parseInt(HP),
                ATK: parseInt(ATK),
                DEF: parseInt(DEF),
                SPA: parseInt(SPA),
                SPD: parseInt(SPD),
                SPE: parseInt(SPE),
                BST: parseInt(BST),
                ABILITIES: ABILITIES,
                hiddenAbility: hiddenAbility
            };
        });
            
        console.log('Loaded Pokemon:', pokemonData.length);  // Debug info
        console.log('Sample Pokemon:', pokemonData[0]);  // Should now show Treecko
    } catch (error) {
        console.error('Error loading Pokemon data:', error);
    }
}

function initTheme() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme') || 'dark';  // Default to dark if no theme set

    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }

    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }    
    }

    toggleSwitch.addEventListener('change', switchTheme, false);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadPokemonData();
    initializeTypes();
    initTheme();
    initializeSearch();
    initializeHistory();
    initializePokemonSearch();
    initializePokemonHistory();
    updatePokemonHistoryDisplay();
});

const types = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
    'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const typeColors = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Electric: '#F8D030',
    Grass: '#78C850',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC'
};

const typeChart = {
    Normal: { Fighting: 2, Ghost: 0 },
    Fire: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Ice: 0.5, Bug: 0.5, Steel: 0.5, Fairy: 0.5 },
    Water: { Electric: 2, Grass: 2, Water: 0.5, Fire: 0.5, Ice: 0.5, Steel: 0.5 },
    Electric: { Ground: 2, Electric: 0.5, Flying: 0.5, Steel: 0.5 },
    Grass: { Fire: 2, Ice: 2, Poison: 2, Flying: 2, Bug: 2, Water: 0.5, Electric: 0.5, Grass: 0.5, Ground: 0.5 },
    Ice: { Fire: 2, Fighting: 2, Rock: 2, Steel: 2, Ice: 0.5 },
    Fighting: { Flying: 2, Psychic: 2, Fairy: 2, Bug: 0.5, Rock: 0.5, Dark: 0.5 },
    Poison: { Ground: 2, Psychic: 2, Fighting: 0.5, Poison: 0.5, Bug: 0.5, Grass: 0.5, Fairy: 0.5 },
    Ground: { Water: 2, Grass: 2, Ice: 2, Electric: 0, Poison: 0.5, Rock: 0.5 },
    Flying: { Electric: 2, Ice: 2, Rock: 2, Ground: 0, Fighting: 0.5, Bug: 0.5, Grass: 0.5 },
    Psychic: { Bug: 2, Ghost: 2, Dark: 2, Fighting: 0.5, Psychic: 0.5 },
    Bug: { Fire: 2, Flying: 2, Rock: 2, Fighting: 0.5, Ground: 0.5, Grass: 0.5 },
    Rock: { Water: 2, Grass: 2, Fighting: 2, Ground: 2, Steel: 2, Normal: 0.5, Fire: 0.5, Poison: 0.5, Flying: 0.5 },
    Ghost: { Ghost: 2, Dark: 2, Normal: 0, Fighting: 0, Poison: 0.5, Bug: 0.5 },
    Dragon: { Ice: 2, Dragon: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 0.5 },
    Dark: { Fighting: 2, Bug: 2, Fairy: 2, Ghost: 0.5, Dark: 0.5, Psychic: 0 },
    Steel: { Fire: 2, Fighting: 2, Ground: 2, Normal: 0.5, Grass: 0.5, Ice: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 0.5, Fairy: 0.5, Poison: 0 },
    Fairy: { Poison: 2, Steel: 2, Fighting: 0.5, Bug: 0.5, Dark: 0.5, Dragon: 0 }
};

let selectedTypes = [];

function initializeTypes() {
    const typeButtons = document.getElementById('type-buttons');
    
    types.forEach(type => {
        const button = document.createElement('button');
        button.className = 'type-btn';
        
        // Create and add the icon
        const icon = document.createElement('img');
        icon.src = `images/${type.toLowerCase()}_icon.png`;
        icon.alt = `${type} type`;
        icon.className = 'type-icon';
        
        // Create a span for the text
        const text = document.createElement('span');
        text.textContent = type;
        
        button.appendChild(icon);
        button.appendChild(text);
        button.style.backgroundColor = typeColors[type];
        button.onclick = () => toggleType(type);
        typeButtons.appendChild(button);
    });
}

function toggleType(type) {
    const index = selectedTypes.indexOf(type);
    if (index === -1) {
        if (selectedTypes.length < 2) {
            selectedTypes.push(type);
        }
    } else {
        selectedTypes.splice(index, 1);
    }
    updateUI();
}

function updateUI() {
    // Update selected types display
    const buttons = document.querySelectorAll('.type-btn');
    buttons.forEach(button => {
        button.classList.remove('selected');
        if (selectedTypes.includes(button.textContent)) {
            button.classList.add('selected');
        }
    });

    // Calculate and display weaknesses, resistances, and immunities
    calculateEffectiveness();
}

function calculateEffectiveness() {
    if (selectedTypes.length === 0) {
        displayResults([], [], []);
        return;
    }

    let effectiveness = {};
    
    // Initialize effectiveness for all types
    types.forEach(type => {
        effectiveness[type] = 1;
    });

    // Calculate effectiveness for each selected type
    selectedTypes.forEach(defenderType => {
        types.forEach(attackerType => {
            const multiplier = typeChart[defenderType][attackerType];
            if (multiplier !== undefined) {
                if (multiplier === 0) {
                    // If any type gives immunity, the final result is immune
                    effectiveness[attackerType] = 0;
                } else {
                    // Otherwise multiply the effectiveness
                    effectiveness[attackerType] *= multiplier;
                }
            }
        });
    });

    // Categorize results
    let weaknesses = [];
    let resistances = [];
    let immunities = [];

    for (let [type, multiplier] of Object.entries(effectiveness)) {
        if (multiplier === 0) {
            immunities.push({ type, multiplier });
        } else if (multiplier > 1) {
            weaknesses.push({ type, multiplier });
        } else if (multiplier < 1) {
            resistances.push({ type, multiplier });
        }
    }

    displayResults(weaknesses, resistances, immunities);
}

function displayResults(weaknesses, resistances, immunities) {
    function createTypeChips(typeData, container) {
        container.innerHTML = '';
        
        // Group items by multiplier
        const groups = {};
        typeData.forEach(item => {
            const key = item.multiplier || 0;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        // Define multiplier order (including 0)
        const multiplierOrder = [4, 0.25, 2, 0.5, 0];

        // Create sections for each multiplier group in order
        multiplierOrder.forEach(multiplier => {
            if (!groups[multiplier]) return;
            const items = groups[multiplier];

            // Add multiplier header with appropriate color
            const multiplierClass = multiplier === 4 ? 'super-weak' :
                                  multiplier === 2 ? 'weak' :
                                  multiplier === 0.5 ? 'resist' :
                                  multiplier === 0.25 ? 'super-resist' :
                                  multiplier === 0 ? 'immune' : '';
            
            if (items.length > 0) {
                container.insertAdjacentHTML('beforeend', `
                    <div class="multiplier-group">
                        <span class="multiplier-header ${multiplierClass}">
                            ${formatMultiplierHeader(multiplier)}
                        </span>
                        ${items.map(({ type }) => `
                            <span class="type-chip" style="background-color: ${typeColors[type]}">
                                <img src="images/${type.toLowerCase()}_icon.png" 
                                     alt="${type} type" 
                                     class="type-icon">
                                <span>${type}</span>
                                <span class="multiplier">${formatMultiplier(multiplier)}</span>
                            </span>
                        `).join('')}
                    </div>
                `);
            }
        });

        if (container.innerHTML === '') {
            container.innerHTML = '<span class="none-text">None</span>';
        }
    }

    function formatMultiplierHeader(multiplier) {
        const mult = parseFloat(multiplier);
        if (mult === 4) return '4×';
        if (mult === 2) return '2×';
        if (mult === 0.5) return '½×';
        if (mult === 0.25) return '¼×';
        if (mult === 0) return '0×';
        return '';
    }

    function formatMultiplier(multiplier) {
        if (multiplier === 4) return '(4×)';
        if (multiplier === 2) return '(2×)';
        if (multiplier === 0.5) return '(½×)';
        if (multiplier === 0.25) return '(¼×)';
        if (multiplier === 0) return '(0×)';
        return '';
    }

    createTypeChips(weaknesses, document.getElementById('weaknesses'));
    createTypeChips(resistances, document.getElementById('resistances'));
    createTypeChips(immunities, document.getElementById('immunities'));
}

function initializeSearch() {
    const searchInput = document.getElementById('typeSearch');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const buttons = document.querySelectorAll('.type-btn');
        
        buttons.forEach(button => {
            const typeName = button.textContent.toLowerCase();
            if (searchTerm === '') {
                button.style.display = '';
                button.style.opacity = '1';
            } else if (typeName.includes(searchTerm)) {
                button.style.display = '';
                button.style.opacity = '1';
            } else {
                button.style.display = 'none';
                button.style.opacity = '0';
            }
        });
    });

    // Clear search when Escape is pressed
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    });
}

function initializeHistory() {
    let history = JSON.parse(localStorage.getItem('typeHistory') || '[]');

    function saveToHistory() {
        if (selectedTypes.length !== 2) return;  // Only save when we have exactly 2 types

        const combination = selectedTypes.join(' / ');
        
        // Remove the combination if it already exists
        const index = history.indexOf(combination);
        if (index > -1) {
            history.splice(index, 1);
        }
        
        // Add to the beginning of the array
        history.unshift(combination);
        
        // Keep only the last 10 combinations
        if (history.length > 10) {
            history.pop();
        }
        
        localStorage.setItem('typeHistory', JSON.stringify(history));
        updateHistoryDisplay();
    }

    function clearHistory() {
        history = [];
        localStorage.removeItem('typeHistory');
        updateHistoryDisplay();
    }

    function isSelectingTypes() {
        const selectedTypesText = document.querySelector('#selected-types p').textContent;
        return selectedTypesText.includes('Select') && selectedTypes.length === 1;
    }

    function formatTypeSpan(type) {
        return `<span class="history-type" style="background-color: ${typeColors[type]}">${type}</span>`;
    }

    function updateHistoryDisplay() {
        const historyContainer = document.getElementById('type-history');
        if (history.length === 0) {
            historyContainer.innerHTML = '<span class="none-text">No recent combinations</span>';
            document.getElementById('clear-history').style.display = 'none';
            return;
        }

        document.getElementById('clear-history').style.display = 'block';
        historyContainer.innerHTML = history.map(combo => {
            const types = combo.split(' / ');
            const coloredTypes = types.map(formatTypeSpan).join(' / ');
            return `
                <div class="history-item" onclick="loadHistoryCombination('${combo}')">
                    ${coloredTypes}
                </div>
            `;
        }).join('');
    }

    document.getElementById('clear-history').addEventListener('click', clearHistory);

    // Make sure we're calling saveToHistory after calculating effectiveness
    const originalCalculateEffectiveness = calculateEffectiveness;
    calculateEffectiveness = function() {
        originalCalculateEffectiveness.apply(this, arguments);
        saveToHistory();
    };

    updateHistoryDisplay();
}

// Add this function to global scope to be accessible from onclick
window.loadHistoryCombination = function(combo) {
    // Clear current selection
    selectedTypes = [];
    updateUI();
    
    // Load the combination
    const types = combo.split(' / ');
    types.forEach(type => toggleType(type));
};

function initializePokemonSearch() {
    const searchInput = document.getElementById('pokemonSearch');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'pokemon-suggestions';
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(suggestionsContainer);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 1) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const matches = pokemonData
            .filter(pokemon => pokemon.POKEMON.toLowerCase().includes(searchTerm))
            .slice(0, 80);

        if (matches.length > 0) {
            suggestionsContainer.style.display = 'block';
            suggestionsContainer.innerHTML = matches.map(pokemon => `
                <div class="pokemon-suggestion-item" onclick="selectPokemon('${pokemon.POKEMON}')">
                    <img src="images/sprites/front/${pokemonNumbers[pokemon.POKEMON]}.png"
                         alt="${pokemon.POKEMON}"
                         class="pokemon-sprite">
                    <div class="pokemon-info">
                        <span class="pokemon-name">${pokemon.POKEMON}</span>
                        <div class="pokemon-types">
                            ${pokemon.types.map(type => `
                                <span class="pokemon-type-pill" 
                                      style="background-color: ${typeColors[type.trim()]}">
                                    ${type.trim()}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Add this function to global scope
window.selectPokemon = function(pokemonName) {
    const pokemon = pokemonData.find(p => p.POKEMON === pokemonName);
    if (pokemon) {
        // Clear current selection
        selectedTypes = [];
        updateUI();
        
        // Select the pokemon's types
        pokemon.types.forEach(type => toggleType(type.trim()));
        
        // Display stats
        displayPokemonStats(pokemon);
        
        // Add to Pokemon history
        addToPokemonHistory({
            POKEMON: pokemon.POKEMON,
            types: pokemon.types
        });
        
        // Clear search input and hide suggestions
        document.getElementById('pokemonSearch').value = '';
        document.querySelector('.pokemon-suggestions').style.display = 'none';
    }
};

function addToPokemonHistory(pokemon) {
    const historyContainer = document.getElementById('pokemon-history');
    const maxHistory = 5; // Keep last 5 Pokémon
    
    // Get existing history or initialize empty array
    let history = JSON.parse(localStorage.getItem('pokemonHistory') || '[]');
    
    // Remove if already exists (to move to top)
    history = history.filter(p => p.POKEMON !== pokemon.POKEMON);  // Changed from name to POKEMON
    
    // Add to start of array
    history.unshift(pokemon);
    
    // Keep only the last maxHistory items
    history = history.slice(0, maxHistory);
    
    // Save to localStorage
    localStorage.setItem('pokemonHistory', JSON.stringify(history));
    
    // Update display
    updatePokemonHistoryDisplay();
}

function updatePokemonHistoryDisplay() {
    const historyContainer = document.getElementById('pokemon-history');
    const history = JSON.parse(localStorage.getItem('pokemonHistory') || '[]');

    if (history.length === 0) {
        historyContainer.innerHTML = '<span class="none-text">No Pokémon history yet</span>';
        document.getElementById('clear-pokemon-history').style.display = 'none';
        return;
    }

    document.getElementById('clear-pokemon-history').style.display = 'block';
    historyContainer.innerHTML = history.map(pokemon => {
        const spriteNumber = pokemonNumbers[pokemon.POKEMON] || '0';
        return `
            <div class="history-item" onclick="loadPokemonFromHistory('${pokemon.POKEMON}')">
                <div class="pokemon-info-container">
                    <img src="images/sprites/front/${spriteNumber}.png" 
                         alt="${pokemon.POKEMON}"
                         class="pokemon-sprite">
                    <span class="pokemon-name">${pokemon.POKEMON}</span>
                </div>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `
                        <span class="pokemon-type-pill" style="background-color: ${typeColors[type]}">
                            ${type}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function initializePokemonHistory() {
    document.getElementById('clear-pokemon-history').addEventListener('click', () => {
        localStorage.removeItem('pokemonHistory');
        updatePokemonHistoryDisplay();
    });
}

const pokemonNumbers = {
    'Bulbasaur': '1',
    'Ivysaur': '2',
    'Venusaur': '3',
    'Charmander': '4',
    'Charmeleon': '5',
    'Charizard': '6',
    'Squirtle': '7',
    'Wartortle': '8',
    'Blastoise': '9',
    'Caterpie': '10',
    'Metapod': '11',
    'Butterfree': '12',
    'Weedle': '13',
    'Kakuna': '14',
    'Beedrill': '15',
    'Pidgey': '16',
    'Pidgeotto': '17',
    'Pidgeot': '18',
    'Rattata': '19',
    'Raticate': '20',
    'Spearow': '21',
    'Fearow': '22',
    'Ekans': '23',
    'Arbok': '24',
    'Pikachu': '25',
    'Raichu': '26',
    'Sandshrew': '27',
    'Sandslash': '28',
    'Nidoran♀': '29',
    'Nidorina': '30',
    'Nidoqueen': '31',
    'Nidoran♂': '32',
    'Nidorino': '33',
    'Nidoking': '34',
    'Clefairy': '35',
    'Clefable': '36',
    'Vulpix': '37',
    'Ninetales': '38',
    'Jigglypuff': '39',
    'Wigglytuff': '40',
    'Zubat': '41',
    'Golbat': '42',
    'Oddish': '43',
    'Gloom': '44',
    'Vileplume': '45',
    'Paras': '46',
    'Parasect': '47',
    'Venonat': '48',
    'Venomoth': '49',
    'Diglett': '50',
    'Dugtrio': '51',
    'Meowth': '52',
    'Persian': '53',
    'Psyduck': '54',
    'Golduck': '55',
    'Mankey': '56',
    'Primeape': '57',
    'Growlithe': '58',
    'Arcanine': '59',
    'Poliwag': '60',
    'Poliwhirl': '61',
    'Poliwrath': '62',
    'Abra': '63',
    'Kadabra': '64',
    'Alakazam': '65',
    'Machop': '66',
    'Machoke': '67',
    'Machamp': '68',
    'Bellsprout': '69',
    'Weepinbell': '70',
    'Victreebel': '71',
    'Tentacool': '72',
    'Tentacruel': '73',
    'Geodude': '74',
    'Graveler': '75',
    'Golem': '76',
    'Ponyta': '77',
    'Rapidash': '78',
    'Slowpoke': '79',
    'Slowbro': '80',
    'Magnemite': '81',
    'Magneton': '82',
    'Farfetch\'d': '83',
    'Doduo': '84',
    'Dodrio': '85',
    'Seel': '86',
    'Dewgong': '87',
    'Grimer': '88',
    'Muk': '89',
    'Shellder': '90',
    'Cloyster': '91',
    'Gastly': '92',
    'Haunter': '93',
    'Gengar': '94',
    'Onix': '95',
    'Drowzee': '96',
    'Hypno': '97',
    'Krabby': '98',
    'Kingler': '99',
    'Voltorb': '100',
    'Electrode': '101',
    'Exeggcute': '102',
    'Exeggutor': '103',
    'Cubone': '104',
    'Marowak': '105',
    'Hitmonlee': '106',
    'Hitmonchan': '107',
    'Lickitung': '108',
    'Koffing': '109',
    'Weezing': '110',
    'Rhyhorn': '111',
    'Rhydon': '112',
    'Chansey': '113',
    'Tangela': '114',
    'Kangaskhan': '115',
    'Horsea': '116',
    'Seadra': '117',
    'Goldeen': '118',
    'Seaking': '119',
    'Staryu': '120',
    'Starmie': '121',
    'Mr. Mime': '122',
    'Scyther': '123',
    'Jynx': '124',
    'Electabuzz': '125',
    'Magmar': '126',
    'Pinsir': '127',
    'Tauros': '128',
    'Magikarp': '129',
    'Gyarados': '130',
    'Lapras': '131',
    'Ditto': '132',
    'Eevee': '133',
    'Vaporeon': '134',
    'Jolteon': '135',
    'Flareon': '136',
    'Porygon': '137',
    'Omanyte': '138',
    'Omastar': '139',
    'Kabuto': '140',
    'Kabutops': '141',
    'Aerodactyl': '142',
    'Snorlax': '143',
    'Articuno': '144',
    'Zapdos': '145',
    'Moltres': '146',
    'Dratini': '147',
    'Dragonair': '148',
    'Dragonite': '149',
    'Mewtwo': '150',
    'Mew': '151',
    'Chikorita': '152',
    'Bayleef': '153',
    'Meganium': '154',
    'Cyndaquil': '155',
    'Quilava': '156',
    'Typhlosion': '157',
    'Totodile': '158',
    'Croconaw': '159',
    'Feraligatr': '160',
    'Sentret': '161',
    'Furret': '162',
    'Hoothoot': '163',
    'Noctowl': '164',
    'Ledyba': '165',
    'Ledian': '166',
    'Spinarak': '167',
    'Ariados': '168',
    'Crobat': '169',
    'Chinchou': '170',
    'Lanturn': '171',
    'Pichu': '172',
    'Cleffa': '173',
    'Igglybuff': '174',
    'Togepi': '175',
    'Togetic': '176',
    'Natu': '177',
    'Xatu': '178',
    'Mareep': '179',
    'Flaaffy': '180',
    'Ampharos': '181',
    'Bellossom': '182',
    'Marill': '183',
    'Azumarill': '184',
    'Sudowoodo': '185',
    'Politoed': '186',
    'Hoppip': '187',
    'Skiploom': '188',
    'Jumpluff': '189',
    'Aipom': '190',
    'Sunkern': '191',
    'Sunflora': '192',
    'Yanma': '193',
    'Wooper': '194',
    'Quagsire': '195',
    'Espeon': '196',
    'Umbreon': '197',
    'Murkrow': '198',
    'Slowking': '199',
    'Misdreavus': '200',
    'Unown': '201',
    'Wobbuffet': '202',
    'Girafarig': '203',
    'Pineco': '204',
    'Forretress': '205',
    'Dunsparce': '206',
    'Gligar': '207',
    'Steelix': '208',
    'Snubbull': '209',
    'Granbull': '210',
    'Qwilfish': '211',
    'Scizor': '212',
    'Shuckle': '213',
    'Heracross': '214',
    'Sneasel': '215',
    'Teddiursa': '216',
    'Ursaring': '217',
    'Slugma': '218',
    'Magcargo': '219',
    'Swinub': '220',
    'Piloswine': '221',
    'Corsola': '222',
    'Remoraid': '223',
    'Octillery': '224',
    'Delibird': '225',
    'Mantine': '226',
    'Skarmory': '227',
    'Houndour': '228',
    'Houndoom': '229',
    'Kingdra': '230',
    'Phanpy': '231',
    'Donphan': '232',
    'Porygon2': '233',
    'Stantler': '234',
    'Smeargle': '235',
    'Tyrogue': '236',
    'Hitmontop': '237',
    'Smoochum': '238',
    'Elekid': '239',
    'Magby': '240',
    'Miltank': '241',
    'Blissey': '242',
    'Raikou': '243',
    'Entei': '244',
    'Suicune': '245',
    'Larvitar': '246',
    'Pupitar': '247',
    'Tyranitar': '248',
    'Lugia': '249',
    'Ho-Oh': '250',
    'Celebi': '251',
    'Treecko': '252',
    'Grovyle': '253',
    'Sceptile': '254',
    'Torchic': '255',
    'Combusken': '256',
    'Blaziken': '257',
    'Mudkip': '258',
    'Marshtomp': '259',
    'Swampert': '260',
    'Poochyena': '261',
    'Mightyena': '262',
    'Zigzagoon': '263',
    'Linoone': '264',
    'Wurmple': '265',
    'Silcoon': '266',
    'Beautifly': '267',
    'Cascoon': '268',
    'Dustox': '269',
    'Lotad': '270',
    'Lombre': '271',
    'Ludicolo': '272',
    'Seedot': '273',
    'Nuzleaf': '274',
    'Shiftry': '275',
    'Taillow': '276',
    'Swellow': '277',
    'Wingull': '278',
    'Pelipper': '279',
    'Ralts': '280',
    'Kirlia': '281',
    'Gardevoir': '282',
    'Surskit': '283',
    'Masquerain': '284',
    'Shroomish': '285',
    'Breloom': '286',
    'Slakoth': '287',
    'Vigoroth': '288',
    'Slaking': '289',
    'Nincada': '290',
    'Ninjask': '291',
    'Shedinja': '292',
    'Whismur': '293',
    'Loudred': '294',
    'Exploud': '295',
    'Makuhita': '296',
    'Hariyama': '297',
    'Azurill': '298',
    'Nosepass': '299',
    'Skitty': '300',
    'Delcatty': '301',
    'Sableye': '302',
    'Mawile': '303',
    'Aron': '304',
    'Lairon': '305',
    'Aggron': '306',
    'Meditite': '307',
    'Medicham': '308',
    'Electrike': '309',
    'Manectric': '310',
    'Plusle': '311',
    'Minun': '312',
    'Volbeat': '313',
    'Illumise': '314',
    'Roselia': '315',
    'Gulpin': '316',
    'Swalot': '317',
    'Carvanha': '318',
    'Sharpedo': '319',
    'Wailmer': '320',
    'Wailord': '321',
    'Numel': '322',
    'Camerupt': '323',
    'Torkoal': '324',
    'Spoink': '325',
    'Grumpig': '326',
    'Spinda': '327',
    'Trapinch': '328',
    'Vibrava': '329',
    'Flygon': '330',
    'Cacnea': '331',
    'Cacturne': '332',
    'Swablu': '333',
    'Altaria': '334',
    'Zangoose': '335',
    'Seviper': '336',
    'Lunatone': '337',
    'Solrock': '338',
    'Barboach': '339',
    'Whiscash': '340',
    'Corphish': '341',
    'Crawdaunt': '342',
    'Baltoy': '343',
    'Claydol': '344',
    'Lileep': '345',
    'Cradily': '346',
    'Anorith': '347',
    'Armaldo': '348',
    'Feebas': '349',
    'Milotic': '350',
    'Castform': '351',
    'Kecleon': '352',
    'Shuppet': '353',
    'Banette': '354',
    'Duskull': '355',
    'Dusclops': '356',
    'Tropius': '357',
    'Chimecho': '358',
    'Absol': '359',
    'Wynaut': '360',
    'Snorunt': '361',
    'Glalie': '362',
    'Spheal': '363',
    'Sealeo': '364',
    'Walrein': '365',
    'Clamperl': '366',
    'Huntail': '367',
    'Gorebyss': '368',
    'Relicanth': '369',
    'Luvdisc': '370',
    'Bagon': '371',
    'Shelgon': '372',
    'Salamence': '373',
    'Beldum': '374',
    'Metang': '375',
    'Metagross': '376',
    'Regirock': '377',
    'Regice': '378',
    'Registeel': '379',
    'Latias': '380',
    'Latios': '381',
    'Kyogre': '382',
    'Groudon': '383',
    'Rayquaza': '384',
    'Jirachi': '385',
    'Deoxys': '386',
    'Budew': '406',
    'Roserade': '407',
    'Ambipom': '424',
    'Mismagius': '429',
    'Honchkrow': '430',
    'Chingling': '433',
    'Bonsly': '438',
    'Mime Jr.': '439',
    'Happiny': '440',
    'Munchlax': '446',
    'Weavile': '461',
    'Magnezone': '462',
    'Lickilicky': '463',
    'Rhyperior': '464',
    'Tangrowth': '465',
    'Electivire': '466',
    'Magmortar': '467',
    'Togekiss': '468',
    'Yanmega': '469',
    'Leafeon': '470',
    'Glaceon': '471',
    'Gliscor': '472',
    'Mamoswine': '473',
    'Porygon-Z': '474',
    'Gallade': '475',
    'Probopass': '476',
    'Dusknoir': '477',
    'Froslass': '478',
    'Sylveon': '700',
    'Applin': '840',
    'Flapple': '841',
    'Appletun': '842',
    'Wyrdeer': '899',
    'Kleavor': '900',
    'Ursaluna': '901',
    'Tinkatink': '957',
    'Tinkatuff': '958',
    'Tinkaton': '959',
    'Annihilape': '979',
    'Farigiraf': '981',
    'Dudunsparce': '982',
    'Dipplin': '1011',
    'Hydrapple': '1019'
}; 

function loadPokemonFromHistory(pokemonName) {
    // Clear current selections
    selectedTypes.length = 0;
    
    // Find the pokemon in data (not history) to get all stats
    const pokemon = pokemonData.find(p => p.POKEMON === pokemonName);
    
    if (pokemon) {
        // Add each type to selectedTypes
        pokemon.types.forEach(type => {
            if (!selectedTypes.includes(type)) {
                selectedTypes.push(type);
            }
        });
        
        // Display stats
        displayPokemonStats(pokemon);
        
        // Update the UI
        updateUI();
    }
} 

function updateSelectedTypes() {
    const selectedTypesContainer = document.getElementById('selected-types');
    
    if (selectedTypes.length === 0) {
        selectedTypesContainer.innerHTML = '<p>No types selected</p>';
        return;
    }

    selectedTypesContainer.innerHTML = selectedTypes.map(type => `
        <span class="type-chip" style="background-color: ${typeColors[type]}">
            <img src="images/${type.toLowerCase()}_icon.png" 
                 alt="${type} type" 
                 class="type-icon">
            <span>${type}</span>
            <span class="close" onclick="removeType('${type}')">&times;</span>
        </span>
    `).join('');

    // Update the visual selection in the type buttons
    document.querySelectorAll('#type-buttons .type-btn').forEach(button => {
        const type = button.textContent.trim();
        if (selectedTypes.includes(type)) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
} 

const statMaxValues = {
    HP: 190,    // Wobbuffet
    ATK: 160,   // Slaking
    DEF: 230,   // Shuckle
    SPA: 125,   // Gardevoir
    SPD: 230,   // Shuckle
    SPE: 160,   // Ninjask
    BST: 680    // Lugia/Ho-oh
};

function getStatColor(percentage) {
    if (percentage <= 25) {
        return '#ff4d4d';  // Red (0-25%)
    } else if (percentage <= 50) {
        return '#ff9933';  // Orange (26-50%)
    } else if (percentage <= 75) {
        return '#d3fc03';  // Yellow-Green (51-75%)
    } else {
        return '#4caf50';  // Green (76-100%)
    }
}

function updateStatBar(elementId, value, statType) {
    const element = document.getElementById(elementId);
    const maxValue = statMaxValues[statType];
    const percentage = (value / maxValue) * 100;
    const color = getStatColor(percentage);
    
    element.innerHTML = `
        <div class="stat-container">
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" 
                     style="width: ${percentage}%; background-color: ${color} !important;">
                </div>
            </div>
            <span class="stat-value">${value}</span>
        </div>
    `;
}

function displayPokemonStats(pokemon) {
    // Show stats container
    document.querySelector('.stats-container').style.display = 'grid';
    
    // Set Pokemon name
    document.getElementById('stats-pokemon-name').textContent = pokemon.POKEMON;
    
    // Set Pokemon sprite
    const spriteNumber = pokemonNumbers[pokemon.POKEMON] || '0';
    const spriteElement = document.getElementById('stats-pokemon-sprite');
    spriteElement.src = `images/sprites/front/${spriteNumber}.png`;
    spriteElement.alt = pokemon.POKEMON;
    
    // Add this section to handle types
    const typesContainer = document.getElementById('stats-pokemon-types');
    typesContainer.innerHTML = ''; // Clear existing types
    
    // Add type badges using the same format as your existing type chips
    pokemon.types.forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = `type-chip`;
        typeSpan.style.backgroundColor = typeColors[type];
        typeSpan.innerHTML = `
            <img src="images/${type.toLowerCase()}_icon.png" 
                 alt="${type} type" 
                 class="type-icon">
            <span>${type}</span>
        `;
        typesContainer.appendChild(typeSpan);
    });
    
    // Update each stat with value and progress bar
    updateStatBar('hp-stat', pokemon.HP, 'HP');
    updateStatBar('attack-stat', pokemon.ATK, 'ATK');
    updateStatBar('defense-stat', pokemon.DEF, 'DEF');
    updateStatBar('sp-attack-stat', pokemon.SPA, 'SPA');
    updateStatBar('sp-defense-stat', pokemon.SPD, 'SPD');
    updateStatBar('speed-stat', pokemon.SPE, 'SPE');
    
    // Add BST bar
    updateStatBar('bst-stat', pokemon.BST, 'BST');
} 