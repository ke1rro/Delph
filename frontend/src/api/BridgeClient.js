class BridgeClient {
    constructor(url, storage) {
        this.storage = storage;
        this.socket = new WebSocket(url);
        this.socket.onmessage = this.onmessage.bind(this)
        this.interval = setInterval(this.update.bind(this), 500);
    }

    update() {
        this.storage.update()
    }

    onmessage(message) {
        this.storage.push(JSON.parse(message.data))
    }
}

export default BridgeClient;
