DROP DATABASE IF EXISTS GardenSystem;
CREATE DATABASE GardenSystem;
USE GardenSystem;

-- Table Account
CREATE TABLE IF NOT EXISTS Account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone CHAR(10),
    adafruit_key VARCHAR(255) NOT NULL UNIQUE,
    adafruit_username VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255)
);

-- Table Garden
CREATE TABLE IF NOT EXISTS Garden (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    creation_date DATE,
    description VARCHAR(255),
    account_id INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES Account(id)
);

-- Table Sensor
CREATE TABLE IF NOT EXISTS Sensor (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    sensor_code VARCHAR(255) NOT NULL UNIQUE,
    sensor_type VARCHAR(255),
    -- sensor_type: temperature, humidity, soil_moisture, light_intensity
    unit VARCHAR(255),
    description VARCHAR(255),
    garden_id INT NOT NULL,
    FOREIGN KEY (garden_id) REFERENCES Garden(id)
);

-- Table Threshold
CREATE TABLE IF NOT EXISTS Threshold (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sensor_type VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    value FLOAT NOT NULL,
    is_upper_bound BOOLEAN NOT NULL,
    garden_id INT NOT NULL,
    automation INT NOT NULL,
    FOREIGN KEY (garden_id) REFERENCES Garden(id)
);

-- Table Device
CREATE TABLE IF NOT EXISTS Device (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    -- type: pump / fan / led
    current_state INT NOT NULL,
    -- on:true / off:false
    garden_id INT NOT NULL,
    feed_key VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (garden_id) REFERENCES Garden(id)
);

-- Table Lighting
CREATE TABLE IF NOT EXISTS Lighting (
    device_id INT PRIMARY KEY,
    color VARCHAR(255),
    intensity INT,
    FOREIGN KEY (device_id) REFERENCES Device(id)
);


CREATE TABLE IF NOT EXISTS PumpLog (
    start_time TIMESTAMP,
    feed_key VARCHAR(255) NOT NULL,
    interval_time INT DEFAULT NULL,
    -- Don vi: giay
    FOREIGN KEY (feed_key) REFERENCES Device(feed_key),
    PRIMARY KEY (start_time, feed_key)
);

-- Table MeasuredValue
CREATE TABLE IF NOT EXISTS MeasuredValue (
    timestamp TIMESTAMP,
    sensor_id VARCHAR(255),
    value FLOAT NOT NULL,
    is_out_threshold TINYINT,
    -- low: -1 / normal: 0 / upper: 1
    PRIMARY KEY(sensor_id, timestamp),
    FOREIGN KEY (Sensor_id) REFERENCES Sensor(id)
);

-- Table AverageValue
CREATE TABLE IF NOT EXISTS AverageTemperature (
    sensor_id VARCHAR(255),
    creation_date TIMESTAMP,
    sum FLOAT NOT NULL,
    count TINYINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    PRIMARY KEY(sensor_id, creation_date)
);

CREATE TABLE IF NOT EXISTS AverageHumidity (
    sensor_id VARCHAR(255),
    creation_date TIMESTAMP,
    sum FLOAT NOT NULL,
    count TINYINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    PRIMARY KEY(sensor_id, creation_date)
);

CREATE TABLE IF NOT EXISTS AverageSoilMoisture (
    sensor_id VARCHAR(255),
    creation_date TIMESTAMP,
    sum FLOAT NOT NULL,
    count TINYINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    PRIMARY KEY(sensor_id, creation_date)
);

CREATE TABLE IF NOT EXISTS AverageLightIntensity (
    sensor_id VARCHAR(255),
    creation_date TIMESTAMP,
    sum FLOAT NOT NULL,
    count TINYINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    PRIMARY KEY(sensor_id, creation_date)
);

DELIMITER //

