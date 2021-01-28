const supertest = require("supertest");
// npm package
const { app } = require("./server");
// imported from server.js
const cookieSession = require("cookie-session");
// console.log("app in server : ", app);

test("Logged out users redirected to register when they attempt to go to petition", () => {
    cookieSession.mockSessionOnce({
        userId: false,
        loggedIn: false,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/register");
        });
});
test("logged in users redirected to petition when they attempt to go to register or login", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        loggedIn: true,
    });
    return supertest(app)
        .get("/register", "/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});
test("users logged in that signed are redirected to thanks when they try to access petition or submit signature", () => {
    cookieSession.mockSessionOnce({
        signatureId: true,
        userId: true,
        loggedIn: true,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/thanks");
        });
});
test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page", () => {
    cookieSession.mockSessionOnce({
        signatureId: false,
        userId: true,
        loggedIn: true,
    });
    return supertest(app)
        .get("/thanks", "/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});
