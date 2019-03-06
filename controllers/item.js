const handleItemAdd = (req, res, db) => {
    const {name, userId, listId} = req.body;
    if (!name || !userId || !listId) {
        return res.status(400).json('incorrect form');
    }
    db.transaction(trx => {
        /// Insert new item
        trx('item')
        .insert({
            name:name,
            user_id:userId
        })
        .returning('id')
        .then(item_id => {
            if (item_id.length) {
                /// Get last inserted item
                return trx('item').select()
                .where('id', item_id[0])
                .then(newItem => {
                    if (newItem.length) {
                        /// Add item to the list
                        return trx('list_item').insert({
                            list_id:listId,
                            item_id:newItem[0].id
                        })
                        .then(() => {
                            newItem[0].enable = 1;
                            res.json(newItem[0]);
                        })
                    } else {
                        res.status(400).json('Failed to retrieve created item');
                    }
                })
            } else {
                res.status(400).json('Failed to create item');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to create item');
    });
}

const handleItemList = (req, res, db) => {
    let {itemId, listId, enable} = req.body;
    if (!itemId || !listId || enable === undefined) {
        return res.status(400).json('incorrect form');
    }
    enable = enable ? 1 : 0;
    db.transaction(trx => {
        trx('list_item')
        .where({
            'list_id': listId,
            'item_id': itemId
        })
        .update({enable:enable})
        .then(success => {
            if (success) {
                /// Retrieve and send link + item
                return trx('list_item')
                    .select(
                        'list_item.enable',
                        'item.id',
                        'item.name',
                        'item.count'
                    )
                    .where({
                        'list_id': listId,
                        'item_id': itemId
                    })
                    .join('item', {'list_item.item_id': 'item.id'})
                    .then(item => {
                        if (item.length) {
                            res.json(item[0]);
                        }
                        else {
                            res.status(400).json('Not found');
                        };
                    })
            } else {
                res.status(400).json('Failed to update item in list');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to update item in list');
    });
}

const handleItemLink = (req, res, db) => {
    const {itemId, listId} = req.body;
    if (!itemId || !listId) {
        return res.status(400).json('incorrect form');
    }
    db.transaction(trx => {
        /// Link item to the list
        trx('list_item').insert({
            list_id:listId,
            item_id:itemId
        })
        .then(() => {
            /// Increment item count
            return trx('item')
                .where('id', itemId)
                .increment('count',1)
                .then(() => {
                    /// Retrieve and send link + item
                    return trx('list_item')
                        .select(
                            'list_item.enable',
                            'item.id',
                            'item.name',
                            'item.count'
                        )
                        .where({
                            'list_id': listId,
                            'item_id': itemId
                        })
                        .join('item', {'list_item.item_id': 'item.id'})
                        .then(item => {
                            if (item.length) {
                                res.json(item[0]);
                            }
                            else {
                                res.status(400).json('Not found');
                            };
                        })

            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to link item');
    });
}

const handleItemUnlink = (req, res, db) => {
    const {itemId, listId} = req.body;
    if (!itemId || !listId) {
        return res.status(400).json('incorrect form');
    }
    db('list_item').del().where({
            'list_id': listId,
            'item_id': itemId
        })
        .then((deletedListNumb) => {
            if(deletedListNumb) {
                res.json(deletedListNumb);
            }
            else {
                res.status(400).json('Nothing to do');
            }
        })
        .catch(err => {
            res.status(400).json('Error unlinking item');
        });
}

const handleItemDelete = (req, res, db) => {
    db('list_item').count('* as count').where('item_id', req.params.id)
        .then(listItemCount => {
            if (listItemCount[0].count === 0) {
                db('item').del().where('id',req.params.id)
                    .then(deletedItemNumb => {
                        if(deletedItemNumb) {
                            res.json(deletedItemNumb);
                        }
                        else {
                            res.status(400).json('Nothing to do');
                        }
                    })
                    .catch(err => {
                        res.status(400).json('Error deleting item');
                    });
            }
            else {
                res.json('Cannot delete linked item');
            }
        })
        .catch(err => {
            res.status(400).json('Error deleting item links');
        });
}

const handleUserItems = (req, res, db) => {
    db.select()
        .from('item')
        .where('user_id', req.params.user_id)
        .orderBy('count','DESC')
        .then(items => {
            if (items.length) {
                res.json(items);
            }
            else {
                res.status(400).json('Not found');
            };
        })
        .catch(err => {
            res.status(400).json('Error getting items');
        });
}

const handleListItems = (req, res, db) => {
    db('list_item')
        .select(
            'list_item.enable',
            'item.id',
            'item.name',
            'item.count'
        )
        .where('list_id', req.params.list_id)
        .join('item', {'list_item.item_id': 'item.id'})
        .then(items => {
            if (items.length) {
                res.json(items);
            }
            else {
                res.status(400).json('Not found');
            };
        })
        .catch(err => {
            res.status(400).json('Error getting items');
        });
}

module.exports = {
    handleItemAdd: handleItemAdd,
    handleItemList: handleItemList,
    handleItemLink: handleItemLink,
    handleItemUnlink: handleItemUnlink,
    handleItemDelete: handleItemDelete,
    handleUserItems: handleUserItems,
    handleListItems: handleListItems
}