CREATE TRIGGER update_average_value AFTER INSERT ON MeasuredValue
FOR EACH ROW
BEGIN
    DECLARE v_sensor_type VARCHAR(255);
    DECLARE v_creation_date TIMESTAMP;
    DECLARE v_sum FLOAT;
    DECLARE v_count TINYINT;
    DECLARE nearest_creation_date TIMESTAMP;
    
    -- Lấy thông tin sensor_type của sensor được thêm vào
    SELECT sensor_type INTO v_sensor_type FROM Sensor WHERE id = NEW.sensor_id;
    
    -- Lấy ngày giờ của dòng mới thêm vào
    SET v_creation_date = NEW.timestamp;
    
    -- Kiểm tra xem sensor_id đã tồn tại trong bảng Average hay chưa
    IF v_sensor_type = 'temperature' THEN
        SELECT sum, count INTO v_sum, v_count FROM AverageTemperature WHERE sensor_id = NEW.sensor_id LIMIT 1;
    ELSEIF v_sensor_type = 'humidity' THEN
        SELECT sum, count INTO v_sum, v_count FROM AverageHumidity WHERE sensor_id = NEW.sensor_id LIMIT 1;
    ELSEIF v_sensor_type = 'soil_moisture' THEN
        SELECT sum, count INTO v_sum, v_count FROM AverageSoilMoisture WHERE sensor_id = NEW.sensor_id LIMIT 1;
    ELSEIF v_sensor_type = 'light_intensity' THEN
        SELECT sum, count INTO v_sum, v_count FROM AverageLightIntensity WHERE sensor_id = NEW.sensor_id LIMIT 1;
    END IF;
    
    -- Nếu không tìm thấy dòng với sensor_id tương ứng, thêm dòng mới vào bảng Average
    IF v_sum IS NULL THEN
        IF v_sensor_type = 'temperature' THEN
            INSERT INTO AverageTemperature (sensor_id, creation_date, sum, count) VALUES (NEW.sensor_id, v_creation_date, NEW.value, 1);
        ELSEIF v_sensor_type = 'humidity' THEN
            INSERT INTO AverageHumidity (sensor_id, creation_date, sum, count) VALUES (NEW.sensor_id, v_creation_date, NEW.value, 1);
        ELSEIF v_sensor_type = 'soil_moisture' THEN
            INSERT INTO AverageSoilMoisture (sensor_id, creation_date, sum, count) VALUES (NEW.sensor_id, v_creation_date, NEW.value, 1);
        ELSEIF v_sensor_type = 'light_intensity' THEN
            INSERT INTO AverageLightIntensity (sensor_id, creation_date, sum, count) VALUES (NEW.sensor_id, v_creation_date, NEW.value, 1);
        END IF;
    ELSE
        -- Kiểm tra các TH của creation_date để cập nhật các bảng Average
        IF v_sensor_type = 'temperature' THEN
            SELECT MAX(creation_date) INTO nearest_creation_date FROM AverageTemperature WHERE sensor_id = NEW.sensor_id;
            IF (DATE(nearest_creation_date) != DATE(v_creation_date)) THEN
                INSERT INTO AverageTemperature VALUES (NEW.sensor_id, NEW.timestamp, NEW.value, 1);
            ELSE
                UPDATE AverageTemperature SET sum = sum + NEW.value, count = count + 1, creation_date = v_creation_date WHERE sensor_id = NEW.sensor_id AND creation_date = nearest_creation_date;
            END IF;
        ELSEIF v_sensor_type = 'humidity' THEN
            SELECT MAX(creation_date) INTO nearest_creation_date FROM AverageHumidity WHERE sensor_id = NEW.sensor_id;
            IF (DATE(nearest_creation_date) != DATE(v_creation_date)) THEN
                INSERT INTO AverageHumidity VALUES (NEW.sensor_id, NEW.timestamp, NEW.value, 1);
            ELSE
                UPDATE AverageHumidity SET sum = sum + NEW.value, count = count + 1, creation_date = v_creation_date WHERE sensor_id = NEW.sensor_id AND creation_date = nearest_creation_date;
            END IF;
        ELSEIF v_sensor_type = 'soil_moisture' THEN
            SELECT MAX(creation_date) INTO nearest_creation_date FROM AverageSoilMoisture WHERE sensor_id = NEW.sensor_id;
            IF (DATE(nearest_creation_date) != DATE(v_creation_date)) THEN
                INSERT INTO AverageSoilMoisture VALUES (NEW.sensor_id, NEW.timestamp, NEW.value, 1);
            ELSE
                UPDATE AverageSoilMoisture SET sum = sum + NEW.value, count = count + 1, creation_date = v_creation_date WHERE sensor_id = NEW.sensor_id AND creation_date = nearest_creation_date;
            END IF;
        ELSEIF v_sensor_type = 'light_intensity' THEN
            SELECT MAX(creation_date) INTO nearest_creation_date FROM AverageLightIntensity WHERE sensor_id = NEW.sensor_id;
            IF (DATE(nearest_creation_date) != DATE(v_creation_date)) THEN
                INSERT INTO AverageLightIntensity VALUES (NEW.sensor_id, NEW.timestamp, NEW.value, 1);
            ELSE
                UPDATE AverageLightIntensity SET sum = sum + NEW.value, count = count + 1, creation_date = v_creation_date WHERE sensor_id = NEW.sensor_id AND creation_date = nearest_creation_date;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE CalculateSevenDayAvg(IN username VARCHAR(255), IN ss_type VARCHAR(255), IN end_date DATE)
