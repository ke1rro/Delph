class HistoryContext {
    constructor(client, prefix = "/history") {
        this.client = client;
        this.prefix = prefix;
    }

    /**
     * Get events within a time range, aggregated by message.id
     * @param {number} startTimestamp - Start timestamp in milliseconds
     * @param {number} endTimestamp - End timestamp in milliseconds
     * @param {Object} config - Additional Axios request configuration
     * @returns {Promise<Object>} - The response with aggregated events
     */
    async getAggregatedByMessage(startTimestamp, endTimestamp, config = {}) {
        const params = new URLSearchParams();
        if (startTimestamp) params.append('start_timestamp', startTimestamp);
        if (endTimestamp) params.append('end_timestamp', endTimestamp);

        return await this.client.get(
            `${this.prefix}/events/aggregated-by-message/`,
            { ...config, params }
        );
    }

    /**
     * Get raw event history within a time range
     * @param {number} startTimestamp - Start timestamp in milliseconds
     * @param {number} endTimestamp - End timestamp in milliseconds
     * @param {Object} config - Additional Axios request configuration
     * @returns {Promise<Object>} - The response with raw events
     */
    async getRawEvents(startTimestamp, endTimestamp, config = {}) {
        const params = new URLSearchParams();
        if (startTimestamp) params.append('start_timestamp', startTimestamp);
        if (endTimestamp) params.append('end_timestamp', endTimestamp);

        return await this.client.get(
            `${this.prefix}/events/by-time-range/`,
            { ...config, params }
        );
    }
}

export default HistoryContext;
