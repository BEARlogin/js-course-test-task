import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3005",
  transformResponse: [
    function transformResponse(data, headers) {
      // Optionally you can check the response headers['content-type'] for application/json or text/json
      return JSON.parse(data);
    },
  ],
});

export { api as axios };
