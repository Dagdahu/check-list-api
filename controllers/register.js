const handleRegister = (db, bcrypt) => (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('incorrect form');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        /// Insert login, return login_id
        trx('login').insert({
            hash: hash
        })
        .returning('id')
        .then(loginId => {
            /// Insert user, return user_id
            return trx('user').insert({
                name: name,
                email: email,
                login_id:loginId[0]
            })
            .returning('id')
            .then( userId => {
                /// Get last inserted user
                return trx('user').select()
                .where('id', userId[0])
                .then(user => {
                    res.json(user[0]);
                })
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to register');
    });
}

module.exports = {
    handleRegister: handleRegister
}