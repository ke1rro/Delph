import axios from "axios";
import AuthContext from "./AuthContext";
import BridgeContext from "./BridgeContext";


class APIClient {
    constructor (baseUrl) {
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-type": "application/json"
            },
            withCredentials: true,
        });
        this.auth = new AuthContext(this.client, "/auth");
        this.bridge = new BridgeContext(this.client, "/bridge", baseUrl);
    }
}

export default APIClient;
