const spicedPg = require("spiced-pg");
// NOT SURE YET WHAT TO DO W/ THIS EMAIL ADDRESS
// const db = spicedPg("postgres:postgress:postgress@localhost:5432/petitiondb");

module.exports.getSigners = () => {
    const q = `SELECT * FROM signers`;
    return db.query(q);
};

module.exports.addSigners = (firstName, lastName) => {
    const q = `INSERT INTO actors (name, age) VALUES ($1,$2)`;
    const params = [firstName, lastName];
    return db.query(q, params);
};