BEGIN
    DECLARE sensor_id VARCHAR(255);
    DECLARE start_date DATE;
    DECLARE avg_table_name VARCHAR(255);

    IF end_date IS NULL THEN
        SET end_date = CURDATE();
    END IF;

    SET start_date = DATE_SUB(end_date, INTERVAL 6 DAY); -- Lấy 7 ngày gần nhất

    -- Lấy sensor_id từ bảng Sensor dựa trên username và ss_type
    SELECT id INTO sensor_id FROM Sensor 
    WHERE sensor_type = ss_type 
    AND garden_id = (
        SELECT id FROM Garden 
        WHERE account_id = (
            SELECT id FROM Account WHERE username = username
        )
    );

    -- Xác định bảng average dựa trên ss_type
    CASE ss_type
        WHEN 'temperature' THEN SET avg_table_name = 'AverageTemperature';
        WHEN 'humidity' THEN SET avg_table_name = 'AverageHumidity';
        WHEN 'soil_moisture' THEN SET avg_table_name = 'AverageSoilMoisture';
        WHEN 'light_intensity' THEN SET avg_table_name = 'AverageLightIntensity';
        ELSE SET avg_table_name = NULL;
    END CASE;

    -- Thực hiện truy vấn để lấy 7 hàng gần nhất và trả về kết quả
    IF avg_table_name IS NOT NULL THEN
        SET @query = CONCAT('SELECT DATE(creation_date) AS date, sum/count AS avg_value FROM ', avg_table_name, 
                            ' WHERE sensor_id = "', sensor_id, 
                            '" AND DATE(creation_date) >= "', start_date,
                            '" AND DATE(creation_date) <= "', end_date,
                            '" ORDER BY creation_date LIMIT 7');
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;


DELIMITER //
CREATE TRIGGER before_insert_measured_value
BEFORE INSERT ON MeasuredValue
FOR EACH ROW
BEGIN
    DECLARE count_duplicate INT;

    -- Kiểm tra xem có bản ghi nào trong bảng đã tồn tại với cùng timestamp và sensor_id không
    SELECT COUNT(*) INTO count_duplicate
    FROM MeasuredValue
    WHERE timestamp = NEW.timestamp AND sensor_id = NEW.sensor_id;

    -- Nếu có bản ghi trùng thì không thêm vào
    IF count_duplicate > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Khóa chính đã tồn tại';
    END IF;
