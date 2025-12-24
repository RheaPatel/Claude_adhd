// ===== STATE MANAGEMENT =====
let state = {
    // Player Stats
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    points: 0,
    streak: 0,
    lastActiveDate: null,

    // Timer
    timerMinutes: 25,
    timerSeconds: 0,
    isTimerRunning: false,
    timerInterval: null,
    timerType: 'focus',
    completedSessions: 0,

    // Tasks
    tasks: [],
    nextTaskId: 1,

    // Achievements
    achievements: [
        { id: 'first_quest', name: 'First Quest', desc: 'Complete your first task', icon: '🎯', unlocked: false, xpReward: 10 },
        { id: 'quest_master', name: 'Quest Master', desc: 'Complete 10 tasks', icon: '⚔️', unlocked: false, xpReward: 50 },
        { id: 'first_focus', name: 'First Focus', desc: 'Complete your first focus session', icon: '🧘', unlocked: false, xpReward: 15 },
        { id: 'focus_warrior', name: 'Focus Warrior', desc: 'Complete 10 focus sessions', icon: '🔥', unlocked: false, xpReward: 75 },
        { id: 'streak_3', name: '3-Day Streak', desc: 'Stay active for 3 days', icon: '📅', unlocked: false, xpReward: 30 },
        { id: 'streak_7', name: 'Week Warrior', desc: 'Stay active for 7 days', icon: '🌟', unlocked: false, xpReward: 100 },
        { id: 'level_5', name: 'Level 5', desc: 'Reach level 5', icon: '👑', unlocked: false, xpReward: 50 },
        { id: 'speedrunner', name: 'Speedrunner', desc: 'Complete 5 tasks in one day', icon: '⚡', unlocked: false, xpReward: 40 },
    ],

    // Stats
    totalTasksCompleted: 0,
    tasksCompletedToday: 0,
};

// ===== INITIALIZATION =====
function init() {
    loadState();
    updateStreak();
    renderStats();
    renderTasks();
    renderAchievements();
    updateTimerDisplay();
    attachEventListeners();
    checkDailyReset();
}

// ===== LOCAL STORAGE =====
function saveState() {
    localStorage.setItem('focusQuestState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('focusQuestState');
    if (saved) {
        const loadedState = JSON.parse(saved);
        state = { ...state, ...loadedState };
        // Reset timer state
        state.isTimerRunning = false;
        state.timerInterval = null;
    }
}

// ===== STREAK MANAGEMENT =====
function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = state.lastActiveDate;

    if (lastActive === today) {
        // Same day, keep streak
        return;
    }

    if (!lastActive) {
        // First time
        state.streak = 1;
        state.lastActiveDate = today;
        saveState();
        return;
    }

    const lastDate = new Date(lastActive);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Consecutive day
        state.streak++;
        state.lastActiveDate = today;
        checkAchievement('streak_3', state.streak >= 3);
        checkAchievement('streak_7', state.streak >= 7);
        saveState();
        showCelebration('🔥 Streak Continue!', `${state.streak} days!`, 0);
    } else if (diffDays > 1) {
        // Streak broken
        state.streak = 1;
        state.lastActiveDate = today;
        saveState();
    }
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastDailyReset');

    if (lastReset !== today) {
        state.tasksCompletedToday = 0;
        localStorage.setItem('lastDailyReset', today);
        saveState();
    }
}

// ===== XP AND LEVELING =====
function addXP(amount) {
    state.xp += amount;

    while (state.xp >= state.xpToNextLevel) {
        state.xp -= state.xpToNextLevel;
        state.level++;
        state.xpToNextLevel = Math.floor(state.xpToNextLevel * 1.5);

        showCelebration('🎊 LEVEL UP!', `You reached level ${state.level}!`, 100);
        playSound('levelUpSound');

        checkAchievement('level_5', state.level >= 5);
    }

    saveState();
    renderStats();
}

function addPoints(amount) {
    state.points += amount;
    saveState();
    renderStats();
}

