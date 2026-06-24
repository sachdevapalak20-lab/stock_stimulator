// ===== WEBSOCKET MANAGER =====


const WebSocketManager = {
    socket:            null,
    isConnected:       false,
    reconnectAttempts: 0,
    maxReconnects:     5,
    reconnectDelay:    3000,
    onPriceUpdate:     null,

    connect() {
        try {
            this.socket = new WebSocket('wss://stockstimulator-production.up.railway.app/ws');

            this.socket.onopen = () => {
                console.log('Connected!');
                this.isConnected       = true;
                this.reconnectAttempts = 0;
                const el = document.getElementById('connectionStatus');
                if (el) el.classList.add('d-none');
            };

            this.socket.onmessage = (event) => {
                try {
                    const prices = JSON.parse(event.data);
                    if (this.onPriceUpdate) {
                        this.onPriceUpdate(prices);
                    }
                } catch(e) {
                    console.error('Parse error:', e);
                }
            };

            this.socket.onclose = () => {
                console.log('Disconnected');
                this.isConnected = false;
                this.reconnect();
            };

            this.socket.onerror = (e) => {
                console.error('WS Error:', e);
                this.isConnected = false;
            };

        } catch(e) {
            console.error('Connect error:', e);
            this.reconnect();
        }
    },

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnects) {
            const el = document.getElementById('connectionStatus');
            if (el) {
                el.classList.remove('d-none');
                el.classList.remove('alert-warning');
                el.classList.add('alert-danger');
                el.innerHTML = `
                    Connection failed.
                    <button onclick="WebSocketManager.reconnectAttempts=0;
                    WebSocketManager.connect()"
                    class="btn btn-sm btn-danger ms-2">
                    Retry</button>`;
            }
            return;
        }
        this.reconnectAttempts++;
        console.log('Reconnecting attempt ' + this.reconnectAttempts);
        setTimeout(() => this.connect(), this.reconnectDelay);
    },

    disconnect() {
        if (this.socket) this.socket.close();
    }
};