END;
//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE CalculateAvgLastestOneDay(IN username VARCHAR(255), IN garden_id INT)
BEGIN
    DECLARE latest_date DATE;
    DECLARE avg_humidity FLOAT;
    DECLARE avg_temperature FLOAT;
    DECLARE avg_soil_moisture FLOAT;
    DECLARE avg_light_intensity FLOAT;

    SELECT MAX(DATE(creation_date)) INTO latest_date FROM AverageHumidity WHERE sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);
    -- SELECT MAX(creation_date) INTO latest_date FROM AverageHumidity WHERE sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);

    SELECT sum / count INTO avg_humidity FROM AverageHumidity WHERE DATE(creation_date) = latest_date AND sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);

    SELECT sum / count INTO avg_temperature FROM AverageTemperature WHERE DATE(creation_date) = latest_date AND sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);

    SELECT sum / count INTO avg_soil_moisture FROM AverageSoilMoisture WHERE DATE(creation_date) = latest_date AND sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);

    SELECT sum / count INTO avg_light_intensity FROM AverageLightIntensity WHERE DATE(creation_date) = latest_date AND sensor_id IN (SELECT id FROM Sensor WHERE garden_id = garden_id);

    SELECT avg_humidity, avg_temperature, avg_soil_moisture, avg_light_intensity;

END
//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE InsertToPumpLog(IN current TIMESTAMP, IN new_state INT, IN feed_key VARCHAR(255))
BEGIN
    DECLARE lastest_interval_time INT;
    DECLARE new_interval_time INT;
    DECLARE latest_start_date TIMESTAMP;

    SELECT interval_time, start_time INTO lastest_interval_time, latest_start_date FROM PumpLog WHERE start_time = (SELECT MAX(start_time) FROM PumpLog WHERE feed_key = feed_key) AND feed_key = feed_key;
    IF latest_start_date IS NULL THEN
        IF new_state = 1 THEN
            INSERT INTO PumpLog (start_time, feed_key) VALUES (current, feed_key);
        ELSE
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Trạng thái mới trùng với trạng thái cũ';
        END IF;
    ELSE
        IF new_state = 1 THEN
            IF lastest_interval_time IS NULL THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Trạng thái mới trùng với trạng thái cũ';
            ELSE
                INSERT INTO PumpLog (start_time, feed_key) VALUES (current, feed_key);
            END IF;
        ELSE 
            IF lastest_interval_time IS NOT NULL THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Trạng thái mới trùng với trạng thái cũ';
            ELSE
                SET new_interval_time = TIMESTAMPDIFF(SECOND, latest_start_date, current);
                UPDATE PumpLog SET start_time = latest_start_date, interval_time = new_interval_time WHERE start_time = latest_start_date AND feed_key = feed_key;
            END IF;
        END IF;
    END IF;
