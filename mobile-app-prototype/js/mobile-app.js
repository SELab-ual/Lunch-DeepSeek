// Mobile App Prototype for Sprint 1
class MobileApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api'; // In production, use relative URL or config
        this.currentScreen = 'welcome';
        this.memoryUsage = 0;
        this.storageUsage = 0;
        this.init();
    }

    init() {
        this.startHealthCheck();
        this.loadSystemStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle back button
        window.addEventListener('popstate', () => {
            this.goBack();
        });
    }

    navigateTo(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        document.getElementById(`${screenId}-screen`).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick')?.includes(screenId)) {
                item.classList.add('active');
            }
        });
        
        this.currentScreen = screenId;
    }

    goBack() {
        this.navigateTo('welcome');
    }

    async checkUsername(username) {
        if (username.length < 3) return;
        
        try {
            const response = await this.apiGet(`/users/check-username/${username}`);
            const errorElement = document.getElementById('username-error');
            
            if (!response.available) {
                errorElement.textContent = 'Username already taken (QR17)';
                document.getElementById('reg-username').classList.add('error');
                this.updateRequirement('qr17', false);
            } else {
                errorElement.textContent = '';
                document.getElementById('reg-username').classList.remove('error');
                this.updateRequirement('qr17', true);
            }
        } catch (error) {
            console.error('Failed to check username:', error);
        }
    }

    checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };
        
        // Update requirement list
        document.getElementById('req-length').className = requirements.length ? 'valid' : '';
        document.getElementById('req-upper').className = requirements.upper ? 'valid' : '';
        document.getElementById('req-lower').className = requirements.lower ? 'valid' : '';
        document.getElementById('req-number').className = requirements.number ? 'valid' : '';
        
        // Update strength bar
        const strengthBar = document.getElementById('strength-bar');
        const validCount = Object.values(requirements).filter(Boolean).length;
        
        strengthBar.className = '';
        if (validCount <= 1) {
            strengthBar.classList.add('strength-weak');
        } else if (validCount === 2) {
            strengthBar.classList.add('strength-fair');
        } else if (validCount === 3) {
            strengthBar.classList.add('strength-good');
        } else if (validCount === 4) {
            strengthBar.classList.add('strength-strong');
        }
    }

    async submitRegistration() {
        const form = document.getElementById('register-form');
        const registerBtn = document.getElementById('register-btn');
        const resultDiv = document.getElementById('register-result');
        
        const formData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            phone: document.getElementById('reg-phone').value || null
        };
        
        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Disable button
        registerBtn.disabled = true;
        registerBtn.textContent = 'Registering...';
        
        try {
            // Check memory constraint before request (QR11)
            const requestSize = new Blob([JSON.stringify(formData)]).size / (1024 * 1024);
            if (this.memoryUsage + requestSize > 20) {
                throw new Error('Would exceed memory constraint (QR11)');
            }
            
            const response = await this.apiPost('/users/register', formData);
            
            // Update storage usage (QR10)
            this.storageUsage += requestSize;
            this.updateStats();
            
            // Show success screen
            document.getElementById('success-message').textContent = 
                `Welcome, ${response.username}! Your account has been created.`;
            document.getElementById('user-info').innerHTML = `
                <p><strong>Username:</strong> ${response.username}</p>
                <p><strong>Email:</strong> ${response.email}</p>
                <p><strong>Account ID:</strong> ${response.id.substring(0, 8)}...</p>
            `;
            
            this.navigateTo('success');
            
            // Update requirements
            this.updateRequirement('fr3', true);
            
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="error-message">${error.message}</div>
            `;
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
        }
    }

    validateForm(data) {
        if (!data.username || data.username.length < 3) {
            alert('Username must be at least 3 characters');
            return false;
        }
        
        if (!this.isValidEmail(data.email)) {
            alert('Please enter a valid email');
            return false;
        }
        
        if (!this.isValidPassword(data.password)) {
            alert('Password does not meet requirements');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPassword(password) {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password);
    }

    async loadSystemStats() {
        try {
            const metrics = await this.apiGet('/metrics');
            
            this.memoryUsage = metrics.constraints.current_memory_mb;
            this.storageUsage = metrics.constraints.current_storage_mb;
            
            this.updateStats();
            
            // Check constraints
            this.updateRequirement('qr10', this.storageUsage <= 20);
            this.updateRequirement('qr11', this.memoryUsage <= 20);
            
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStats() {
        // Update memory display
        const memoryPercent = (this.memoryUsage / 20) * 100;
        document.getElementById('memory-progress').style.width = `${memoryPercent}%`;
        document.getElementById('memory-value').textContent = 
            `${this.memoryUsage.toFixed(2)}/20 MB`;
        
        // Update storage display
        const storagePercent = (this.storageUsage / 20) * 100;
        document.getElementById('storage-progress').style.width = `${storagePercent}%`;
        document.getElementById('storage-value').textContent = 
            `${this.storageUsage.toFixed(2)}/20 MB`;
        
        // Color coding based on usage
        const memoryBar = document.getElementById('memory-progress');
        const storageBar = document.getElementById('storage-progress');
        
        if (memoryPercent > 90) {
            memoryBar.style.background = '#f56565';
        } else if (memoryPercent > 70) {
            memoryBar.style.background = '#ed8936';
        }
        
        if (storagePercent > 90) {
            storageBar.style.background = '#f56565';
        } else if (storagePercent > 70) {
            storageBar.style.background = '#ed8936';
        }
    }

    updateRequirement(reqId, isValid) {
        const element = document.getElementById(`req-${reqId}`);
        if (element) {
            element.innerHTML = `${isValid ? '✅' : '❌'} ${element.textContent.substring(2)}`;
            element.className = isValid ? 'verified' : 'failed';
        }
    }

    async startHealthCheck() {
        const check = async () => {
            try {
                await this.apiGet('/health');
                document.getElementById('connection-status').innerHTML = '📶 Connected';
                document.getElementById('connection-status').style.color = '#48bb78';
                this.updateRequirement('qr22', true);
                this.updateRequirement('fr1', true); // Simulate app download
            } catch {
                document.getElementById('connection-status').innerHTML = '📶 Disconnected';
                document.getElementById('connection-status').style.color = '#f56565';
                this.updateRequirement('qr22', false);
            }
        };
        
        await check();
        setInterval(check, 30000);
    }

    showStats() {
        // Show detailed stats modal or navigate to stats view
        alert(`System Stats:
Memory: ${this.memoryUsage.toFixed(2)}/20 MB
Storage: ${this.storageUsage.toFixed(2)}/20 MB
Connection: ${navigator.onLine ? 'Online' : 'Offline'}`);
    }

    async apiGet(endpoint) {
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    }

    async apiPost(endpoint, data) {
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        return response.json();
    }
}

// Initialize app
const app = new MobileApp();