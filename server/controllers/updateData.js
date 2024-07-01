const db = require('../models/db_connection');
const axios = require('axios');
const mqttHandler = require('../mqttHandler');

exports.updateUserInfo = async (req, res) => {
    const {username, userInfo} = req.body;
    const {password, email, phone, address} = userInfo;
    const query = 'update Account set password = ?, email = ?, phone = ?, address = ? where username = ?';
    db.query(query, [password, email, phone, address, username], (err) => {
        if(err){
            res.status(500).send({message: 'Error in updating user info'});
        }
        console.log('User info updated successfully')
        res.status(200).send({message: 'User info updated successfully'});
    });
}
exports.changeIOkey = async (req, res) => {
    const {username, adafruitKey, password} = req.body;
    console.log(username, adafruitKey, password);
    const query = 'select * from Account where username = ? and password = ?';
    db.query(query, [username, password], (err, result) => {
        if(err){
            res.status(500).send({message: 'Error in changing IO key'});
        }
        if(result.length === 0){
            res.status(201).send({message: 'Invalid username or password'});
            return;
        }
        const query = 'update Account set adafruit_key = ? where username = ?';
        db.query(query, [adafruitKey, username], (err) => {
            if(err){
                res.status(500).send({message: 'Error in changing IO key'});
            }
            console.log('IO key changed successfully');
            res.status(200).send({message: 'IO key changed successfully'});
        });
    });
}
exports.controlDevice = async (req, res) => {
    const {adafruit_username, feed_key, value} = req.body;
    console.log(adafruit_username, feed_key, value);
    const topic = `${adafruit_username}/feeds/${feed_key}/json`;
    const message = {
        value: value
    };
    try {
        await mqttHandler.publishToTopic(adafruit_username, topic, JSON.stringify(message));
        res.status(200).send({message: 'Control device successfully'});
    } catch (error) {
        res.status(500).send({message: 'Error in controlling device'});
    }

}
exports.changeAutomationState = async (req, res) => {
    const {username, type, newState} = req.body;
    const query = 'select Garden.id from Garden join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error in getting garden id' });
        }
        const garden_id = result[0].id;
        const query = 'update Threshold set automation = ? where garden_id = ? and sensor_type = ?';
        db.query(query, [newState, garden_id, type], (err) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error in changing automation state' });
            }
            console.log('Automation state changed successfully');
            res.status(200).send({ message: 'Automation state changed successfully' });
        });
    }
    );  
}
exports.deletePumpLog = async (req, res) => {
    const {feed_key, start_time} = req.body;
    const query = 'delete from PumpLog where feed_key = ? and start_time = ?';
    console.log(feed_key, start_time);
    db.query(query, [feed_key, start_time], (err) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error in deleting pump log'});
        }
        console.log('Pump log deleted successfully');
        res.status(200).send({message: 'Pump log deleted successfully'});
    });
}
exports.updateThreshold = async (req, res) => {
    const {username, newValue, type} = req.body;
    const query = 'select Garden.id from Garden join Account on Garden.account_id = Account.id where Account.username = ?';
    db.query(query, [username], (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error in getting garden id'});
        }
        const garden_id = result[0].id;
        const query = 'update Threshold set value = ? where garden_id = ? and sensor_type = ?';
        db.query(query, [newValue, garden_id, type], (err) => {
            if(err){
                console.log(err);
                res.status(500).send({message: 'Error in updating threshold'});
            }
            console.log('Threshold updated successfully');
            res.status(200).send({message: 'Threshold updated successfully'});
        });
    });
}