// this module holds all queries we'll be using to talk to out db
// establishes communication w/ db
const spicedPg = require("spiced-pg");
const db = spicedPg(
    "postgres:postgress:postgress@localhost:5432/hollywood-actors"
);
// who are we talking to ?
// which user
// user password

module.exports.getActors = () => {
    const q = `SELECT * FROM actors`;
    return db.query(q); // db.query takes potentially 2 arg, 1st:a query we want to run, 2nd
    // .then(function (result) {
    //     console.log(result.rows);
    // })
    // .catch(function (err) {
    //     console.log(err);
    // });
};

module.exports.AddActor = (actorName, actorAge) => {
    const q = `INSERT INTO actors (name, age) VALUES ($1,$2)`;
    const params = [actorName, actorAge];
    return db.query(q, params);
};
