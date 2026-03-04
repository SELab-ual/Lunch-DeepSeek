// Main application controller
class App {
    constructor() {
        this.currentView = 'home';
        this.apiBaseUrl = '/api';
        this.init();
    }

    async init() {
        this.setupRouting();
        this.loadView(window.location.hash || '#/');
        this.startHealthCheck();
        this.loadSystemStats();
    }

    setupRouting() {
        window.addEventListener('hashchange', () => {
            this.loadView(window.location.hash);
        });
    }

    async loadView(hash) {
        const path = hash.replace('#', '') || '/';
        const appElement = document.getElementById('app');
        
        // Show loading spinner
        appElement.innerHTML = '<div class="spinner"></div>';
        
        try {
            switch(path) {
                case '/':
                case '':
                    await this.showHome();
                    break;
                case '/register-user':
                    await this.showUserRegistration();
                    break;
                case '/register-owner':
                    await this.showOwnerRegistration();
                    break;
                case '/status':
                    await this.showStatus();
                    break;
                default:
                    this.showNotFound();
            }
        } catch (error) {
            console.error('Error loading view:', error);
            this.showError('Failed to load view');
        }
        
        this.updateActiveNavLink(path);
    }

    async showHome() {
        const template = document.getElementById('home-template');
        const content = template.content.cloneNode(true);
        document.getElementById('app').innerHTML = '';
        document.getElementById('app').appendChild(content);
    }

    async showUserRegistration() {
        const html = `
            <div class="form-container">
                <h2>Mobile User Registration</h2>
                <p class="lead">Create your account to find amazing restaurants!</p>
                
                <form id="user-registration-form">
                    <div class="form-group">
                        <label for="username">Username *</label>
                        <input type="text" id="username" name="username" required minlength="3" maxlength="50">
                        <div class="error-message" id="username-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                        <div class="error-message" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password *</label>
                        <input type="password" id="password" name="password" required minlength="8">
                        <div class="password-requirements">
                            Password must contain at least:
                            <ul>
                                <li id="req-length">8 characters</li>
                                <li id="req-uppercase">One uppercase letter</li>
                                <li id="req-lowercase">One lowercase letter</li>
                                <li id="req-number">One number</li>
                            </ul>
                        </div>
                        <div class="error-message" id="password-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number (optional)</label>
                        <input type="tel" id="phone" name="phone">
                        <div class="error-message" id="phone-error"></div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" id="register-btn">Register</button>
                </form>
                
                <div id="registration-result"></div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        this.setupUserRegistrationForm();
    }

    async showOwnerRegistration() {
        const html = `
            <div class="form-container">
                <h2>Restaurant Owner Registration</h2>
                <p class="lead">Register your restaurant on our platform!</p>
                
                <form id="owner-registration-form">
                    <div class="form-group">
                        <label for="username">Username *</label>
                        <input type="text" id="username" name="username" required minlength="3" maxlength="50">
                        <div class="error-message" id="username-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                        <div class="error-message" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password *</label>
                        <input type="password" id="password" name="password" required minlength="8">
                        <div class="password-requirements">
                            Password must contain at least:
                            <ul>
                                <li id="req-length">8 characters</li>
                                <li id="req-uppercase">One uppercase letter</li>
                                <li id="req-lowercase">One lowercase letter</li>
                                <li id="req-number">One number</li>
                            </ul>
                        </div>
                        <div class="error-message" id="password-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Restaurant Address *</label>
                        <textarea id="address" name="address" required minlength="10" rows="3"></textarea>
                        <div class="error-message" id="address-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input type="tel" id="phone" name="phone" required minlength="10">
                        <div class="error-message" id="phone-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="mobile-phone">Mobile Phone (optional)</label>
                        <input type="tel" id="mobile-phone" name="mobile_phone">
                    </div>
                    
                    <button type="submit" class="btn btn-secondary" id="register-btn">Register as Owner</button>
                </form>
                
                <div id="registration-result"></div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        this.setupOwnerRegistrationForm();
    }

