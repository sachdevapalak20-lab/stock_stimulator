// ===== CONFIRM ORDER PAGE LOGIC =====

let pendingOrder = null;

// Initialize confirm page
function initConfirmPage() {
    // Get pending order from local storage
    pendingOrder = Utils.getLocal('pendingOrder');

    if (!pendingOrder) {
        Utils.showAlert('No pending order found', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Display order details
    displayOrderDetails();

    // Load portfolio bar
    loadPortfolio();
}

// Display order details
function displayOrderDetails() {
    const currency    = Utils.getCurrency();
    const order       = pendingOrder;
    const priceDiff   = Math.abs(order.price - order.openPrice);
    const priceChanged = priceDiff > 2.0;
    const total       = order.quantity * order.price;

    // Fill in details
    document.getElementById('confirmSymbol').textContent =
        order.symbol;

    const typeEl = document.getElementById('confirmType');
    typeEl.textContent = order.type;
    typeEl.style.color = order.type === 'BUY'
        ? 'var(--success)'
        : 'var(--danger)';

    document.getElementById('confirmQuantity').textContent =
        order.quantity + ' shares';

    document.getElementById('confirmOpenPrice').textContent =
        Utils.formatPrice(order.openPrice, currency);

    document.getElementById('confirmCurrentPrice').textContent =
        Utils.formatPrice(order.price, currency);

    document.getElementById('confirmTotal').textContent =
        Utils.formatPrice(total, currency);

    // Show price changed warning
    if (priceChanged) {
        document.getElementById('priceChangedAlert')
            .classList.add('show');
    }

    // Style confirm button
    const confirmBtn = document.getElementById('confirmBtn');
    if (order.type === 'BUY') {
        confirmBtn.className = 'btn-confirm btn-confirm-buy';
        confirmBtn.textContent = '✓ Confirm BUY Order';
    } else {
        confirmBtn.className = 'btn-confirm btn-confirm-sell';
        confirmBtn.textContent = '✓ Confirm SELL Order';
    }
}

// Confirm and place order
function confirmOrder() {
    if (!pendingOrder) return;

    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.textContent = 'Placing Order...';
    confirmBtn.disabled    = true;

    // Send order to backend
    fetch('http://localhost:8080/api/orders/place', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            symbol:   pendingOrder.symbol,
            type:     pendingOrder.type,
            quantity: pendingOrder.quantity,
            price:    pendingOrder.price
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Clear pending order
            Utils.removeLocal('pendingOrder');

            // Show success
            showSuccess(data);
        } else {
            Utils.showAlert(data.message, 'danger');
            confirmBtn.textContent = '✓ Confirm
