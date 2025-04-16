import axios from "axios";
import AuthContext from "./AuthContext";
import BridgeContext from "./BridgeContext";
import HistoryContext from "./HistoryContext";


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
        this.history = new HistoryContext(this.client, "/history");
    }
}

export default APIClient;
