// PUT YOUR SCRAMBLED GEMINI API KEY INSIDE THE QUOTES BELOW:
const SCRAMBLED_KEY = "QVEuQWI4Uk42S00wSVA3clBRUXlHOU1FUzU0c3c2a1FXaWUwc3BxczNwaFE0RTVxWks3a0E=";

// Local Database Structure Layer
let appData = {
    profile: null, // { name, class }
    target: null,  // { name, startDate, endDate, tasks: [ {id, text, done} ] }
    attendance: {} // { "YYYY-MM-DD": true/false }
};

// Custom Motivational Quotes Database mapped by pages
const pageQuotes = {
    'page-welcome': "✨ \"The secret of getting ahead is getting started.\" ✨",
    'page-create-profile': "📝 \"Set your identity high; you are capable of amazing things!\" ✨",
    'page-set-target': "🎯 \"A goal without a plan is just a wish.\" ✨",
    'page-dashboard': "⚡ \"Action is the foundational key to all success.\" ✨",
    'page-progress': "📊 \"Progress, not perfection. Every step counts!\" ✨",
    'page-achievements': "🏆 \"Success is the sum of small efforts, repeated day in and day out.\" ✨",
    'page-practice': "🧠 \"Do not fear mistakes. Fear only the lack of practice.\" ✨"
};

// Initialization entry point
document.addEventListener("DOMContentLoaded", () => {
    loadDataFromStorage();
    initPWA();
    updateCurrentDateDisplay();
    
    // Route to appropriate view depending on existing state
    if (appData.profile && appData.target) {
        navigateTo('page-dashboard');
    } else if (appData.profile) {
        navigateTo('page-set-target');
    } else {
        navigateTo('page-welcome');
    }
});

// Navigation Controller Logic
function navigateTo(pageId) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    // Dynamically rotate page quotes
    const quoteBar = document.getElementById('quote-bar');
    if (pageQuotes[pageId]) {
        quoteBar.innerText = pageQuotes[pageId];
    }
    
    if(pageId === 'page-dashboard') {
        renderDashboard();
    }
    if(pageId === 'page-progress') {
        calculateMetrics();
    }
}

// Data Storage Sync Modules
function saveToStorage() {
    localStorage.setItem('journey_tracker_data', JSON.stringify(appData));
}

function loadDataFromStorage() {
    const saved = localStorage.getItem('journey_tracker_data');
    if (saved) {
        appData = JSON.parse(saved);
    }
}

// Profile Event Logic Handler
function saveProfile() {
    const nameInput = document.getElementById('student-name').value.trim();
    const classInput = document.getElementById('student-class').value.trim();
    
    if(!nameInput || !classInput) {
        alert("🚨 Please fill in all fields to start your journey!");
        return;
    }
    
    appData.profile = { name: nameInput, class: classInput };
    saveToStorage();
    navigateTo('page-set-target');
}

// Target Configurations Logic Handler
function saveTarget() {
    const title = document.getElementById('target-name').value.trim();
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    const rawTasks = document.getElementById('target-tasks').value.trim();
    
    if(!title || !start || !end || !rawTasks) {
        alert("🚨 Ensure all fields and task breakdowns are defined!");
        return;
    }

    const taskArray = rawTasks.split(',').map((t, idx) => {
        return { id: idx, text: t.trim(), done: false };
    }).filter(t => t.text.length > 0);

    appData.target = { name: title, startDate: start, endDate: end, tasks: taskArray };
    saveToStorage();
    navigateTo('page-dashboard');
}

