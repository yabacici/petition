const spicedPg = require("spiced-pg");
let db;
if (process.env.DATABASE_URL) {
    // means we are in production on heroku
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUsername, dbPassword } = require("./secrets");
    db = spicedPg(
        `postgres:${dbUsername}:${dbPassword}@localhost:5432/petition`
    );
// const db = spicedPg(
//     process.env.DATABASE_URL ||
//         `postgres:postgres:postgres@localhost:5432/petition`
// );


module.exports.getSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

// module.exports.addSignatures = (first, last, signatures) => {
//     const q = `INSERT INTO signatures (first, last, signature) VALUES ($1,$2,$3) RETURNING id`;
//     const params = [first, last, signatures];
//     return db.query(q, params);
// };

// Insert new signature
module.exports.addSignature = (signature, user_id) => {
    const q = `INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2) RETURNING id`;
    const params = [signature, user_id];
    return db.query(q, params);
};

// INSERT INTO signatures ( first, last, signature) VALUES ($1, $2, $3);
// module.exports.getAllSignatures = (first, last, signature) => {
//     const q = `SELECT first, last FROM signatures`;
//     const params = [first, last, signature];
//     // const q = `INSERT INTO signatures (first, last, signature) VALUES ($1,$2,$3) RETURNING id`;
//     return db.query(q, params);
// };
module.exports.getUserFirstname = (userId) => {
    const q = `SELECT users.first, users.last FROM users
    WHERE id = $1`;
    const params = [userId];
    return db.query(q, params);
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

// INSERT data into users table (in post /registration)
module.exports.addRegister = (first, last, email, hashedPw) => {
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;
    const params = [first, last, email, hashedPw];
    return db.query(q, params);
};

// SELECT to get user info by email address (in post /login)
module.exports.getInfoByEmail = (email) => {
    const q = `SELECT password FROM users WHERE email=$1`;
    const params = [email];
    return db.query(q, params);
};

// INSERT for signatures table needs to be changed to include the user_id (in post /petition)

// SELECT from signatures to find out if a user has signed (post /login OR get /petition)
module.exports.userSigned = (userId) => {
    const q = `SELECT signature FROM signatures WHERE user_id=$1`;
    const params = [userId];
    return db.query(q, params);
};

//INSERT more data
module.exports.insertUserProfile = (age, city, url, userId) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1,$2,$3,$4) RETURNING id`;
    const params = [age, city, url, userId];
    return db.query(q, params);
};

// JOIN
//SELECT name, age, city, url from the 3 tables
module.exports.getSignersData = () => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, signatures.signature FROM users
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    LEFT JOIN signatures
    ON users.id = signatures.user_id`;

    return db.query(q);
};

module.exports.signersByCity = (city) => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
    FROM signatures
    JOIN users
    ON signatures.user_id = users.id
    JOIN user_profiles
    ON  users.id = user_profiles.user_id
    WHERE LOWER(city) = LOWER($1)`;

    const params = [city];
    return db.query(q, params);
};

module.exports.editProfile = (userId) => {
    const q = `SELECT users.id, users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url 
    FROM users 
    JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE user_profiles.user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.updateProfilePassword = (
    userId,
    first,
    last,
    email,
    password
) => {
    const q = `UPDATE users
    SET first = $2, last = $3, email = $4, password = $5
    WHERE id = $1`;
    const params = [userId, first, last, email, password];
    return db.query(q, params);
};

module.exports.updateProfNoPassword = (userId, first, last, email) => {
    const q = `UPDATE users
    SET first = $2, last = $3, email = $4
    WHERE id = $1`;
    const params = [userId, first, last, email];
    return db.query(q, params);
};

module.exports.upsertProfile = (age, city, url, userId) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url = $3`;
    const params = [age, city, url, userId];
    return db.query(q, params);
};

module.exports.deleteSignature = (userId) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};
