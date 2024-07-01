const mqtt = require('mqtt');
const socketHandler = require('./socketHandler');
const {insertToDbMW, autoControlMW, insertPumpLogMW} = require('./middleware');
const moment = require('moment');

const mqttClientInfos = [];
//[adafruit_username: {mqttClient, topics}]

const getMessageHandler = async (adafruit_username, feed_key, last_value, updated_at) => {
    const socket = socketHandler.getSocket(adafruit_username);
    //feed key device is 'fan'/'led'/'pump' + number_id or 'image'
    if (feed_key.includes('fan') || feed_key.includes('led')) {
        if (socket) {
            socket.emit('updateStateDevice', { feed_key, last_value });
        } else {
            console.log('No socket found');
        }
    } else if (feed_key.includes('pump')) {
        if (socket) {
            socket.emit('updateStateDevice', { feed_key, last_value });
        } else {
            console.log('No socket found');
        }
        const newForm = moment.utc(updated_at, 'YYYY-MM-DD HH:mm:ss').utcOffset(7).format('YYYY-MM-DD HH:mm:ss');
        insertPumpLogMW(feed_key, last_value, newForm)
    } else if (feed_key === 'image') {
        if (socket) {
            socket.emit('updateImage', last_value, updated_at);
        } else {
            console.log('No socket found');
        }
    } else if (feed_key === 'AI') {
        if (socket) {
            socket.emit('updateResult', last_value);
        } else {
            console.log('No socket found');
        }
    } else {
        console.log(updated_at)
        const newForm = moment.utc(updated_at, 'YYYY-MM-DD HH:mm:ss').utcOffset(7).format('YYYY-MM-DD HH:mm:ss');
        try {
            await Promise.all([
                insertToDbMW(adafruit_username, last_value, feed_key, newForm),
                autoControlMW(adafruit_username, feed_key, last_value)
            ])
            console.log('Done')
        } catch (error) {
            console.log(error)
        }
        if (socket) {
            socket.emit('updateDataNow', feed_key, last_value, updated_at);
        } else {
            console.log('No socket found');
        }
    }
}
exports.createMqttConnection = async (adafruit_username, adafruit_key) => {
    return new Promise(async (resolve, reject) => {
        if (mqttClientInfos[adafruit_username]) {
            resolve(mqttClientInfos[adafruit_username].mqttClient);
        }
        const host = 'mqtts://io.adafruit.com';
        const mqttClient = mqtt.connect(host, {
            port: 8883,
            username: adafruit_username,
            password: adafruit_key,
            protocol: 'mqtts',
            connectTimeout: 5000,
        });
        mqttClient.on('connect', () => {
            console.log('Connected to Adafruit');
            mqttClient.on('message', (topic, message) => {
                message = JSON.parse(message);
                console.log(message)
                feed_key = topic.split('/')[2];
                last_value = message.last_value;
                updated_at = message.updated_at;
                getMessageHandler(adafruit_username, feed_key, last_value, updated_at);
            });
            const mqttClientInfo = {
                mqttClient: mqttClient,
                topics: new Set()
            }
            mqttClientInfos[adafruit_username] = mqttClientInfo;
            resolve(mqttClient);
        });
        mqttClient.on('error', (error) => {
            console.log('Error connecting to Adafruit');
            reject(error);
        });
    });
}
// exports.getMqttClient = (adafruit_username) => {
//     return mqttClients[adafruit_username];
// }
exports.subscribeToTopics = async (adafruit_username, topics) => {
    return new Promise((resolve, reject) => {
        if (!mqttClientInfos[adafruit_username]) {
            reject('No mqtt client found');
        }
        const mqttClient = mqttClientInfos[adafruit_username].mqttClient;
        if (!mqttClient) {
            reject('No mqtt client found');
        }
        const { topics: subscribedTopics } = mqttClientInfos[adafruit_username];
        topics.forEach(topic => {
            if (subscribedTopics.has(topic)) {
                console.log(`${adafruit_username} already subscribed to topic ${topic}`);
            } else {
                mqttClient.subscribe(topic, (err) => {
                    if (err) {
                        console.log(`Error subscribing to topic ${topic}`);
                        reject(err);
                    } else {
                        // console.log(`Subscribed to topic ${topic}`);
                        subscribedTopics.add(topic);
                    }
                });
            }
        });
        // console.log(subscribedTopics);
        resolve();
    });
}
exports.unsubscribeFromTopics = async (adafruit_username, topics) => {
    return new Promise((resolve, reject) => {
        if (!mqttClientInfos[adafruit_username]) {
            reject('No mqtt client found');
        }
        const mqttClient = mqttClientInfos[adafruit_username].mqttClient;
        if (!mqttClient) {
            reject('No mqtt client found');
        }
        const { topics: subscribedTopics } = mqttClientInfos[adafruit_username];
        topics.forEach(topic => {
            if (subscribedTopics.has(topic)) {
                mqttClient.unsubscribe(topic, (err) => {
                    if (err) {
                        console.log(`Error unsubscribing from topic ${topic}`);
                        reject(err);
                    } else {
                        console.log(`Unsubscribed from topic ${topic}`);
                        subscribedTopics.delete(topic);
                    }
                });
            } else {
                console.log(`${adafruit_username} is not subscribed to topic ${topic}`);
            }
        });
        resolve();
    });
}
exports.publishToTopic = async (adafruit_username, topic, message) => {
    return new Promise((resolve, reject) => {
        // console.log(adafruit_username)
        // console.log(mqttClientInfos)
        // console.log(`Publishing to topic ${topic}`);
        if (!mqttClientInfos[adafruit_username]) {
            console.log('No mqtt client found 1');
            reject('No mqtt client found');
        }
        const mqttClient = mqttClientInfos[adafruit_username].mqttClient;
        if (!mqttClient) {
            console.log('No mqtt client found 2');
            reject('No mqtt client found');
        }
        mqttClient.publish(topic, message, (err) => {
            if (err) {
                console.log(`Error publishing to topic ${topic}`);
                reject(err);
            } else {
                console.log(`Published to topic ${topic}`);
                resolve();
            }
        });
    });
}