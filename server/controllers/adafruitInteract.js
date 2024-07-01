const db = require('../models/db_connection');
const axios = require('axios');
//ON: onLed = 1, OFF: onLed = 0

exports.postToAdafruit = async (adafruit_username, adafruit_key, key, data) => {
    try {
        const dt = { value: data };
        await axios.post(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/${key}/data`, dt, { headers: { 'X-AIO-Key': adafruit_key } });
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
exports.controlDevice = async (req, res) => {
    const { username, deviceId, newState } = req.body;
    const query = 'select adafruit_username, adafruit_key from Account where username = ?';
    db.query(query, [username], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting adafruit info' });
        }
        const { adafruit_username, adafruit_key } = result[0];
        const query = 'select feed_key from Device where id = ?';
        db.query(query, [deviceId], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting device info' });
            }
            const key = result[0].feed_key;
            const response = await postToAdafruit(adafruit_username, adafruit_key, key, newState);
            if (response) {
                const updateCurState = 'update Device set current_state = ? where id = ?';
                db.query(updateCurState, [newState, deviceId], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error in updating device state' });
                    }
                    res.status(200).send({ message: 'Control device successfully' });
                });
            } else {
                res.status(500).send({ message: 'Error in controlling device' });
            }
        });
    });
}
exports.getImage = async (req, res) => {
    const { adafruit_username, adafruit_key } = req.body;
    await axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/image/data?limit=1`,
        {}, { headers: { 'X-AIO-Key': adafruit_key } }).then(response => {
            res.status(200).send(response.data[0]['value']);
        }).catch(error => {
            console.log(error);
            res.status(500).send({ message: 'Error in getting image' });
        });
}