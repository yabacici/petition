const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));
app.use(cookieParser());
// app.use((req, res, next) => {
//     // check on browser each page created : register, user
//     console.log(`A ${req.method}request was made to the ${req.url} route`);
//     next();
// });
app.get("/petition", (req, res) => {
    //IF the user has already signed the petition, it redirects to /thanks (→ check your cookie for this)
    //IF user has not yet signed, it renders petition.handlebars template

    res.cookie("first-cookie", "AMAZING!");
    res.cookie("authenticated", true);
    const submit = req.body;
    if (req.url === submit) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "petition",
            title: "PETITION",
        });
    }
});

app.post("/petition", (req, res) => {
    // runs when the user submits their signature, i.e. clicks submit
    // attempt to INSERT all data to submit into a designated table into your database, you will get this data from req.body
    // IF the db insert fails (i.e. your promise from the db query gets rejected), rerender petition.handlebars and pass an indication that there should be an error message shown to the template
    // IF there is no error
    // set cookie to remember that the user has signed (do this last → this logic will change in the future)
    // redirect to thank you page

    res.send("Thank you for your signature");
});

app.get("/thanks", (req, res) => {
    // renders the thanks.handlebars template
    // However this should only be visible to those that have signed, so:
    // IF there is a cookie that the user has signed, render the template
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    res.send("I am the thank you page");
});

app.get("/signers", (req, res) => {
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    // SELECT first and last values of every person that has signed from the database and pass them to signers.handlebars
    // SELECT the number of people that have signed the petition from the db → I recommend looking into what COUNT can do for you here ;)
    res.send("I am the signers page");
});

app.listen(8080, () => console.log("Petition Server running"));