    async showStatus() {
        try {
            const health = await this.apiGet('/health');
            const metrics = await this.apiGet('/metrics');
            
            const html = `
                <div class="status-container">
                    <h2>System Status</h2>
                    
                    <div class="status-grid">
                        <div class="status-card">
                            <h3>🖥️ System Health</h3>
                            <p>Status: <span class="status-${health.status}">${health.status}</span></p>
                            <p>Version: ${health.version}</p>
                            <p>Database: ${health.database}</p>
                            <p>Last Check: ${new Date(health.timestamp).toLocaleString()}</p>
                        </div>
                        
                        <div class="status-card">
                            <h3>📊 User Statistics</h3>
                            <p>Mobile Users: ${metrics.users.mobile_users}</p>
                            <p>Restaurant Owners: ${metrics.users.restaurant_owners}</p>
                            <p>Total Users: ${metrics.users.total}</p>
                        </div>
                        
                        <div class="status-card">
                            <h3>💾 Memory Usage (QR11)</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${metrics.constraints.memory_usage_percent}%"></div>
                            </div>
                            <p>${metrics.constraints.current_memory_mb.toFixed(2)} MB / 20 MB</p>
                            <p class="${metrics.constraints.memory_usage_percent > 90 ? 'critical' : metrics.constraints.memory_usage_percent > 70 ? 'warning' : ''}">
                                ${metrics.constraints.memory_usage_percent.toFixed(1)}% used
                            </p>
                        </div>
                        
                        <div class="status-card">
                            <h3>💿 Storage Usage (QR10)</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${metrics.constraints.storage_usage_percent}%"></div>
                            </div>
                            <p>${metrics.constraints.current_storage_mb.toFixed(2)} MB / 20 MB</p>
                            <p class="${metrics.constraints.storage_usage_percent > 90 ? 'critical' : metrics.constraints.storage_usage_percent > 70 ? 'warning' : ''}">
                                ${metrics.constraints.storage_usage_percent.toFixed(1)}% used
                            </p>
                        </div>
                    </div>
                    
                    <div class="requirements-verification">
                        <h3>✅ Sprint 1 Requirements Verification</h3>
                        <ul class="requirements-list">
                            <li>${this.checkmark(health.database === 'connected')} QR22: Internet Connection (Database connected)</li>
                            <li>${this.checkmark(metrics.constraints.current_memory_mb <= 20)} QR11: Memory Usage (${metrics.constraints.current_memory_mb.toFixed(2)}MB ≤ 20MB)</li>
                            <li>${this.checkmark(metrics.constraints.current_storage_mb <= 20)} QR10: Storage Usage (${metrics.constraints.current_storage_mb.toFixed(2)}MB ≤ 20MB)</li>
                        </ul>
                    </div>
                </div>
            `;
            
            document.getElementById('app').innerHTML = html;
        } catch (error) {
            this.showError('Failed to load system status');
        }
    }

