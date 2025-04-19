class EventStorage {
    constructor() {
        this.events = {};
        this.callbacks = {
            add: async (event) => {},
            update: async (previous_event, event) => {},
            remove: async (event) => {}
        };
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    async push(event) {
        const time = Date.now();
        if(event.id in this.events) {
            // Skip if the event is identical to what we already have
            const existing = this.events[event.id];
            if(event.timestamp === existing.timestamp &&
               JSON.stringify(event.location) === JSON.stringify(existing.location) &&
               JSON.stringify(event.entity) === JSON.stringify(existing.entity)) {
                return;
            }

            if(event.timestamp < existing.timestamp) {
                return;
            }

            this.events[event.id] = event;
            await this.callbacks.update(existing, event);

            if(event.ttl + event.timestamp < time) {
                delete this.events[event.id];
                await this.callbacks.remove(event);
            }
        } else {
            if(event.ttl + event.timestamp < time) {
                return;
            }

            this.events[event.id] = event;
            await this.callbacks.add(event);
        }
    }

    async update() {
        const time = Date.now();
        for(let event_id in this.events) {
            const event = this.events[event_id];
            if(event.ttl + event.timestamp < time) {
                delete this.events[event_id];
                await this.callbacks.remove(event);
            }
        }
    }

    get() {
        return Object.values(this.events);
    }
}

export default EventStorage;
