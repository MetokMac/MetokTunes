// Token conversion rates
const TOKEN_CONVERSION_RATES = {
    '0.10': 100000,  // 100,000 tokens = $0.10
    '0.30': 300000,  // 300,000 tokens = $0.30
    '0.50': 500000,  // 500,000 tokens = $0.50
    '1.00': 1000000, // 1,000,000 tokens = $1.00
    '5.00': 5000000  // 5,000,000 tokens = $5.00
};

// Get tokens for dollar amount
function getTokensForDollars(dollars) {
    return TOKEN_CONVERSION_RATES[dollars] || dollars * 1000000;
}

// Get dollars for tokens
function getDollarsForTokens(tokens) {
    const dollars = Object.entries(TOKEN_CONVERSION_RATES)
        .find(([_, value]) => value === tokens);
    return dollars ? parseFloat(dollars[0]) : tokens / 1000000;
}

// Initialize donation system
document.addEventListener('DOMContentLoaded', () => {
    initializeDonationSystem();
});

function initializeDonationSystem() {
    // Get DOM elements
    const donateButton = document.getElementById('donate-button');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const confirmDonation = document.getElementById('confirm-donation');
    const artistId = document.getElementById('artist-name').dataset.artistId;

    // Handle amount button clicks
    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            customAmountInput.value = button.dataset.amount;
        });
    });

    // Handle custom amount input
    customAmountInput.addEventListener('input', (e) => {
        const amount = parseInt(e.target.value);
        if (isNaN(amount) || amount < 1000000) {
            e.target.value = '';
        }
    });

    // Handle donation confirmation
    confirmDonation.addEventListener('click', async () => {
        const amount = parseInt(customAmountInput.value);
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        // Get user info
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please log in to make a donation');
            return;
        }

        // Check if user has enough tokens
        try {
            const userBalance = await firebase.getAvailableBalance(user.email);
            const userTokens = userBalance * TOKEN_CONVERSION_RATE;

            if (userTokens < amount) {
                alert('Insufficient tokens. Please withdraw more tokens first.');
                return;
            }

            // Process donation
            await firebase.processDonation(user.email, artistId, amount);

            // Update user balance
            await firebase.updateUserBalance(user.email, userTokens - amount);

            // Update artist balance
            await firebase.updateArtistBalance(artistId, amount);

            alert(`Successfully donated ${amount.toLocaleString()} tokens to the artist!`);
            window.location.reload();
        } catch (error) {
            console.error('Error processing donation:', error);
            alert('Failed to process donation. Please try again.');
        }
    });
}

// Helper function to convert tokens to dollars

