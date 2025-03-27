class BridgeClient {
    constructor(storage) {
        this.storage = storage;
        this.socket = new WebSocket("/api/bridge/messages");
        this.socket.onmessage = this.onmessage.bind(this);
        this.interval = setInterval(this.update.bind(this), 500);
    }

    onmessage(message) {
        this.storage.push(JSON.parse(message.data));
    }

    update() {
        this.storage.update();
    }
}

export default BridgeClient;