END//
DELIMITER ;
INSERT INTO Account (username, password, phone, adafruit_key, adafruit_username)
VALUES ('anhnongdan2003', 'anhnongdan2003', '0123456789', 'qua zalo lay', 'zoro170703');
INSERT INTO Garden (name, creation_date, description, account_id)
VALUES ('Garden1', '2024-03-28', 'Khu vuon cua anh nong dan 2003', 1);
INSERT INTO Sensor (id, name, sensor_code, unit, garden_id, sensor_type)
VALUES ('0FHZBTYWECF00N98A8G5SJGWCC', 'Temperature Sensor', 'temp', '°C', 1, 'temperature');
INSERT INTO Sensor (id, name, sensor_code, unit, garden_id, sensor_type)
VALUES ('0FHZBTZQ1T8QS4P9JH24TZ8WZF', 'Humidity Sensor', 'humidity', '%', 1, 'humidity');
INSERT INTO Sensor (id, name, sensor_code, unit, garden_id,sensor_type)
VALUES ('0FHP5TV9V0NN1X9PBEDNFS251W', 'Soil Moisture Sensor', 'sm', '%', 1, 'soil_moisture');
INSERT INTO Sensor (id, name, sensor_code, unit, garden_id, sensor_type)
VALUES ('0FHP5THTZGRWXHFZMMX679SWCZ', 'Light Intensity Sensor', 'light', 'lux', 1, 'light_intensity');
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 23:59:00', '0FHZBTYWECF00N98A8G5SJGWCC', 35, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 23:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 33, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 08:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 30, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 09:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 30, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 10:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 34, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 20:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 35, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 21:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 36, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 22:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 34, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 37, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:59:00', '0FHZBTYWECF00N98A8G5SJGWCC', 35, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 33, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:59:00', '0FHZBTYWECF00N98A8G5SJGWCC', 35, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 37.3, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:59:00', '0FHZBTYWECF00N98A8G5SJGWCC', 37.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:00:00', '0FHZBTYWECF00N98A8G5SJGWCC', 38.7, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:59:00', '0FHZBTYWECF00N98A8G5SJGWCC', 38, 0);

INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 08:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 74.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 09:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 76, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 10:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 79.3, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 20:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 78.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 21:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 75.2, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 22:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 80, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 75.6, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:59:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 77.7, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 74.4, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:59:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 74.9, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 78.2, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:59:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 77.9, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 77.6, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:59:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 77, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:59:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 74.9, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:00:00', '0FHZBTZQ1T8QS4P9JH24TZ8WZF', 78.2, 0);

INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 08:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 84.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 09:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 81.4, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 10:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 83.2, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 20:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 84.3, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 21:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 85, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 22:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 81, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 82, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:59:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 85, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 86.1, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:59:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 86.7, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 82.9, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-15 23:59:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 83.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 00:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 84, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 00:59:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 83.7, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 23:59:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 83.5, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:00:00', '0FHP5TV9V0NN1X9PBEDNFS251W', 84, 0);

INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 08:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2600, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-10 09:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2750, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 10:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2918, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-11 20:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 3000, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 21:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2277, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-12 22:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2314, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2567, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-13 23:59:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2783, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2872, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-14 23:59:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2901, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2657, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-16 23:59:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2753, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:00:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2431, 0);
INSERT INTO MeasuredValue (timestamp, sensor_id, value, is_out_threshold)
VALUES ('2024-05-17 00:59:00', '0FHP5THTZGRWXHFZMMX679SWCZ', 2535, 0);

-- CALL CalculateSevenDayAvg('anhnongdan2003', 'temperature', '2024-04-12');

INSERT INTO Device (name, type, current_state, garden_id, feed_key)
VALUES ('Fan1', 'fan', 4, 1, 'fan');
INSERT INTO Device (name, type, current_state, garden_id, feed_key)
VALUES ('Led1', 'led', 0, 1, 'led');
INSERT INTO Device (name, type, current_state, garden_id, feed_key)
VALUES ('Pump1', 'pump', 0, 1, 'pump');

INSERT INTO Threshold (sensor_type, unit, value, is_upper_bound, garden_id, automation)
VALUES ('temperature', '°C', 35, 1, 1, 1);
INSERT INTO Threshold (sensor_type, unit, value, is_upper_bound, garden_id, automation)
VALUES ('light_intensity', 'lux', 2500, 0, 1, 1);
INSERT INTO Threshold (sensor_type, unit, value, is_upper_bound, garden_id, automation)
VALUES ('soil_moisture', '%', 30, 0, 1, 1);

Call InsertToPumpLog('2024-04-12 01:00:00', 1, 'pump');
Call InsertToPumpLog('2024-04-12 01:30:00', 0, 'pump');
Call InsertToPumpLog('2024-04-12 02:00:00', 1, 'pump');
Call InsertToPumpLog('2024-04-12 02:30:00', 0, 'pump');