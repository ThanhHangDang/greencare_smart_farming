const axios = require('axios');
const db = require('./models/db_connection');
const { postToAdafruit } = require('./controllers/adafruitInteract');

exports.getDataNowMW = async ({ adafruit_username, adafruit_key }) => {
    const [temp, light, humidity, sm] = await Promise.all([
        axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/temp/data?limit=1`, { headers: { 'X-AIO-Key': adafruit_key } }),
        axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/light/data?limit=1`, { headers: { 'X-AIO-Key': adafruit_key } }),
        axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/humidity/data?limit=1`, { headers: { 'X-AIO-Key': adafruit_key } }),
        axios.get(`https://io.adafruit.com/api/v2/${adafruit_username}/feeds/sm/data?limit=1`, { headers: { 'X-AIO-Key': adafruit_key } })
    ]);
    const data = [temp.data[0], light.data[0], humidity.data[0], sm.data[0]];
    return data;
}
exports.insertToDbMW = async (adafruit_username, last_value, feed_key, updated_at) => {
    const query = 'select garden.id from garden join account on garden.account_id = account.id where account.adafruit_username = ?';
    db.query(query, [adafruit_username], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        const query = 'select sensor.id from sensor join garden on sensor.garden_id = garden.id where garden.id = ? and sensor.sensor_code = ?';
        db.query(query, [result[0].id, feed_key], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            const query = 'INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold) VALUES (?, ?, ?, ?)';
            db.query(query, [updated_at, result[0].id, last_value, 0], (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
    }
    );
}
exports.autoControlMW = async (adafruit_username, feed_key, last_value) => {
    console.log('Auto control');
    let sensor_type;
    let device_type;
    if (feed_key === 'temp') {
        sensor_type = 'temperature';
        device_type = 'fan'
    } else if (feed_key === 'light') {
        sensor_type = 'light_intensity';
        device_type = 'led';
    } else if (feed_key === 'sm') {
        sensor_type = 'soil_moisture';
        device_type = 'pump';
    } else {
        sensor_type = 'soil_moisture';
        device_type = 'pump';
    }
    const query = 'select threshold.value, threshold.is_upper_bound, garden.id, account.adafruit_key, automation from threshold join garden on threshold.garden_id = garden.id join account on garden.account_id = account.id where account.adafruit_username = ? and threshold.sensor_type = ?';
    db.query(query, [adafruit_username, sensor_type], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        const threshold = result[0].value;
        const is_upper_bound = result[0].is_upper_bound;
        const garden_id = result[0].id;
        const adafruit_key = result[0].adafruit_key;
        const automation = result[0].automation;
        console.log(automation)
        if (!automation) {
            return;
        }
        let newState;
        if ((is_upper_bound && last_value > threshold) || (!is_upper_bound && last_value < threshold)) {
            newState = 1;
        } else {
            newState = 0;
        }
        const query = 'select feed_key from device where garden_id = ? and type = ?';
        db.query(query, [garden_id, device_type], async (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            const response = await postToAdafruit(adafruit_username, adafruit_key, result[0].feed_key, newState);
            if (response) {
                console.log('Control device successfully');
            } else {
                console.log('Error in controlling device');
            }
        });
    }
    );
}
exports.insertPumpLogMW = async (feed_key, last_value, updated_at) => {
    const query = 'call InsertToPumpLog (?, ?, ?)';
    db.query(query, [updated_at, last_value, feed_key], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
    });
}
