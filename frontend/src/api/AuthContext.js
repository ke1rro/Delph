class AuthContext {
    constructor(client, prefix = "/auth") {
        this.client = client;
        this.prefix = prefix;
    }

    async login(data, config) {
        /*
        data = {
            user_id: "user_id",
            password: "password"
        }
        */
        return await this.client.post(this.prefix + "/login", data, config);
    }

    async signup(data, config) {
        /*
        data = {
            name: "name",
            surname: "surname",
            password: "password"
        }
        */
        return await this.client.post(this.prefix + "/signup", data, config);
    }

    async logout(data, config) {
        return await this.client.post(this.prefix + "/logout", data, config);
    }

    async dashboard(data, config) {
        return await this.client.get(this.prefix + "/me", data, config);
    }
}

export default AuthContext;
