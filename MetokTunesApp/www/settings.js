// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
});

function initializeSettings() {
    // Get DOM elements
    const emailInput = document.getElementById('email');
    const changeEmailBtn = document.getElementById('change-email');
    const changePasswordBtn = document.getElementById('change-password');
    const withdrawTokensBtn = document.getElementById('withdraw-tokens');
    const deleteAccountBtn = document.getElementById('delete-account');
    const tokenBalance = document.getElementById('token-balance');
    const darkModeToggle = document.getElementById('dark-mode');
    const notificationsToggle = document.getElementById('notifications');
    const logoutBtn = document.getElementById('logout-btn');

    // Load user data
    loadUserData();
    loadUserBalance();
    loadSettings();

    // Event listeners
    changeEmailBtn.addEventListener('click', handleEmailChange);
    changePasswordBtn.addEventListener('click', handlePasswordChange);
    withdrawTokensBtn.addEventListener('click', () => {
        window.location.href = 'withdraw-funds.html';
    });
    deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    darkModeToggle.addEventListener('change', handleDarkModeToggle);
    notificationsToggle.addEventListener('change', handleNotificationsToggle);
    logoutBtn.addEventListener('click', handleLogout);
}

async function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('email').value = user.email;
    }
}

async function loadUserBalance() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && !user.isGuest) {
        try {
            const balance = await firebase.loadUserBalance(user.email);
            document.getElementById('token-balance').textContent = balance.toLocaleString();
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    }
}

function loadSettings() {
    // Load dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.getElementById('dark-mode').checked = isDarkMode;
    
    // Load notifications preference
    const notificationsEnabled = localStorage.getItem('notifications') === 'true';
    document.getElementById('notifications').checked = notificationsEnabled;
}

async function handleEmailChange() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;

    try {
        await firebase.updateUserEmail(user.email, newEmail);
        alert('Email updated successfully!');
        document.getElementById('email').value = newEmail;
        localStorage.setItem('user', JSON.stringify({
            ...user,
            email: newEmail
        }));
    } catch (error) {
        alert('Error updating email: ' + error.message);
    }
}

async function handlePasswordChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        await firebase.updateUserPassword(user.email, currentPassword, newPassword);
        alert('Password updated successfully!');
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } catch (error) {
        alert('Error updating password: ' + error.message);
    }
}

async function handleAccountDeletion() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        await firebase.deleteUserAccount(user.email);
        localStorage.removeItem('user');
        alert('Account deleted successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error deleting account: ' + error.message);
    }
}

function handleDarkModeToggle(e) {
    const isDarkMode = e.target.checked;
    localStorage.setItem('darkMode', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
}

function handleNotificationsToggle(e) {
    const notificationsEnabled = e.target.checked;
    localStorage.setItem('notifications', notificationsEnabled);
    // Implement notification permission logic here
}

function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
