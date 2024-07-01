const db = require("../models/db_connection")
const {createMqttConnection, subscribeToTopics} = require('../mqttHandler');

const authenticate = async (req, res) => {
    const { username, password } = req.body;
    const query = 'select * from Account where username = ? and password = ?';
    db.query(query, [username, password], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if (result.length === 0) {
            res.status(201).send('Invalid username or password');
            return;
        }
        const userInfo = {
            username: result[0].username,
            adafruitInfo: {
                adafruit_username: result[0].adafruit_username,
                adafruit_key: result[0].adafruit_key
            }
        }
        await createMqttConnection(result[0].adafruit_username, result[0].adafruit_key);
        const query = 'select feed_key from Device join Garden on Device.garden_id = Garden.id join Account on Garden.account_id = Account.id where Account.username = ? and Device.type = ?';
        db.query(query, [username, 'pump'], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            let feed_keys = result.map((item) => item.feed_key);
            feed_keys = feed_keys.concat('image', 'AI');
            console.log(feed_keys);
            const topics = feed_keys.map((item) => `${userInfo.adafruitInfo.adafruit_username}/feeds/${item}/json`);
            subscribeToTopics(userInfo.adafruitInfo.adafruit_username, topics);
        })
        res.status(200).send(userInfo);   
    })
}
exports.authenticate = authenticate;

exports.signup = async (req, res) => {
    const { username, password} = req.body;
    const query = 'insert into Account (username, password) values (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }
        res.status(200).send('Account created');
    })
}