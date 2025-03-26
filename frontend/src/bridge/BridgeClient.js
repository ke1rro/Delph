class BridgeClient {
    constructor(url, storage) {
        this.storage = storage;
        this.socket = new WebSocket(url);
        this.socket.onmessage = (message) => (
            this.storage.push(JSON.parse(message.data))
        );
        this.interval = setInterval(this.storage.update.bind(this.storage), 500);
    }
}

// TODO: Remake as async

export default BridgeClient;
