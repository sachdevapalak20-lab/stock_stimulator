// ===== WEBSOCKET MANAGER =====

const WebSocketManager = {

    socket:           null,
    isConnected:      false,
    reconnectAttempts: 0,
    maxReconnects:    5,
    reconnectDelay:   3000,
    onPriceUpdate:    null,

    // Connect to backend
    connect() {
        try {
            const wsUrl = 'ws://localhost:8081/ws';
            this.socket = new WebSocket(wsUrl);

            // On connection open
            this.socket.onopen = () => {
                console.log('Connected to market');
                this.isConnected      = true;
                this.reconnectAttempts = 0;
                this.updateStatus(true);
            };

            // On price update received
            this.socket.onmessage = (event) => {
                try {
                    const prices = JSON.parse(event.data);
                    if (this.onPriceUpdate) {
                        this.onPriceUpdate(prices);
                    }
                } catch (e) {
                    console.error('Price parse error:', e);
                }
            };

            // On connection close
            this.socket.onclose = () => {
                console.log('Disconnected from market');
                this.isConnected = false;
                this.updateStatus(false);
                this.reconnect();
            };

            // On error
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                this.updateStatus(false);
            };

        } catch (e) {
            console.error('WebSocket connect error:', e);
            this.reconnect();
        }
    },

    // Auto reconnect
    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnects) {
            console.log('Max reconnect attempts reached');
            this.showReconnectFailed();
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    },

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    },

    // Update connection status on UI
    updateStatus(connected) {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        if (connected) {
            statusEl.classList.add('d-none');
        } else {
            statusEl.classList.remove('d-none');
            statusEl.innerHTML = `
                <i class="bi bi-wifi-off"></i>
                Disconnected — Reconnecting...
            `;
        }
    },

    // Show reconnect failed message
    showReconnectFailed() {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        statusEl.classList.remove('d-none');
        statusEl.classList.remove('alert-warning');
        statusEl.classList.add('alert-danger');
        statusEl.innerHTML = `
            <i class="bi bi-x-circle"></i>
            Connection failed.
            <button onclick="WebSocketManager.connect()"
                class="btn btn-sm btn-danger ms-2">
                Retry
            </button>
        `;
    }
};
