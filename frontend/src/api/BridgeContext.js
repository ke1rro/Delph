class Stream {
    constructor(socket) {
        this.socket = socket;
        console.log("Connected to WebSocket");
    }

    on(callback) {
        this.socket.onmessage = (event) => callback(event.data);
    }

    disconnect() {
        this.socket.close();
        console.log("Disconnected from WebSocket");
    }
}


class BridgeContext {
    constructor(client, prefix = "/bridge", wsBaseUrl) {
        this.client = client;
        this.prefix = prefix;
        this.wsBaseUrl = wsBaseUrl;
    }

    async createMessage(data, config) {
        /*
        data = {
            "id": "string",
            "timestamp": 0,
            "ttl": 0,
            "source": {
                "id": "string",
                "name": "string",
                "comment": "string"
            },
            "location": {
                "latitude": 0,
                "longitude": 0,
                "altitude": 0,
                "radius": 0
            },
            "velocity": {
                "direction": 0,
                "speed": 0
            },
            "entity": {
                "affiliation": "assumed_friend",
                "type": "land",
                "entity": "string",
                "modifier1": "string",
                "modifier2": "string",
                "status": "active"
            }
        }
        */
        return await this.client.put(this.prefix + "/messages", data, config);
    }

    async streamMessages() {
        const socket = new WebSocket(this.wsBaseUrl + this.prefix + "/messages");
        return new Stream(socket);
    }
}

export default BridgeContext;
