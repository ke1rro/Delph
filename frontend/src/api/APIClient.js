import axios from "axios";
import AuthContext from "./AuthContext";
import BridgeContext from "./BridgeContext";


class APIClient {
    constructor () {
        this.client = axios.create({
            baseURL: "/api/",
            headers: {
                "Content-type": "application/json"
            },
            withCredentials: true,
        });
        this.auth = new AuthContext(this.client, "/core/auth");
        this.bridge = new BridgeContext(this.client, "/bridge");
    }
}

export default APIClient;