    setupUserRegistrationForm() {
        const form = document.getElementById('user-registration-form');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        // Real-time username availability check (QR17)
        usernameInput.addEventListener('blur', async () => {
            if (usernameInput.value.length >= 3) {
                const available = await this.checkUsername(usernameInput.value);
                if (!available) {
                    this.showFieldError('username', 'Username already taken');
                } else {
                    this.clearFieldError('username');
                }
            }
        });
        
        // Real-time email validation
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !this.isValidEmail(emailInput.value)) {
                this.showFieldError('email', 'Please enter a valid email address');
            } else {
                this.clearFieldError('email');
            }
        });
        
        // Real-time password strength validation
        passwordInput.addEventListener('input', () => {
            this.validatePassword(passwordInput.value);
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitUserRegistration();
        });
    }

    setupOwnerRegistrationForm() {
        const form = document.getElementById('owner-registration-form');
        
        // Similar validation as user registration
        // (Implementation details omitted for brevity but would mirror user registration)
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitOwnerRegistration();
        });
    }

    async submitUserRegistration() {
        const form = document.getElementById('user-registration-form');
        const resultDiv = document.getElementById('registration-result');
        const submitBtn = document.getElementById('register-btn');
        
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value || null
        };
        
        // Validate form
        if (!this.validateUserForm(formData)) {
            return;
        }
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        
        try {
            const response = await this.apiPost('/users/register', formData);
            
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong>Registration Successful!</strong><br>
                    Welcome, ${response.username}! Your account has been created.<br>
                    You can now log in (feature coming in Sprint 2).
                </div>
            `;
            
            form.reset();
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="alert alert-error">
                    <strong>Registration Failed:</strong> ${error.message}
                </div>
            `;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    }

    async submitOwnerRegistration() {
        const form = document.getElementById('owner-registration-form');
        const resultDiv = document.getElementById('registration-result');
        const submitBtn = document.getElementById('register-btn');
        
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            mobile_phone: document.getElementById('mobile-phone').value || null
        };
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        
        try {
            const response = await this.apiPost('/owners/register', formData);
            
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong>Registration Successful!</strong><br>
                    Thank you for registering, ${response.username}!<br>
                    Your account is pending verification. You will receive an email once verified.
                </div>
            `;
            
            form.reset();
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="alert alert-error">
                    <strong>Registration Failed:</strong> ${error.message}
                </div>
            `;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register as Owner';
        }
    }

    async checkUsername(username) {
        try {
            const response = await this.apiGet(`/users/check-username/${username}`);
            return response.available;
        } catch {
            return false;
        }
    }

    validateUserForm(data) {
        let isValid = true;
        
        if (!data.username || data.username.length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!this.isValidPassword(data.password)) {
            this.showFieldError('password', 'Password does not meet requirements');
            isValid = false;
        }
        
        return isValid;
    }

    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };
        
        document.getElementById('req-length').style.color = requirements.length ? 'green' : 'red';
        document.getElementById('req-uppercase').style.color = requirements.uppercase ? 'green' : 'red';
        document.getElementById('req-lowercase').style.color = requirements.lowercase ? 'green' : 'red';
        document.getElementById('req-number').style.color = requirements.number ? 'green' : 'red';
        
        return Object.values(requirements).every(Boolean);
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

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}-error`);
        if (field && errorDiv) {
            field.classList.add('error');
            errorDiv.textContent = message;
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}-error`);
        if (field && errorDiv) {
            field.classList.remove('error');
            errorDiv.textContent = '';
        }
    }

    async apiGet(endpoint) {
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API request failed');
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
            throw new Error(error.detail || 'API request failed');
        }
        
        return response.json();
    }

    updateActiveNavLink(path) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${path}`) {
                link.classList.add('active');
            }
        });
    }

    async loadSystemStats() {
        try {
            const stats = await this.apiGet('/metrics');
            const statsElement = document.getElementById('system-stats');
            if (statsElement) {
                statsElement.innerHTML = `
                    Users: ${stats.users.total} | 
                    Memory: ${stats.constraints.current_memory_mb.toFixed(1)}/20MB | 
                    Storage: ${stats.constraints.current_storage_mb.toFixed(1)}/20MB
                `;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    startHealthCheck() {
        setInterval(async () => {
            try {
                await this.apiGet('/health');
                document.body.classList.remove('offline');
            } catch {
                document.body.classList.add('offline');
            }
        }, 30000); // Check every 30 seconds
    }

    showNotFound() {
        document.getElementById('app').innerHTML = `
            <div class="error-page">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a href="#/" class="btn btn-primary">Go Home</a>
            </div>
        `;
    }

    showError(message) {
        document.getElementById('app').innerHTML = `
            <div class="alert alert-error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    checkmark(condition) {
        return condition ? '✅' : '❌';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});