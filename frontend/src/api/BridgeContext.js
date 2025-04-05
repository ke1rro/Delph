class BridgeContext {
    constructor(client, prefix = "/bridge") {
        this.client = client;
        this.prefix = prefix;
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

    async updateMessage(data, config) {
        return await this.createMessage(data, config);
    }
}

export default BridgeContext;
