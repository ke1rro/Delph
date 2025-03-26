class EventStorage {
    constructor() {
        this.events = {};
        this.callbacks = {
            add: function(event) {},
            update: function(previous_event, event) {},
            remove: function(event) {}
        };
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    push(event) {
        if(event.id in this.events) {
            const previous_event = this.events[event.id];
            this.events[event.id] = event;
            this.callbacks.update(previous_event, event);
        } else {
            this.events[event.id] = event;
            this.callbacks.add(event);
        }
    }

    update() {
        const time = Date.now();
        for(let event_id in this.events) {
            const event = this.events[event_id];
            if(event.ttl + event.timestamp < time) {
                delete this.events[event_id];
                this.callbacks.remove(event);
            }
        }
    }

    get() {
        return Object.values(this.events);
    }
}

export default EventStorage;

// TODO: Remake as async
