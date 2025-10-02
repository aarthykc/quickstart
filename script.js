class WaterIntakeTracker {
    constructor() {
        this.currentCount = 0;
        this.dailyGoal = 8;
        this.history = [];
        this.initializeFromStorage();
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.checkNewDay();
    }

    initializeFromStorage() {
        const today = new Date().toDateString();
        const storedData = JSON.parse(localStorage.getItem('waterIntakeData') || '{}');
        
        if (storedData.date === today) {
            this.currentCount = storedData.count || 0;
            this.history = storedData.history || [];
        } else {
            this.currentCount = 0;
            this.history = [];
        }
        
        this.dailyGoal = parseInt(localStorage.getItem('dailyGoal') || '8');
    }

    initializeElements() {
        this.elements = {
            currentCount: document.getElementById('current-count'),
            goalDisplay: document.getElementById('goal-display'),
            dailyGoalInput: document.getElementById('daily-goal'),
            setGoalBtn: document.getElementById('set-goal'),
            addGlassBtn: document.querySelector('.add-glass'),
            addBottleBtn: document.querySelector('.add-bottle'),
            undoBtn: document.getElementById('undo-btn'),
            resetBtn: document.getElementById('reset-btn'),
            totalMl: document.getElementById('total-ml'),
            percentage: document.getElementById('percentage'),
            remaining: document.getElementById('remaining'),
            encouragement: document.getElementById('encouragement'),
            progressCircle: document.querySelector('.progress-ring-circle')
        };
        
        this.elements.dailyGoalInput.value = this.dailyGoal;
    }

    attachEventListeners() {
        this.elements.setGoalBtn.addEventListener('click', () => this.setDailyGoal());
        this.elements.addGlassBtn.addEventListener('click', () => this.addIntake(1, 'glass'));
        this.elements.addBottleBtn.addEventListener('click', () => this.addIntake(2, 'bottle'));
        this.elements.undoBtn.addEventListener('click', () => this.undoLast());
        this.elements.resetBtn.addEventListener('click', () => this.resetDay());
        
        this.elements.dailyGoalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setDailyGoal();
            }
        });
    }

    setDailyGoal() {
        const newGoal = parseInt(this.elements.dailyGoalInput.value);
        if (newGoal >= 1 && newGoal <= 20) {
            this.dailyGoal = newGoal;
            localStorage.setItem('dailyGoal', this.dailyGoal.toString());
            this.updateDisplay();
            this.showMessage('Goal updated! 🎯');
        } else {
            this.showMessage('Please enter a goal between 1 and 20 glasses', 'error');
        }
    }

    addIntake(glasses, type) {
        this.currentCount += glasses;
        this.history.push({
            timestamp: Date.now(),
            amount: glasses,
            type: type
        });
        
        this.saveToStorage();
        this.updateDisplay();
        this.celebrateProgress();
        
        if (this.currentCount >= this.dailyGoal) {
            this.celebrateGoal();
        }
    }

    undoLast() {
        if (this.history.length > 0) {
            const lastEntry = this.history.pop();
            this.currentCount -= lastEntry.amount;
            this.currentCount = Math.max(0, this.currentCount);
            this.saveToStorage();
            this.updateDisplay();
            this.showMessage('Last entry removed 🔙');
        } else {
            this.showMessage('Nothing to undo!', 'info');
        }
    }

    resetDay() {
        if (confirm('Are you sure you want to reset today\'s progress?')) {
            this.currentCount = 0;
            this.history = [];
            this.saveToStorage();
            this.updateDisplay();
            this.showMessage('Day reset! Fresh start! 🌅');
        }
    }

    updateDisplay() {
        this.elements.currentCount.textContent = this.currentCount;
        this.elements.goalDisplay.textContent = this.dailyGoal;
        
        const totalMl = this.currentCount * 250;
        this.elements.totalMl.textContent = totalMl.toLocaleString();
        
        const percentage = Math.min(100, Math.round((this.currentCount / this.dailyGoal) * 100));
        this.elements.percentage.textContent = percentage + '%';
        
        const remaining = Math.max(0, this.dailyGoal - this.currentCount);
        this.elements.remaining.textContent = remaining;
        
        this.updateProgressCircle(percentage);
        this.updateEncouragement();
    }

    updateProgressCircle(percentage) {
        const circumference = 2 * Math.PI * 85;
        const offset = circumference - (percentage / 100) * circumference;
        
        this.elements.progressCircle.style.strokeDashoffset = offset;
        
        if (percentage > 0) {
            this.elements.progressCircle.classList.add('active');
        } else {
            this.elements.progressCircle.classList.remove('active');
        }
    }

    updateEncouragement() {
        const percentage = (this.currentCount / this.dailyGoal) * 100;
        let message = '';
        
        if (percentage === 0) {
            message = "Ready to start hydrating? Let's do this! 💪";
        } else if (percentage < 25) {
            message = "Great start! Keep the momentum going! 🌟";
        } else if (percentage < 50) {
            message = "You're doing awesome! Halfway there! 🚀";
        } else if (percentage < 75) {
            message = "Fantastic progress! You're crushing it! 🔥";
        } else if (percentage < 100) {
            message = "So close! Just a few more glasses! 💪";
        } else {
            message = "Goal achieved! You're a hydration champion! 🏆✨";
        }
        
        this.elements.encouragement.querySelector('p').textContent = message;
    }

    celebrateProgress() {
        this.elements.addGlassBtn.classList.add('celebration');
        this.elements.addBottleBtn.classList.add('celebration');
        
        setTimeout(() => {
            this.elements.addGlassBtn.classList.remove('celebration');
            this.elements.addBottleBtn.classList.remove('celebration');
        }, 600);
    }

    celebrateGoal() {
        document.querySelector('.progress-circle').classList.add('pulse');
        this.elements.encouragement.classList.add('celebration');
        
        setTimeout(() => {
            document.querySelector('.progress-circle').classList.remove('pulse');
            this.elements.encouragement.classList.remove('celebration');
        }, 2000);
        
        this.showMessage('🎉 Congratulations! Daily goal achieved! 🎉', 'success');
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        switch(type) {
            case 'success':
                messageElement.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                break;
            case 'error':
                messageElement.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
                break;
            default:
                messageElement.style.background = 'linear-gradient(135deg, #2196f3, #1976d2)';
        }
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        const today = new Date().toDateString();
        const dataToSave = {
            date: today,
            count: this.currentCount,
            history: this.history
        };
        localStorage.setItem('waterIntakeData', JSON.stringify(dataToSave));
    }

    checkNewDay() {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisit');
        
        if (lastVisit && lastVisit !== today) {
            this.showMessage('Welcome back! Starting fresh for today! 🌅');
        }
        
        localStorage.setItem('lastVisit', today);
    }
}

const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    new WaterIntakeTracker();
});