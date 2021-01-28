const supertest = require("supertest");
// npm package
const { app } = require("./server");
// imported from server.js
const cookieSession = require("cookie-session");
// console.log("app in server : ", app);

// takes 2 arg:
// 1. a string that describe the test we run
// 2 callback func that contains the actual test
// test("GET /register sends 200 status code as a response", () => {
//     return supertest(app)
//         .get("/register")
//         .then((res) => {
//             // console.log(res.statusCode);
//             expect(res.statusCode).toBe(200);
//         });
// });

// test("POST /petition redirects to /profile", () => {
//     return supertest(app)
//         .post("/register")
//         .then((res) => {
//             // console.log(res.statusCode);
//             // because the page is being redirected so toBe 302
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/profile");
//         });
// });

// test("GET /petition sends 302 when there is no cookie", () => {
//     cookieSession.mockSessionOnce({});
//     return supertest(app)
//         .get("/petition")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//         });
// });

// test.only("GET /petition sends 200 when there is no cookie", () => {
//     cookieSession.mockSessionOnce({
//         userId: true,
//         // loggedIn: true,
//         signatureId: true,
//     });
//     return supertest(app)
//         .get("/petition")
//         .then((res) => {
//             expect(res.statusCode).toBe(200);
//         });
// });

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
