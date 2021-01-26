const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

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

module.exports.insertUserProfile = (age, city, url, userId) => {
    const q = `INSERT INTO user_prof (age, city, url, user_id) VALUES ($1,$2,$3,$4) RETURNING id`;
    const params = [age, city, url, userId];
    return db.query(q, params);
};

// module.exports.addPetition = (userId, signature) => {
//     return db.query(
//         `
//         INSERT INTO signatures (user_id, signature)
//         VALUES ($1, $2) RETURNING id

//     `,
//         [userId, signature]
//     );
// };

// JOIN

// module.exports.getData = () => {
//     const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
//     FROM signatures
//     JOIN users
//     ON signatures.user_id = users.id
//     JOIN user_profiles
//     ON  users.id = user_profiles.user_id`;
//     return db.query(q);
// };

// module.exports.getCity = (city) => {
//     const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
//     FROM signatures
//     JOIN users
//     ON signatures.user_id = users.id
//     JOIN user_profiles
//     ON  users.id = user_profiles.user_id
//     WHERE LOWER(city) = LOWER($1)`;

//     const params = [city];
//     return db.query(q, params);
// };
