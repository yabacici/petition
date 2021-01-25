-- DROP TABLE IF EXISTS signatures;

--  CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      signature VARCHAR NOT NULL CHECK (signature != '')
--  );



-- PART 3//
CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      -- get rid of first and last!
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )

      -- here we are adding the foreign key (user_id)
      -- foreign key lets us identify which user from the users table signed the petition
      -- and which signature is theirs (acts as an identifier btw the 2 tables!)