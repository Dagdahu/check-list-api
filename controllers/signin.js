const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json('incorrect form');
    }
    db.transaction(trx => {
        /// Get user based on email 
        trx('user').select()
        .where('email', email)
        .then(user => {
            if (user.length) {
                /// User found, get associated login
                return trx('login').select()
                .where('id', user[0].login_id)
                .then(login => {
                    if (login.length) {
                        /// Login found, check password
                        if (bcrypt.compareSync(password, login[0].hash)) {
                            res.json(user[0]);
                        }
                        else {
                            res.status(400).json('Not found');
                        };
                    }
                    else {
                        res.status(400).json('No login associated');
                    };
                })            
            }
            else {
                res.status(400).json('Not found');
            };
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to signin');
    });
}

module.exports = {
    handleSignin: handleSignin
}