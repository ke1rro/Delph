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
        if(event.id in this.events) {
            const previous_event = this.events[event.id];
            this.events[event.id] = event;
            await this.callbacks.update(previous_event, event);
        } else {
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
