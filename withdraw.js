document.addEventListener('DOMContentLoaded', () => {
    initializeWithdrawPage();
});

function initializeWithdrawPage() {
    // Get DOM elements
    const withdrawAmount = document.querySelector('#withdraw-amount');
    const paypalOption = document.querySelector('.method-option#paypal-option');
    const cashappOption = document.querySelector('.method-option#cashapp-option');
    const withdrawForm = document.querySelector('#withdraw-form');
    const withdrawBalance = document.querySelector('#withdraw-balance');
    const paypalDetails = document.querySelector('#paypal-details');
    const cashappDetails = document.querySelector('#cashapp-details');

    // Check if all required elements exist
    if (!withdrawAmount || !paypalOption || !withdrawForm) {
        console.error('One or more required elements not found in DOM');
        return;
    }

    // Load user's available balance
    loadAvailableBalance();

    // Handle withdrawal method selection
    if (paypalOption) {
        paypalOption.addEventListener('click', () => {
            selectWithdrawMethod('paypal');
        });
    }

    if (cashappOption) {
        cashappOption.addEventListener('click', () => {
            selectWithdrawMethod('cashapp');
        });
    }

    // Handle form submission
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleWithdrawal();
        });
    }

    // Show/hide withdrawal methods
    function showWithdrawMethod(method) {
        if (paypalDetails) {
            paypalDetails.style.display = method === 'paypal' ? 'block' : 'none';
        }
        if (cashappDetails) {
            cashappDetails.style.display = method === 'cashapp' ? 'block' : 'none';
        }
    }

    // Initialize with no method selected
    showWithdrawMethod('');
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
