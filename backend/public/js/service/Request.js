import ErrorHandler from "../util/ErrorHandler.js";
import LocalData from "./LocalData.js";

class Request {
  constructor(url) {
    this.Method = "GET";
    this.Url = url;
    this.status = null;
    this.msg = null
  }

  content(type) {
    if (type == "json") {
      this.contentType = "application/json";
    }
    return this;
  }

  method(method) {
    this.Method = method;
    return this;
  }

  body(body) {
    this.Body = body;
    return this;
  }

  async handleError(response) {
    let errorMsg = response.statusText;
    try {
      const errorData = await response.json();
      errorMsg = errorData.msg || errorMsg;
    } catch (err) {
      console.error("Error parsing error response", err);
    }
    ErrorHandler.handle(this.status, errorMsg);
  }

  async send() {
    const reqContent = ((this.Method == "POST" || this.Method == "PUT" || this.Method == "PATCH")
      ? {
          method: this.Method,
          body: this.Body,
          headers: {
            "Content-Type": this.contentType,
            "Authorization": "Bearer " + LocalData.getToken()
          },
        }
      : {
          method: this.Method,
          headers: {
            "Content-Type": this.contentType,
            "Authorization": "Bearer " + LocalData.getToken(),
          },
        });

    try {
      const response = await fetch(this.Url, reqContent);
      this.status = response.status;
      if (!response.ok) {
        await this.handleError(response);
      } else {
        const data = await response.json();
        this.msg = data.msg || null;
        return data;
      }
    } catch (err) {
      this.handleError({ statusText: err.message });
    }
   
  }
}

export default Request;
