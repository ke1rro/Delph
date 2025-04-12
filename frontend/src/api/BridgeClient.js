class BridgeClient {
    constructor(storage) {
        this.storage = storage;
        this.processedEvents = new Map(); // Track processed events to prevent duplicates

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
            if (message.data === "keep-alive") return;

            try {
                const eventData = JSON.parse(message.data);

                // Check if we've already processed this exact event recently
                const eventKey = `${eventData.id}-${eventData.timestamp}`;
                if (this.processedEvents.has(eventKey)) {
                    // Skip if we've seen this exact event in the last 2 seconds
                    const timeSinceProcessed = Date.now() - this.processedEvents.get(eventKey);
                    if (timeSinceProcessed < 2000) {
                        return;
                    }
                }

                // Store that we've processed this event
                this.processedEvents.set(eventKey, Date.now());

                // Clean up old entries from processedEvents (older than 10 seconds)
                this.cleanProcessedEvents();

                // Process the event
                this.storage.push(eventData);
            } catch (error) {
                console.error("Error processing event message:", error);
            }
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

    cleanProcessedEvents() {
        const now = Date.now();
        for (const [key, timestamp] of this.processedEvents.entries()) {
            if (now - timestamp > 10000) { // Remove entries older than 10 seconds
                this.processedEvents.delete(key);
            }
        }
    }

    async onreconnect() {
        // Handle reconnecting
    }

    async onclose() {
        // Handle closure
    }
}

export default BridgeClient;
