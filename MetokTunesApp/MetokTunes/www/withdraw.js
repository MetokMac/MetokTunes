document.addEventListener('DOMContentLoaded', () => {
    // Initialize withdrawal page
    initializeWithdrawPage();
});

function initializeWithdrawPage() {
    // Get DOM elements
    const withdrawAmount = document.getElementById('withdraw-amount');
    const paypalOption = document.getElementById('paypal-option');
    const bankOption = document.getElementById('bank-option');
    const paypalDetails = document.getElementById('paypal-details');
    const bankDetails = document.getElementById('bank-details');
    const withdrawForm = document.getElementById('withdraw-form');
    const withdrawBalance = document.getElementById('withdraw-balance');

    // Load user's available balance
    loadAvailableBalance();

    // Handle withdrawal method selection
    paypalOption.addEventListener('click', () => {
        selectWithdrawMethod('paypal');
    });

    bankOption.addEventListener('click', () => {
        selectWithdrawMethod('bank');
    });

    // Handle form submission
    withdrawForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleWithdrawal();
    });
}

function selectWithdrawMethod(method) {
    if (method === 'paypal') {
        document.getElementById('paypal-details').style.display = 'block';
        document.getElementById('cashapp-details').style.display = 'none';
    } else {
        document.getElementById('cashapp-details').style.display = 'block';
        document.getElementById('paypal-details').style.display = 'none';
    }
}

async function loadAvailableBalance() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please log in to view your balance');
            window.location.href = 'login.html';
            return;
        }

        // Fetch user's balance from Firebase
        const balance = await firebase.getAvailableBalance(user.email);
        withdrawBalance.textContent = `$${balance.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading balance:', error);
        alert('Failed to load balance. Please try again.');
    }
}

async function handleWithdrawal() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const method = document.getElementById('paypal-option').style.display === 'block' ? 'paypal' : 'cashapp';

        if (!user) {
            alert('Please log in to withdraw funds');
            window.location.href = 'login.html';
            return;
        }

        if (amount < 100000) { // Minimum 100,000 tokens ($0.10)
            alert('Minimum withdrawal amount is 100,000 tokens ($0.10)');
            return;
        }

        // Calculate fee (1% with minimum 5,000 tokens)
        const fee = Math.max(5000, amount * 0.01);
        const netAmount = amount - fee;

        // Show confirmation dialog with token and dollar amounts
        if (!confirm(`You are about to withdraw ${amount.toLocaleString()} tokens ($${(amount/1000000).toFixed(2)})\n\n` +
                     `Fee: ${fee.toLocaleString()} tokens ($${(fee/1000000).toFixed(2)})\n` +
                     `Net amount: ${netAmount.toLocaleString()} tokens ($${(netAmount/1000000).toFixed(2)})\n\n` +
                     `Proceed with withdrawal?`)) {
            return;
        }

        // Get withdrawal details based on method
        const details = method === 'paypal' ? {
            paypalEmail: document.getElementById('paypal-email').value
        } : {
            cashappUsername: document.getElementById('cashapp-id').value
        };

        // Process withdrawal
        await firebase.processWithdrawal(user.email, amount, method, details);

        // Update balance
        await firebase.updateUserBalance(user.email, amount);

        // Show success message with processing time
        const processingTime = method === 'paypal' ? '1-3 business days' : 'Instant';
        alert(`Withdrawal request submitted successfully!\n\n` +
              `Your funds will be processed ${processingTime}.`);

        // Update balance display
        loadAvailableBalance();

        // Redirect to revenue history
        window.location.href = 'ad-revenue-history.html';
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        alert('Failed to process withdrawal. Please try again.');
    }
}
