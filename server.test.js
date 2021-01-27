const supertest = require("supertest");
// npm package
const { app } = require("./server");
// imported from server.js
const cookieSession = require("cookie-session");
// console.log("app in server : ", app);

// takes 2 arg:
// 1. a string that describe the test we run
// 2 callback func that contains the actual test
test("GET /register sends 200 status code as a response", () => {
    return supertest(app)
        .get("/register")
        .then((res) => {
            // console.log(res.statusCode);
            expect(res.statusCode).toBe(200);
        });
});

test("POST /register redirects to /profile", () => {
    return supertest(app)
        .post("/register")
        .then((res) => {
            // console.log(res.statusCode);
            // because the page is being redirected so toBe 302
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/profile");
        });
});

test("/petition sends 302 when there is no cookie", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
        });
});

test.only("petition /home sends 302 when there is no cookie", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
        });
});
