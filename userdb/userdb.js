const spicedPg = require("spiced-pg");
const userdb = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

// INSERT INTO signatures ( first, last, signature) VALUES ($1, $2, $3);

// INSERT data into users table (in post /registration)
module.exports.addRegister = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;
    const params = [first, last, email, password];
    return userdb.query(q, params);
};

// SELECT to get user info by email address (in post /login)
module.exports.getInfoByEmail = (email) => {
    const q = `SELECT password FROM users WHERE email=$1`;
    const params = [email];
    return userdb.query(q, params);
};

// INSERT for signatures table needs to be changed to include the user_id (in post /petition)

// SELECT from signatures to find out if a user has signed (post /login OR get /petition)
module.exports.userSigned = (userId) => {
    const q = `SELECT signature FROM signatures WHERE user_id=$1`;
    const params = [userId];
    return userdb.query(q, params);
};
