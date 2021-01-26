const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const secrets = require("./secrets");
const hb = require("express-handlebars");
// step 1: require CRSURF for protecttion
const csurf = require("csurf");
const db = require("./db");
// const bc = require("./bc");
let { hash, compare } = require("./bc");
console.log(hash);

//heroku
// let cookie_sec;
// let cookie_sec;
// if (process.env.cookie_secret) {
//     // we are in production
//     cookie_sec = process.env.cookie_secret;
// } else {
//     // we are local and will get our secrets out of the secret file :)
//     // careful your secrets require statement might look different
//     cookie_sec = require("./secrets.json").cookie_secret;
// }

app.engine("handlebars", hb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Clickjacking
app.use(function (req, res, next) {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use(express.static("./public"));

app.use(
    cookieSession({
        name: "session",
        keys: ["key1", "key2"],
        maxAge: 1000 * 6 * 50 * 14,
        secret: secrets.sessionSecret,
        // 2 weeks
    })
);

app.use(express.urlencoded({ extended: false }));
// step 2: csurf middleware AFTER cookie-session AND url.encoded
// step 3: is in petition folder and all routes with POST
app.use(csurf());

// part 3 app use version
// app.use((req, res, next) => {
//     if (req.url == "/petition" || req.url == "/register") {
//         next();
//     } else {
//         if (req.session.signatureId) {
//             next();
//         } else {
//             res.redirect("/petition");
//         }
//     }
// });

// part4;
// app.use((req, res, next) => {
//     if (req.url == "/petition" && !req.session.userId) {
//         return res.redirect("/register");
//     } else if (req.url == "/petition" && !req.session.logIn) {
//         return res.redirect("/login");
//     } else if (req.url == "/register" && !req.session.userId) {
//         next();
//     }
// });
// step 4:put this middlw func after all the previous csurf stuff
app.use(function (req, res, next) {
    // console.log("req.session in middleware:", req.session);
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/profile", (req, res) => {
    console.log("this is the profile page");
    res.render("profile", {
        layout: "main",
        title: "Profile Page",
    });
});

// app.post("/profile", (req, res) => {
//     db.insertUserProfile(
//         req.body.age,
//         req.body.city,
//         req.body.url,
//         req.session.userId
//     )
//         .then((results) => {
//             req.session.userId = results.rows[0].id;
//             res.redirect("/petition");
//         })
//         .catch((err) => {
//             console.log("err in addProfile:", err);
//         });
// });

app.post("/profile", (req, res) => {
    const age = req.body.age;
    const city = req.body.city;
    const url = req.body.url;
    const userId = req.session.userId;
    // const errAdd = true;

    if (url.startsWith("http") || url == "") {
        db.insertUserProfile(age, city, url, userId).then(() => {
            res.redirect("/petition");
        });
    } else {
        res.render("profile", {
            title: "Profile",
            layout: "main",
            err: "Please provide all information",
        });
    }
});

app.get("/register", (req, res) => {
    res.render("./register", {
        title: "Register",
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    // grab the user input and read it on the server
    // hash the password that the user typed and THEN
    // insert a row in the USERS table (new table) -> see 3. for table structure
    // if the insert is successful, add userId in a cookie (value should be the id created by postgres when the row was inserted).
    // if insert fails, re-render template with an error message
    console.log(req.body);
    console.log(req.body.password);

    const { firstname, lastname, email, password } = req.body;

    hash(req.body.password).then((hashedPw) => {
        console.log("hashedPw in /register:", hashedPw);
        // we'll be wanting to add all user information plus the hashed PW into our db
        // if this worked successfully we want to redirect the user
        // if sth went wrong we want to render an error msg to our user
        db.addRegister(firstname, lastname, email, hashedPw)
            .then((results) => {
                // console.log("Another user joined");
                req.session.userId = results.rows[0].id;
                return res.redirect("/profile");
            })
            .catch((err) => {
                console.log("err in registration:", err);
                // res.render("register", {
                //     title: "Register",
                //     layout: "main",
                // });
            });
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        title: "Log in",
    });
});

app.post("/login", (req, res) => {
    req.on("error", (err) => {
        console.log("error on req object: ", err);
    });
    res.on("error", (err) => {
        console.log("error on res object: ", err);
    });
    // now we want to compare values
    // go to you db, check if the email the user provided exists,
    // and if yes retrieve the stored hash and pass that to compare are the second argument

    db.getInfoByEmail(req.body.email).then((results) => {
        if (compare(req.body.password, results.rows[0].id)) {
            // if (compare(hashedPw, results.rows[0].id)) {
            //use compare method or &&
            req.session.userId = results.rows[0].id;
            res.redirect("/register");
        } else {
            console.log("err");
            res.render("login", {
                layout: "main",
                title: "Log in",
                error: "Something went wrong, please enter your password",
            });
        }
    });
});
app.get("/petition", (req, res) => {
    // IF the user has already signed the petition, it redirects to /thanks (→ check your cookie for this)
    // IF user has not yet signed, it renders petition.handlebars template
    // (req.session.name = "adobo"), res.render("petition", { layout: "main" });

    res.render("petition", {
        layout: "main",
        title: "Petition",
    });
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
    // if (first && last && signature) {
    if (req.body) {
        db.addSignatures(
            // alter your route so that you pass userId from the cookie to your query
            // instead of first and last name

            // req.body.firstname,
            // req.body.lastname,
            req.session.userId,
            req.body.signature
        )
            .then((results) => {
                console.log(results);
                // res.redirect("/thanks");
                req.session.signatureId = results.rows[0].id;
                // console.log(req.session);
                res.cookie("submitted", true);
                res.cookie("submissionError", false);
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in addSignatures: ", err);
                res.cookie("submissionError", true);
                res.render("petition", {
                    title: "Petition",
                    layout: "main",
                    errorMessage: "Something went WRONG! Fill EVERY field!",
                });
            });
    }
});

app.get("/thanks", (req, res, { rows }) => {
    // renders the thanks.handlebars template
    // However this should only be visible to those that have signed, so:
    // IF there is a cookie that the user has signed, render the template
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    if (req.session.signatureId) {
        const promiseArray = [
            db.pullSignatures(req.session.signatureId),
            db.numOfSig({ rows }),
            db.getAllSignatures(),
        ];
        Promise.all(promiseArray)
            .then((results) => {
                const signature = results[0].rows[0].signature;
                const count = results[1].rows[0].count;
                const arr = results[2].rows[0];

                return res.render("thanks", {
                    title: "Thank You",
                    layout: "main",
                    rows,
                    signature,
                    count,
                    arr,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    // redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
    // SELECT first and last values of every person that has signed from the database and pass them to signers.handlebars
    // SELECT the number of people that have signed the petition from the db → I recommend looking into what COUNT can do for you here ;)
    // const { firstname, lastname, signature } = req.body;

    let arr = [];

    db.getAllSignatures()
        .then((results) => {
            let fullName = results.rows.forEach((x) => {
                let xName = x.first + " " + x.last;
                arr.push(xName);
                return arr;
            });
            console.log("results1: ", arr);
            // console.log("results2: ", arr[1]);
            return arr;
        })
        .then((arr) => {
            res.render("signers", {
                layout: "main",
                title: "signers",
                arr,
            });
            console.log("arr:", arr);
        })
        .catch((err) => {
            console.log("error in getAllSignatures:", err);
        });
});
// with Heroku
app.listen(process.env.PORT || 8080, () =>
    console.log("Petition Server running")
);
// app.listen(8080, () => console.log("Petition Server running"));