// Dashboard View Rendering Management 
function renderDashboard() {
    if(!appData.profile || !appData.target) return;
    
    document.getElementById('dash-name').innerText = appData.profile.name;
    document.getElementById('dash-class').innerText = appData.profile.class;
    document.getElementById('dash-target').innerText = appData.target.name;
    document.getElementById('dash-timeline').innerText = `${appData.target.startDate} to ${appData.target.endDate}`;
    
    // Evaluate today's attendance status
    const todayStr = getTodayDateString();
    const attButtons = document.getElementById('attendance-buttons');
    const attStatus = document.getElementById('attendance-status-msg');
    
    if(appData.attendance[todayStr] !== undefined) {
        attButtons.classList.add('hidden');
        attStatus.innerHTML = appData.attendance[todayStr] ? 
            "🟢 Checked In: <strong>Present</strong> for today! Keep it up 🔥" : 
            "🔴 Marked: <strong>Absent</strong> for today. Get back stronger tomorrow!";
    } else {
        attButtons.classList.remove('hidden');
        attStatus.innerText = "⏳ Awaiting daily check-in verification.";
    }
    
    // Dynamic generation of tasks checklist
    const checklistContainer = document.getElementById('checklist-container');
    checklistContainer.innerHTML = "";
    
    appData.target.tasks.forEach(task => {
        const itemRow = document.createElement('div');
        itemRow.className = "checklist-item";
        
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => {
            task.done = checkbox.checked;
            saveToStorage();
        });
        
        const label = document.createElement('label');
        label.innerText = task.text;
        if(task.done) label.style.textDecoration = "line-through";
        
        checkbox.addEventListener('change', () => {
            if(checkbox.checked) label.style.textDecoration = "line-through";
            else label.style.textDecoration = "none";
        });

        itemRow.appendChild(checkbox);
        itemRow.appendChild(label);
        checklistContainer.appendChild(itemRow);
    });
}

// Attendance Logic handler
function markAttendance(isPresent) {
    const todayStr = getTodayDateString();
    appData.attendance[todayStr] = isPresent;
    saveToStorage();
    renderDashboard();
}

// Update settings procedures
function editProfile() {
    document.getElementById('student-name').value = appData.profile.name;
    document.getElementById('student-class').value = appData.profile.class;
    navigateTo('page-create-profile');
}

function editTarget() {
    document.getElementById('target-name').value = appData.target.name;
    document.getElementById('start-date').value = appData.target.startDate;
    document.getElementById('end-date').value = appData.target.endDate;
    document.getElementById('target-tasks').value = appData.target.tasks.map(t => t.text).join(', ');
    navigateTo('page-set-target');
}

// Factory Reset Procedure
function deleteProfile() {
    if(confirm("⚠️ Critical Warning: This action will permanently erase your profile progress, metrics, checkpoints and configuration details. Proceed?")) {
        localStorage.removeItem('journey_tracker_data');
        appData = { profile: null, target: null, attendance: {} };
        
        // Wipe all inputs fields values safely
        document.getElementById('student-name').value = "";
        document.getElementById('student-class').value = "";
        document.getElementById('target-name').value = "";
        document.getElementById('start-date').value = "";
        document.getElementById('end-date').value = "";
        document.getElementById('target-tasks').value = "";
        
        navigateTo('page-welcome');
    }
}

// Analytics and Performance processing calculations engine
function calculateMetrics() {
    if(!appData.target) return;
    
    // 1. Task Progress Calculations
    const totalTasks = appData.target.tasks.length;
    const completedTasks = appData.target.tasks.filter(t => t.done).length;
    document.getElementById('metric-tasks-done').innerText = completedTasks;
    document.getElementById('metric-tasks-total').innerText = totalTasks;
    
    // 2. Attendance Counts Calculations
    let presentCount = 0;
    let absentCount = 0;
    Object.values(appData.attendance).forEach(val => {
        if(val === true) presentCount++;
        if(val === false) absentCount++;
    });
    document.getElementById('metric-present').innerText = presentCount;
    document.getElementById('metric-absent').innerText = absentCount;
    
    // 3. Current Streak Module
    let streak = 0;
    let checkDate = new Date();
    while(true) {
        let dateStr = checkDate.toISOString().split('T')[0];
        if(appData.attendance[dateStr] === true) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            if(dateStr === getTodayDateString() && appData.attendance[dateStr] === undefined) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            }
            break;
        }
    }
    document.getElementById('metric-streak').innerText = streak;
    
    // 4. Deadline Countdown Calculations
    const today = new Date(getTodayDateString());
    const end = new Date(appData.target.endDate);
    const timeDiff = end.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    document.getElementById('metric-days-left').innerText = daysLeft > 0 ? daysLeft : 0;
}

