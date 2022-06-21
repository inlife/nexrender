const { send }   = require('micro')
const { remove } = require('../helpers/database')

module.exports = async (req, res) => {
    console.log(`removing job ${req.params.uid}`)

    try {
        await remove(req.params.uid);
    } catch (err) {
        return send(res, 400, err)
    }

    send(res, 200, { id: req.params.uid, removed: true })
}
