const STORAGE_KEY = 'teal_counters_data';

// State
let state = {
    counters: [],
    view: 'all' // or 'today'
};

// DOM Elements
const listEl = document.getElementById('counter-list');
const addBtn = document.getElementById('add-btn');
const segments = document.querySelectorAll('.segment');

// Init
function init() {
    loadData();
    checkDateReset(); // Check if day changed
    render();
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        state.counters = JSON.parse(raw);
    } else {
        // Default data for demo if empty
        state.counters = [
            { id: 1, label: 'Coffee', total: 12, today: 2, lastUpdated: new Date().toDateString() },
            { id: 2, label: 'Water', total: 45, today: 5, lastUpdated: new Date().toDateString() }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.counters));
}

function checkDateReset() {
    const todayStr = new Date().toDateString();
    let changed = false;
    
    state.counters.forEach(c => {
        // If lastUpdated is missing or different from today
        if (c.lastUpdated !== todayStr) {
            c.today = 0;
            c.lastUpdated = todayStr;
            changed = true;
        }
    });
    
    if (changed) saveData();
}

function addCounter() {
    const label = prompt("Enter counter name:");
    if (!label) return;
    
    const newCounter = {
        id: Date.now(),
        label: label,
        total: 0,
        today: 0,
        lastUpdated: new Date().toDateString()
    };
    
    state.counters.push(newCounter);
    saveData();
    render();
}

function increment(id) {
    const counter = state.counters.find(c => c.id === id);
    if (counter) {
        counter.total++;
        counter.today++;
        counter.lastUpdated = new Date().toDateString(); // Ensure date is current
        saveData();
        
        // Optimistic UI update for smoother feel
        render();
    }
}

function render() {
    listEl.innerHTML = '';
    
    if (state.counters.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#999; margin-top:20px;">No counters yet. Tap + to add one.</div>';
        return;
    }

    state.counters.forEach(counter => {
        const val = state.view === 'all' ? counter.total : counter.today;
        
        const card = document.createElement('div');
        card.className = 'counter-card';
        // Add ripple effect or animation class here if desired
        card.onclick = () => increment(counter.id);
        
        card.innerHTML = `
            <div class="counter-label">${escapeHtml(counter.label)}</div>
            <div class="counter-value">${val}</div>
        `;
        
        listEl.appendChild(card);
    });
    
    // Update tabs UI
    segments.forEach(btn => {
        if(btn.dataset.tab === state.view) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Event Listeners
addBtn.addEventListener('click', addCounter);

segments.forEach(btn => {
    btn.addEventListener('click', (e) => {
        state.view = e.target.dataset.tab;
        render();
    });
});

// Re-check date reset on visibility change (e.g. reopening app next day)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkDateReset();
    render();
  }
});

init();