// Achievement badges definitions configuration mapping rules
const badgeCriteria = [
    { name: "Beginners 🎯", desc: "Profile initialized and track targets created.", icon: "fa-baby", check: () => appData.profile !== null },
    { name: "Consistent 🗓️", desc: "Logged attendance check for at least 3 days.", icon: "fa-calendar-days", check: () => Object.values(appData.attendance).filter(v=>v).length >= 3 },
    { name: "Hard Working 💪", desc: "Completed 50% or more tasks from tracker setup.", icon: "fa-screwdriver-wrenches", check: () => (appData.target.tasks.filter(t=>t.done).length / appData.target.tasks.length) >= 0.5 },
    { name: "Dedicated 🔥", desc: "Maintained a 5-day continuous present streak.", icon: "fa-fire-flame-curved", check: () => parseInt(document.getElementById('metric-streak').innerText || 0) >= 5 },
    { name: "Advanced 🧠", desc: "Completed all listed target tasks successfully.", icon: "fa-brain", check: () => appData.target.tasks.every(t=>t.done) },
    { name: "Professional 🎓", desc: "Maintained presence records spanning across 10 distinct tracking windows.", icon: "fa-user-tie", check: () => Object.values(appData.attendance).filter(v=>v).length >= 10 },
    { name: "Ultra Consistent ⚡", desc: "Maintained a high 15-day streak standard.", icon: "fa-bolt", check: () => parseInt(document.getElementById('metric-streak').innerText || 0) >= 15 },
    { name: "Ultra Dedicated 👑", desc: "Accumulated more than 20 total active high tracking marks.", icon: "fa-crown", check: () => Object.values(appData.attendance).filter(v=>v).length >= 20 }
];

function renderAchievements() {
    calculateMetrics(); // Ensure updated states values
    const container = document.getElementById('badges-container');
    container.innerHTML = "";
    
    badgeCriteria.forEach(badge => {
        const isUnlocked = badge.check();
        const card = document.createElement('div');
        card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
            <i class="fa-solid ${badge.icon}" style="color: ${isUnlocked ? '#f59e0b' : '#9ca3af'}"></i>
            <h4>${badge.name}</h4>
            <p style="font-size:0.75rem; color:#6b7280; margin-top:4px;">${badge.desc}</p>
        `;
        container.appendChild(card);
    });
}

// Global secure handling for integrated Gemini API processing
async function generateAIQuestion() {
    // Automatically decrypts your scrambled string securely into transient system memory
    if(!SCRAMBLED_KEY || SCRAMBLED_KEY === "PASTE_YOUR_SCRAMBLED_API_KEY_HERE") {
        alert("🚨 Developer Error: Please provide your scrambled API key inside app.js.");
        return;
    }
    
    const apiKey = atob(SCRAMBLED_KEY); 
    const className = document.getElementById('ai-class').value.trim();
    const subject = document.getElementById('ai-subject').value.trim();
    const chapter = document.getElementById('ai-chapter').value.trim();
    
    if(!className || !subject || !chapter) {
        alert("🚨 Please fill in your Class, Subject, and Chapter to generate a practice question!");
        return;
    }
    
    const loadingNode = document.getElementById('ai-loading');
    const responseBox = document.getElementById('ai-response-box');
    
    loadingNode.classList.remove('hidden');
    responseBox.classList.add('hidden');
    
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const contextPrompt = `Generate one conceptual short-answer practice question for a student in class "${className}" studying the subject "${subject}" inside the chapter "${chapter}". Present only the question cleanly without answers, structural guidelines, or additional text blocks.`;

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: contextPrompt }] }]
            })
        });
        
        const parseResult = await response.json();
        
        if(parseResult.candidates && parseResult.candidates[0].content.parts[0].text) {
            let aiTextOutput = parseResult.candidates[0].content.parts[0].text;
            document.getElementById('ai-question-text').innerText = aiTextOutput;
            responseBox.classList.remove('hidden');
        } else {
            alert("⚠️ Something went wrong generating the question. Please verify target inputs.");
        }
    } catch (err) {
        console.error(err);
        alert("❌ Failed to contact Gemini Endpoints. Check Network settings.");
    } finaly {
        loadingNode.classList.add('hidden');
    }
}

// Utilities Helpers Engines
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function updateCurrentDateDisplay() {
    document.getElementById('current-date-str').innerText = new Date().toDateString();
}

// Native Progressive Web Application Setup Engine
let deferredPrompt;
function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log("⚙️ Service Worker Pipeline Synced."))
            .catch(err => console.error("❌ Service Worker Registration Blocked: ", err));
    }
    
    const banner = document.getElementById('pwa-install-banner');
    const btnInstall = document.getElementById('btn-pwa-install');
    const btnClose = document.getElementById('btn-pwa-close');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => {
            banner.classList.remove('hidden');
        }, 3000);
    });

    btnInstall.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            banner.classList.add('hidden');
        }
    });

    btnClose.addEventListener('click', () => {
        banner.classList.add('hidden');
    });
}
  
