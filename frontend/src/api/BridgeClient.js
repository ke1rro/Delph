class BridgeClient {
    constructor(storage) {
        this.storage = storage;

        this.updateInterval = setInterval(() => {
            this.storage.update();
        }, 500);

        this.keepAliveInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send("keep-alive");
            }
        }, 10000);
    }

    connect() {
        this.socket = new WebSocket("/api/bridge/messages");

        this.socket.onmessage = (message) => {
            this.storage.push(JSON.parse(message.data));
        };

        return new Promise((resolve, reject) => {
            if (this.socket.readyState === WebSocket.OPEN) {
              return resolve();
            }
        
            this.socket.onopen = () => {
                this.socket.onclose = async (event) => {
                    if (event.code === 3000) {
                        this.socket = null;
                        await this.onclose();
                    } else {
                        await this.onreconnect(event);
                    }
                };

                resolve();
            };

            this.socket.onerror = (error) => {
                reject(error);
            };
        });
    }

    async onreconnect() {
        // Handle reconnecting
    }

    async onclose() {
        // Handle closure
    }
}

export default BridgeClient;
