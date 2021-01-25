const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.addSignatures = (first, last, signatures) => {
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1,$2,$3) RETURNING id`;
    const params = [first, last, signatures];
    return db.query(q, params);
};

// INSERT INTO signatures ( first, last, signature) VALUES ($1, $2, $3);
module.exports.getAllSignatures = () => {
    const q = `SELECT first, last FROM signatures`;
    return db.query(q);
};

module.exports.pullSignatures = (signature) => {
    const q = `SELECT signature FROM signatures WHERE id=$1`;
    const params = [signature];
    return db.query(q, params);
};

module.exports.numOfSig = () => {
    const q = `SELECT COUNT(id) FROM signatures`;
    return db.query(q);
};
