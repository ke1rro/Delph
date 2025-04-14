import axios from "axios";

class HistoryClient {
    constructor(baseURL = "/api") {
        this.client = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-type": "application/json"
            },
            withCredentials: true,
            timeout: 10000
        });
    }

    /**
     * Get events aggregated by message ID within a time range
     * @param {number} startTimestamp - Start timestamp in milliseconds
     * @param {number} endTimestamp - End timestamp in milliseconds
     * @returns {Promise<Array>} - Array of aggregated events
     */
    async getAggregatedEvents(startTimestamp, endTimestamp) {
        try {
            console.log(`Making API request to get events from ${new Date(startTimestamp).toISOString()} to ${new Date(endTimestamp).toISOString()}`);

            // Ensure timestamps are integers
            const start = Math.floor(startTimestamp);
            const end = Math.floor(endTimestamp);

            const params = new URLSearchParams();
            params.append('start_timestamp', start);
            params.append('end_timestamp', end);

            // Try API path with correct structure first
            let response;

            try {
                // This is the correct path based on your NGINX configuration
                response = await this.client.get(
                    `/history/events/aggregated-by-message/`,
                    { params }
                );
            } catch (firstError) {
                console.warn("First attempt failed, trying alternate paths:", firstError.message);

                // Try alternate paths if first attempt fails
                try {
                    response = await this.client.get(
                        `/api/history/events/aggregated-by-message/`,
                        { params }
                    );
                } catch (secondError) {
                    console.warn("Second attempt failed, trying final path:", secondError.message);
                    response = await this.client.get(
                        `/events/aggregated-by-message/`,
                        { params }
                    );
                }
            }

            if (!response || !response.data) {
                throw new Error("Empty response received from server");
            }

            // Handle response data normalization
            const eventData = Array.isArray(response.data) ? response.data : [];

            console.log(`Successfully retrieved ${eventData.length} events from API`);

            // Ensure events have proper structure
            const normalizedEvents = eventData.map(event => {
                // Clone to avoid modifying original
                const normalizedEvent = {...event};

                // If the response format uses message property, flatten it for easier use
                if (normalizedEvent.message) {
                    // Copy message properties to top level if not already present
                    Object.keys(normalizedEvent.message).forEach(key => {
                        if (!normalizedEvent[key]) {
                            normalizedEvent[key] = normalizedEvent.message[key];
                        }
                    });
                }

                return normalizedEvent;
            });

            return normalizedEvents;
        } catch (error) {
            console.error("Error fetching aggregated events:", error);

            // Enhanced error details for debugging
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received:", error.request);
            }

            throw error;
        }
    }
}

export default HistoryClient;