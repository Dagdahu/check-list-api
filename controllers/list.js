const handleListAdd = (req, res, db) => {
    const {name, userId} = req.body;
    if (!name || !userId) {
        return res.status(400).json('incorrect form');
    }

    db.transaction(trx => {
        trx('list')
        .insert({
            name:name,
            user_id:userId
        })
        .returning('id')
        .then(list_id => {
            if (list_id.length) {
                /// Get last inserted list
                return trx('list').select()
                .where('id', list_id[0])
                .then(newList => {
                    if (newList.length) {
                        res.json(newList[0]);
                    } else {
                        res.status(400).json('Failed to retrieve created list');
                    }
                })
            } else {
                res.status(400).json('Failed to create list');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to create list');
    });
}

const handleListUpdate = (req, res, db) => {
    const {listId, name, userId} = req.body;
    if (!listId ||!name || !userId) {
        return res.status(400).json('incorrect form');
    }

    db.transaction(trx => {
        trx('list')
        .where('id', '=', listId)
        .update({
            name:name,
            user_id:userId
        })
        .then(success => {
            if (success) {
                /// Get last updated list
                return trx('list').select()
                .where('id', listId)
                .then(newList => {
                    if (newList.length) {
                        res.json(newList[0]);
                    } else {
                        res.status(400).json('Failed to retrieve updated list');
                    }
                })
            } else {
                res.status(400).json('Failed to update list');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to update list');
    });
}

const handleListGet = (req, res, db) => {
    db.select().from('list').where({'id': req.params.id})
        .then(list => {
            if (list.length) {
                res.json(list[0]);
            }
            else {
                res.status(400).json('Not found');
            };
        })
        .catch(err => {
            res.status(400).json('Error getting list');
        });
}

const handleListDelete = (req, res, db) => {
    db('list_item').del().where('list_id', req.params.id)
        .then(() => {
            db('list').del().where('id',req.params.id)
                .then(deletedListNumb => {
                    if(deletedListNumb) {
                        res.json(deletedListNumb);
                    }
                    else {
                        res.status(400).json('Nothing to do');
                    }
                })
                .catch(err => {
                    res.status(400).json('Error deleting list');
                });
        })
        .catch(err => {
            res.status(400).json('Error deleting list');
        });
}

const handleListsGet = (req, res, db) => {
    db.select()
        .from('list')
        .where('user_id', req.params.user_id)
        .then(lists => {
            if (lists.length) {
                res.json(lists);
            }
            else {
                res.status(400).json('Not found');
            };
        })
        .catch(err => {
            res.status(400).json('Error getting lists');
        });
}

module.exports = {
    handleListAdd: handleListAdd,
    handleListUpdate: handleListUpdate,
    handleListGet: handleListGet,
    handleListDelete: handleListDelete,
    handleListsGet: handleListsGet
}