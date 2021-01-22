const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const secrets = require("./secrets");
const hb = require("express-handlebars");
// step 1: require CRSURF for protecttion
const csurf = require("csurf");
const db = require("./petitiondb/db");
const petitioners = require("./petitiondb/db");

app.engine("handlebars", hb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    cookieSession({
        maxAge: 1000 * 6 * 50 * 14,
        secret: secrets.sessionSecret,
    })
);

app.use(express.urlencoded({ extended: false }));
// step 2: csurf middleware AFTER cookie-session AND url.encoded
// step 3: is in petition folder and all routes with POST
app.use(csurf());
// step 4:put this middlw func after all the previous csurf stuff
app.use(function (req, res, next) {
    console.log("req.session in middleware:", req.session);
    res.locals.csrfToken = req.csrfToken();
    next();
});
// app.use((req, res, next) => {
//     // check on browser each page created : register, user
//     console.log(`A ${req.method}request was made to the ${req.url} route`);
//     next();
// });
app.get("/petition", (req, res) => {
    //IF the user has already signed the petition, it redirects to /thanks (→ check your cookie for this)
    //IF user has not yet signed, it renders petition.handlebars template
    (req.session.name = "adobo"), res.render("petition", { layout: "main" });
});

app.post("/petition", (req, res) => {
    // runs when the user submits their signature, i.e. clicks submit
    // attempt to INSERT all data to submit into a designated table into your database, you will get this data from req.body
    // IF the db insert fails (i.e. your promise from the db query gets rejected), rerender petition.handlebars and pass an indication that there should be an error message shown to the template
    // IF there is no error
    // set cookie to remember that the user has signed (do this last → this logic will change in the future)
    // redirect to thank you page

    // input from user
    console.log(req.body);
    // calling func, insert user input into our table
    // promise/ addSignatures is async
    // .then runs once the query is finished (no errors)
    // we use "firstname" and "lastname" bcuz this is what the terminal is using
    db.addSignatures(
        req.body.firstname,
        req.body.lastname,
        req.body.signature
    ).then((results) => {
        console.log(results);
        res.redirect("/thanks");
    });
});

app.get("/thanks", (req, res) => {
    // renders the thanks.handlebars template
    // However this should only be visible to those that have signed, so:
    // IF there is a cookie that the user has signed, render the template
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    res.render("thanks", { title: "Thank You" });
});

app.get("/signers", (req, res) => {
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    // SELECT first and last values of every person that has signed from the database and pass them to signers.handlebars
    // SELECT the number of people that have signed the petition from the db → I recommend looking into what COUNT can do for you here ;)
    // const { firstname, lastname, signature } = req.body;
    db.getSignatures(req.body).then((results) => {
        console.log(results);
        res.render("signers", {
            title: "signers",
            petitioners,
        });
    });
});

app.listen(8080, () => console.log("Petition Server running"));
