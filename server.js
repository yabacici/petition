const express = require("express");
const app = express();
const db = require("./db"); // requiering our db module that holds all the db we want to run

// getting infor from our db
app.get("/actors", (req, res) => {
    db.getActors()
        .then((results) => {
            console.log(results.rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

// adding info to our db
app.post("/add-actor", (req, res) => {
    console.log("hit POST add-actor route");

    db.addActor("Janelle Monae", 35)
        .then(() => {
            console.log("yay it worked");
        })
        .catch((err) => {
            console.log(err);
        });
});
app.listen(8080, () => console.log("petition server is listening"));
