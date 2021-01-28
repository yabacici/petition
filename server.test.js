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

test("POST /petition redirects to /profile", () => {
    return supertest(app)
        .post("/register")
        .then((res) => {
            // console.log(res.statusCode);
            // because the page is being redirected so toBe 302
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/profile");
        });
});

test("GET /petition sends 302 when there is no cookie", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
        });
});

test.only("GET /petition sends 200 when there is no cookie", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        // loggedIn: true,
        signatureId: true,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});
