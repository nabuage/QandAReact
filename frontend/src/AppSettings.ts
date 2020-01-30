export const server = "http://localhost:5000";

export const webAPIUrl = `${server}/api`;

export const authSettings = {
    domain: "",
    client_id: "",
    redirect_uri: window.location.origin + "/signin-callback",
    scope: "openid profile QandAAPI email",
    audience: "https://qanda"
};