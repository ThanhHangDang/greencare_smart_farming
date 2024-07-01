/* 
get average temperature, humidity, soil moisture, light intensity data in past 7 days and now
*/
const db = require('../models/db_connection');
const axios = require('axios');
const {subscribeToTopics} = require('../mqttHandler');
const mqqHandler = require('../mqttHandler');

const getDatasNow = async(adafruit_username, adafruit_key, feed_keys) => {
    const datas = await Promise.all(feed_keys.map(feed_key => {
        return axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/${feed_key}/data?limit=1`, {headers: {'X-AIO-Key': adafruit_key}});
    }));
    return datas.map(data => data.data[0]['value']);
}
exports.getDataNow = async (req, res) => {
    try {
        const {adafruit_username, adafruit_key} = req.body;
        const [temp, light, humidity, sm] = await Promise.all([
            axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/temp/data?limit=1`, {headers: {'X-AIO-Key': adafruit_key}}),
            axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/light/data?limit=1`, {headers: {'X-AIO-Key': adafruit_key}}),
            axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/humidity/data?limit=1`, {headers: {'X-AIO-Key': adafruit_key}}),
            axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/sm/data?limit=1`, {headers: {'X-AIO-Key': adafruit_key}})
        ]);
        const data = [temp.data[0], light.data[0], humidity.data[0], sm.data[0]];
        const topics = ['temp', 'light', 'humidity', 'sm'].map(feed_key => `${adafruit_username}/feeds/${feed_key}/json`);
        await subscribeToTopics(adafruit_username, topics);
        console.log(data);
        res.status(200).send(data);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in getting data" });
    }
}
exports.getAvgDateLastest1Day = async (req, res) => {
    const {username} = req.body;
    const query = 'select Garden.id from Garden join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting garden id' });
        } 
        const garden_id = result[0].id;
        const query = 'call CalculateAvgLastestOneDay(?, ?)';
        db.query(query, [username, garden_id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting average data' });
            }
            res.status(200).send(result);
        });
    });
}
exports.getAvgDataPast7Days = async (req, res) => {
    const {username, dataType, endDate} = req.body;
    const query = 'call CalculateSevenDayAvg(?, ?, ?)';
    db.query(query, [username, dataType, endDate], (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error in getting average data'});
        }
        res.status(200).send(result);
    });
}
exports.getUserInfo = async (req, res) => {
    const {username} = req.body;
    const query = 'select password, email, phone, address from Account where username = ?';
    db.query(query, [username], (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error in getting user info'});
        }
        res.status(200).send(result);
    });
}
/*type in ['fan', 'led', 'pum']*/
exports.getDevicesInfo = async (req, res) => {
    const {username, type, adafruit_username, adafruit_key} = req.body;
    const query = 'select Garden.id from Garden join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting garden id' });
        }
        const garden_id = result[0].id;
        const query = 'select id, name, current_state, feed_key from Device where garden_id = ? and type = ?';
        db.query(query, [garden_id, type], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting device info' });
            }
            feed_keys = result.map(device => device.feed_key);
            const topics = feed_keys.map(feed_key => `${adafruit_username}/feeds/${feed_key}/json`);
            console.log(topics.length);
            await subscribeToTopics(adafruit_username, topics);
            values = await getDatasNow(adafruit_username, adafruit_key, feed_keys);
            result.forEach((device, index) => {
                device['current_state'] = values[index];
            });
            res.status(200).send(result);
        });
    })
}
exports.getAutomationState = async (req, res) => {
    const {username, type} = req.body;
    const query = 'select Garden.id from Garden join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting garden id' });
        }
        const garden_id = result[0].id;
        let sensor_type;
        if (type === 'fan') {
            sensor_type = 'temperature';
        } else if (type === 'led') {
            sensor_type = 'light_intensity';
        } else {
            sensor_type = 'soil_moisture';
        }
        const query = 'select automation from Threshold where garden_id = ? and sensor_type = ?';
        db.query(query, [garden_id, sensor_type], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting automation state' });
            }
            res.status(200).send(result);
        });
        
    });
}
exports.getPumpLog = async (req, res) => {
    const {username, searchTerm} = req.body;
    if (searchTerm === '') {
        const query = 'select Device.name, PumpLog.start_time, PumpLog.interval_time, PumpLog.feed_key from PumpLog join Device on PumpLog.feed_key = Device.feed_key join Garden on Device.garden_id = Garden.id join Account on Garden.account_id = Account.id where Account.username = ? order by PumpLog.start_time desc';
        db.query(query, [username], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting pump log' });
            }
            res.status(200).send(result);
        });
    } else {
        const query = 'select Device.name, PumpLog.start_time, PumpLog.interval_time, PumpLog.feed_key from PumpLog join Device on PumpLog.feed_key = Device.feed_key join Garden on Device.garden_id = Garden.id join Account on Garden.account_id = Account.id where Account.username = ? and (Device.name like ? or  PumpLog.start_time like ?) order by PumpLog.start_time desc';
        console.log("SearchTerm", searchTerm)
        db.query(query, [username, `%${searchTerm}%`, `%${searchTerm}%`], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in getting pump log' });
            }
            console.log(result);
            res.status(200).send(result);
        });
    }
}
exports.getThreshold = async (req, res) => {
    const {username} = req.body;
    const query = 'select sensor_type, value, is_upper_bound from Threshold join Garden on Threshold.garden_id = Garden.id join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting threshold' });
        }
        result = JSON.stringify(result);
        res.status(200).send(result);
    })
}
