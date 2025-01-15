function initTheme() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
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

document.addEventListener('DOMContentLoaded', () => {
    initializeTypes();
    initTheme();
    initializeSearch();
    initializeHistory();
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
            if (typeChart[defenderType][attackerType]) {
                effectiveness[attackerType] *= typeChart[defenderType][attackerType];
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
    function formatMultiplier(multiplier) {
        if (multiplier > 1) {
            return `(${multiplier}x)`;
        } else if (multiplier < 1) {
            const fraction = multiplier === 0.5 ? "1/2" : "1/4";
            return `(${fraction}x)`;
        }
        return '';
    }

    function createTypeChips(typeData, container) {
        container.innerHTML = '';
        typeData.forEach(({ type, multiplier }) => {
            const chip = document.createElement('span');
            chip.className = 'type-chip';
            
            // Create and add the icon
            const icon = document.createElement('img');
            icon.src = `images/${type.toLowerCase()}_icon.png`;
            icon.alt = `${type} type`;
            icon.className = 'type-icon';
            
            // Create a span for the text
            const text = document.createElement('span');
            text.textContent = `${type} ${formatMultiplier(multiplier)}`;
            
            chip.appendChild(icon);
            chip.appendChild(text);
            chip.style.backgroundColor = typeColors[type];
            container.appendChild(chip);
        });
        
        if (container.innerHTML === '') {
            container.innerHTML = '<span class="none-text">None</span>';
        }
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
        if (selectedTypes.length > 0 && !isSelectingTypes()) {
            const combo = selectedTypes.sort().join(' / ');
            history = [combo, ...history.filter(h => h !== combo)].slice(0, 5);
            localStorage.setItem('typeHistory', JSON.stringify(history));
            updateHistoryDisplay();
        }
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