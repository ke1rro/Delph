class HistoryContext {
    constructor(client, prefix = "/history") {
        this.client = client;
        this.prefix = prefix;
    }

    async filterEvents(data, config) {
        /*
        data = {
            start_timestamp: 0,
            end_timestamp: 0,
            entities: [
                "water:",
                "air:",
            ],
            statuses: [
                "active",
                "unknown",
            ],
            affiliations: [
                "friend",
                "hostile",
            ],
        }
        */
        const params = new URLSearchParams();

        if (data.start_timestamp) {
            params.append('start_timestamp', data.start_timestamp);
        }
        if (data.end_timestamp) {
            params.append('end_timestamp', data.end_timestamp);
        }

        if (data.entities) {
            data.entities.forEach(entity => {
                params.append('entities', entity);
            });
        }
        if (data.statuses) {
            data.statuses.forEach(status => {
                params.append('statuses', status);
            });
        }
        if (data.affiliations) {
            data.affiliations.forEach(affiliation => {
                params.append('affiliations', affiliation);
            });
        }

        try {
            const response = await this.client.get(this.prefix + "/events", { params }, config);
            if (response && response.data && Array.isArray(response.data)) {
                return response.data.map(item => item.message || item);
            }
            return [];
        } catch (error) {
            console.error("Error filtering events:", error);
            return [];
        }
    }
}

export default HistoryContext;