// ===== STATS RENDERING =====
function renderStats() {
    document.getElementById('level').textContent = state.level;
    document.getElementById('xp').textContent = state.xp;
    document.getElementById('streak').textContent = state.streak;
    document.getElementById('points').textContent = state.points;

    // Update XP bar
    const xpPercentage = (state.xp / state.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${xpPercentage}%`;
    document.getElementById('xpText').textContent = `${state.xp} / ${state.xpToNextLevel} XP`;
}

// ===== TIMER FUNCTIONALITY =====
function updateTimerDisplay() {
    const minutes = String(state.timerMinutes).padStart(2, '0');
    const seconds = String(state.timerSeconds).padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
    if (state.isTimerRunning) return;

    state.isTimerRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    state.timerInterval = setInterval(() => {
        if (state.timerSeconds === 0) {
            if (state.timerMinutes === 0) {
                // Timer completed
                timerComplete();
                return;
            }
            state.timerMinutes--;
            state.timerSeconds = 59;
        } else {
            state.timerSeconds--;
        }

        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    state.isTimerRunning = false;
    clearInterval(state.timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function resetTimer() {
    pauseTimer();
    state.timerMinutes = 25;
    state.timerSeconds = 0;
    updateTimerDisplay();
}

function setTimerPreset(minutes) {
    if (state.isTimerRunning) {
        pauseTimer();
    }
    state.timerMinutes = minutes;
    state.timerSeconds = 0;
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();

    state.completedSessions++;

    // Rewards
    const xpReward = 25;
    const pointsReward = 50;

    addXP(xpReward);
    addPoints(pointsReward);

    showCelebration('⏱️ Focus Session Complete!', `+${xpReward} XP, +${pointsReward} points!`, pointsReward);
    playSound('completeSound');

    checkAchievement('first_focus', state.completedSessions >= 1);
    checkAchievement('focus_warrior', state.completedSessions >= 10);

    // Reset timer
    state.timerMinutes = 25;
    state.timerSeconds = 0;
    updateTimerDisplay();

    saveState();
}

// ===== TASK MANAGEMENT =====
function addTask() {
    const input = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('taskPriority');
    const text = input.value.trim();

    if (!text) return;

    const task = {
        id: state.nextTaskId++,
        text: text,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    input.value = '';

    saveState();
    renderTasks();
}

function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        // Task completed - give rewards
        let xpReward = 10;
        let pointsReward = 20;

        // Bonus for priority
        if (task.priority === 'high') {
            xpReward += 5;
            pointsReward += 10;
        } else if (task.priority === 'medium') {
            xpReward += 2;
            pointsReward += 5;
        }

        addXP(xpReward);
        addPoints(pointsReward);

        state.totalTasksCompleted++;
        state.tasksCompletedToday++;

        showCelebration('✅ Quest Complete!', `+${xpReward} XP, +${pointsReward} points!`, pointsReward);
        playSound('completeSound');

        // Check achievements
        checkAchievement('first_quest', state.totalTasksCompleted >= 1);
        checkAchievement('quest_master', state.totalTasksCompleted >= 10);
        checkAchievement('speedrunner', state.tasksCompletedToday >= 5);
    }

    saveState();
    renderTasks();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveState();
    renderTasks();
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');

    if (state.tasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No quests yet. Add one to get started! 🚀</p>';
        return;
    }

    // Sort: incomplete first, then by priority
    const sortedTasks = [...state.tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    tasksList.innerHTML = sortedTasks.map(task => `
        <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''} slide-in">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `).join('');
}

// ===== ACHIEVEMENTS =====
function checkAchievement(achievementId, condition) {
    const achievement = state.achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) return;

    if (condition) {
        achievement.unlocked = true;
        addXP(achievement.xpReward);

        showCelebration(
            `🏆 Achievement Unlocked!`,
            `${achievement.icon} ${achievement.name}`,
            achievement.xpReward
        );

        playSound('levelUpSound');
        saveState();
        renderAchievements();
    }
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');

    grid.innerHTML = state.achievements.map(achievement => `
        <div class="achievement ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        </div>
    `).join('');
}

// ===== CELEBRATION OVERLAY =====
function showCelebration(message, subMessage, points) {
    const overlay = document.getElementById('celebrationOverlay');
    const messageEl = document.getElementById('celebrationMessage');
    const pointsEl = document.getElementById('celebrationPoints');
    const emojiEl = document.getElementById('celebrationEmoji');

    // Set random celebration emoji
    const emojis = ['🎉', '🎊', '⭐', '💫', '✨', '🌟', '🏆', '👏'];
    emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    messageEl.textContent = message;
    pointsEl.textContent = subMessage;

    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2000);
}

// ===== SOUND EFFECTS =====
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    // Timer controls
    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    // Timer presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const minutes = parseInt(e.target.dataset.minutes);
            setTimerPreset(minutes);
        });
    });

    // Task management
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== NOTIFICATION API (Optional Enhancement) =====
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '🎯',
            badge: '🎯'
        });
    }
}

// ===== START THE APP =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    requestNotificationPermission();
});

// Make functions globally accessible for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
