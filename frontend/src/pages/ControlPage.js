import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useUser } from '../components/UserContext'
import Modal from 'react-modal'
import styles from '../styles/ControlPage.module.css'
import socketIOClient from 'socket.io-client';

export default function DeviceController() {
    const [fans, setFans] = useState([])
    const [leds, setLeds] = useState([])
    const [pumps, setPumps] = useState([])
    const [selectedFan, setSelectedFan] = useState()
    const [selectedLed, setSelectedLed] = useState()
    const [selectedPump, setSelectedPump] = useState()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [autoFan, setAutoFan] = useState(false)
    const [autoLed, setAutoLed] = useState(false)
    const [autoPump, setAutoPump] = useState(false)
    console.log(autoFan, autoLed, autoPump)
    const { username, loggedIn, adafruitInfo, threshold, setThreshold } = useUser()
    const [tempUpperThreshold, setTempUpperThreshold] = useState(0)
    const [lightLowerThreshold, setLightLowerThreshold] = useState(0)
    const [moistureLowerThreshold, setMoistureLowerThreshold] = useState(0)

    const changeThreshold = async (type) => {
        let newValue;
        if (type === 'fan') {
            newValue = tempUpperThreshold
            type = 'temperature'
        } else if (type === 'led') {
            newValue = lightLowerThreshold
            type = 'light_intensity'
        } else {
            newValue = moistureLowerThreshold
            type = 'soil_moisture'
        }
        setThreshold(prevThreshold => {
            const newThreshold = prevThreshold.map(threshold => {
                if (threshold.sensor_type === type) {
                    return { ...threshold, value: newValue }
                }
                return threshold
            })
            return newThreshold
        })
        const response = await axios.post('http://localhost:3001/api/updateThreshold', {
            username: username,
            newValue: newValue,
            type: type
        })
        if (response.status !== 200) {
            setModalIsOpen(true)
            setModalContent("Cập nhật ngưỡng thất bại")
        } else {
            setModalIsOpen(true)
            setModalContent("Cập nhật ngưỡng thành công")

            setTimeout(() => {
                setModalIsOpen(false)
                setModalContent('')
            }, 500)
        }
    }
    const handleThresholdChange = (value, type) => {
        if (type === 'fan') {
            setTempUpperThreshold(value)
        } else if (type === 'led') {
            setLightLowerThreshold(value)
        } else {
            setMoistureLowerThreshold(value)
        }
    }
    const getDevicesInfo = async (apiEndpoint, type) => {
        console.log(username, type)
        const response = await axios.post(apiEndpoint, {
            username: username, type: type,
            adafruit_username: adafruitInfo.adafruit_username,
            adafruit_key: adafruitInfo.adafruit_key
        })
        return response.data
    }

    const getAutomationState = async (apiEndpoint, type) => {
        const response = await axios.post(apiEndpoint, {
            username: username, type: type
        })
        return response.data[0]['automation']
    }

    const handleFanChange = e => {
        const selectedFanFeedKey = e.target.value
        const fan = fans.find(fan => fan.feed_key === selectedFanFeedKey)
        setSelectedFan(fan)
    }
    const handleLedChange = e => {
        const selectedLedFeedKey = e.target.value
        const led = leds.find(led => led.feed_key === selectedLedFeedKey)
        setSelectedLed(led)
    }
    const handlePumpChange = e => {
        const selectedPumpFeedKey = e.target.value
        const pump = pumps.find(pump => pump.feed_key === selectedPumpFeedKey)
        setSelectedPump(pump)
    }

    const handleOnDevice = async (type) => {
        let selectedDevice;
        // if (type === 'fan') {
        //     selectedDevice = selectedFan
        if (type === 'led') {
            selectedDevice = selectedLed
        } else {
            selectedDevice = selectedPump
        }
        console.log(selectedDevice)
        const response = await axios.post('http://localhost:3001/api/controlDevice', {
            adafruit_username: adafruitInfo.adafruit_username,
            feed_key: selectedDevice.feed_key,
            value: 1
        })
        if (response.status !== 200) {
            setModalIsOpen(true)
            setModalContent("Bật thất bại " + selectedDevice.name)
        }
    }
    const handleOffDevice = async (type) => {
        let selectedDevice
        // if (type === 'fan') {
        //     selectedDevice = selectedFan
        if (type === 'led') {
            selectedDevice = selectedLed
        } else {
            selectedDevice = selectedPump
        }

        const response = await axios.post('http://localhost:3001/api/controlDevice', {
            adafruit_username: adafruitInfo.adafruit_username,
            feed_key: selectedDevice.feed_key,
            value: 0
        })
        if (response.status !== 200) {
            setModalIsOpen(true)
            setModalContent("Tắt thất bại " + selectedDevice.name)
        }
    }
    const handleControlFan = async e => {
        const value = parseInt(e.target.value)
        const response = await axios.post('http://localhost:3001/api/controlDevice', {
            adafruit_username: adafruitInfo.adafruit_username,
            feed_key: selectedFan.feed_key,
            value: value
        })
    }
    const changeAutomationStateHandler = async (type) => {
        let newState;
        if (type === 'fan') {
            newState = !autoFan
            setAutoFan(newState)
            type = 'temperature'
        } else if (type === 'led') {
            newState = !autoLed
            setAutoLed(newState)
            type = 'light_intensity'
        } else {
            newState = !autoPump
            setAutoPump(newState)
            type = 'soil_moisture'
        }
        // setThreshold(prevThreshold => {
        //     const newThreshold = prevThreshold.map(threshold => {
        //         if (threshold.sensor_type === type) {
        //             return { ...threshold, value: newValue }
        //         }
        //         return threshold
        //     })
        //     return newThreshold
        // })

        console.log(threshold)

        const response = await axios.post('http://localhost:3001/api/changeAutomationState', {
            username: username,
            type: type,
            newState: newState
        })
        if (response.status !== 200) {
            setModalIsOpen(true)
            setModalContent("Thay đổi trạng thái tự động thất bại")
        }
    }

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        getDevicesInfo('http://localhost:3001/api/getDevicesInfo', 'fan').then(data => setFans(data))
        getDevicesInfo('http://localhost:3001/api/getDevicesInfo', 'led').then(data => setLeds(data))
        getDevicesInfo('http://localhost:3001/api/getDevicesInfo', 'pump').then(data => setPumps(data))
    }, [loggedIn])

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        getAutomationState('http://localhost:3001/api/getAutomationState', 'fan').then(data => setAutoFan(data))
        getAutomationState('http://localhost:3001/api/getAutomationState', 'led').then(data => setAutoLed(data))
        getAutomationState('http://localhost:3001/api/getAutomationState', 'pump').then(data => setAutoPump(data))
    }, [loggedIn])

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        const socket = socketIOClient('http://localhost:3001', {
            query: adafruitInfo
        });

        socket.on('updateStateDevice', data => {
            const { feed_key, last_value } = data;
            console.log(feed_key, last_value)
            if (feed_key.includes('fan')) {
                setFans(prevFans => {
                    const newFans = prevFans.map(fan => {
                        if (fan.feed_key === feed_key) {
                            return { ...fan, current_state: last_value }
                        }
                        return fan
                    })
                    return newFans
                })
                setSelectedFan(prevFan => {
                    return { ...prevFan, current_state: last_value }
                })
            } else if (feed_key.includes('led')) {
                setLeds(prevLeds => {
                    const newLeds = prevLeds.map(led => {
                        if (led.feed_key === feed_key) {
                            return { ...led, current_state: last_value }
                        }
                        return led
                    })
                    return newLeds
                })
                setSelectedLed(prevLed => {
                    return { ...prevLed, current_state: last_value }
                })
            } else {
                setPumps(prevPumps => {
                    const newPumps = prevPumps.map(pump => {
                        if (pump.feed_key === feed_key) {
                            return { ...pump, current_state: last_value }
                        }
                        return pump
                    })
                    return newPumps
                })
                setSelectedPump(prevPump => {
                    return { ...prevPump, current_state: last_value }
                })
            }
        });

        return () => {
            socket.off('updateStateDevice');
            socket.disconnect();
        }
    }, [loggedIn, adafruitInfo]);
    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded'>
                <div className='mt-3'>
                    <h3>Thiết lập tự động</h3>
                </div>
                <div className='row justify-content-evenly'>
                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Quạt</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-radioactive" style={{ fontSize: '80px' }}></i>
                        </div>

                        <div className='text-center'>
                            <label htmlFor="fanThreshold" className='col-5'
                            style={{
                                width: '120px'
                            }}>Cận trên (°C):</label>
                        </div>

                        <div className='row justify-content-around mt-2'>
                            <input type='number' id='fanThreshold'
                                className='col-3 border border-primary rounded text-center'
                                onChange={e => handleThresholdChange(parseFloat(e.target.value), 'fan')} 
                                placeholder={threshold[0] ? threshold[0].value : ''}
                                style={{
                                    width: '80px'
                                }}>
                            </input>


                            <button className='col-4 border border-primary rounded text-center'
                                onClick={() => changeThreshold('fan')} style={{
                                    width: '50px'
                                }}>
                                Lưu
                            </button>
                        </div>
                        <div className='row justify-content-around mt-3'>
                            <button className='col-6 border border-primary rounded text-center'
                                onClick={() => changeAutomationStateHandler('fan')}
                                style={{
                                    width: '120px'
                                }}>
                                {autoFan > 0 ? 'Hủy tự động' : 'Kích hoạt tự động'}
                            </button>
                        </div>

                    </div>

                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Đèn</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-lightbulb-fill" style={{ fontSize: '80px' }}></i>
                        </div>
                        <div className='text-center'>
                            <label htmlFor="fanThreshold" className='col-5' style={{
                                width: '120px'
                            }}>Cận dưới (lux):</label>
                        </div>
                        <div className='row justify-content-around mt-2'>

                            <input type='number' id='fanThreshold'
                                className='col-3 border border-primary rounded text-center'
                                onChange={e => setLightLowerThreshold(parseFloat(e.target.value), 'light')}
                                placeholder={threshold[1] ? threshold[1].value : ''}
                                style={{
                                    width: '80px'
                                }}></input>
                            <button className='col-4 border border-primary rounded text-center'
                                onClick={() => changeThreshold('led')} style={{
                                    width: '50px'
                                }}>
                                Lưu
                            </button>
                        </div>
                        <div className='row justify-content-around mt-3'>
                            <button className='col-6 border border-primary rounded text-center'
                                onClick={() => changeAutomationStateHandler('led')} style={{
                                    width: '120px'
                                }}>
                                {autoLed > 0 ? 'Hủy tự động' : 'Kích hoạt tự động'}
                            </button>
                        </div>

                    </div>

                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Máy bơm</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-droplet-fill" style={{ fontSize: '80px' }}></i>
                        </div>
                        <div className='text-center'>
                            <label htmlFor="fanThreshold" className='col-5' style={{
                                width: '120px'
                            }}>Cận dưới (%):</label>
                        </div>
                        <div className='row justify-content-around mt-2'>
                            <input type='number' id='fanThreshold'
                                className='col-3 border border-primary rounded text-center'
                                onChange={e => handleThresholdChange(parseFloat(e.target.value), 'pump')}
                                placeholder={threshold[2] ? threshold[2].value : ''}
                                style={{
                                    width: '80px'
                                }}></input>
                            <button className='col-4 border border-primary rounded text-center'
                                onClick={() => changeThreshold('pump')} style={{
                                    width: '50px'
                                }}>
                                Lưu
                            </button>
                        </div>
                        <div className='row justify-content-around mt-3'>
                            <button className='col-4 border border-primary rounded text-center'
                                onClick={() => changeAutomationStateHandler('pump')} style={{
                                    width: '120px'
                                }}>
                                {autoPump > 0 ? 'Hủy tự động' : 'Kích hoạt tự động'}
                            </button>
                        </div>

                    </div>
                </div>

                <div className='mt-3'>
                    <h3>Thiết lập thủ công</h3>
                </div>
                <div className='row justify-content-evenly'>
                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Quạt</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-radioactive" style={{ fontSize: '80px' }}></i>
                        </div>
                        <div className='justify-content-around mt-2 text-center'>
                            {/* <label htmlFor='fan' className=''>Thiết bị </label> */}
                            <select id='fan' className='border border-primary rounded text-center'
                                onChange={handleFanChange}>
                                <option value=''>Chọn thiết bị</option>
                                {fans.map(fan => <option value={fan.feed_key} key={fan.feed_key}>{fan.name}</option>)}
                            </select>
                            {
                                selectedFan && (
                                    <p> Trạng thái:
                                        <span className={selectedFan.current_state > 0 ? 'text-success' : 'text-danger'}>
                                            {selectedFan.current_state > 0 ? ("x" + selectedFan.current_state) : 'Đang tắt'}
                                        </span>
                                    </p>
                                )
                            }
                        </div>
                        <div className='row justify-content-around mt-3'>
                            {
                                selectedFan ? (
                                    <select id='fan' className='border border-primary rounded text-center'
                                        onChange={handleControlFan}>
                                        <option value=''>Chọn tốc độ</option>
                                        <option value='0'>Tắt</option>
                                        <option value='1'>x1</option>
                                        <option value='2'>x2</option>
                                        <option value='3'>x3</option>
                                    </select>
                                ) : (null)
                            }
                        </div>

                    </div>

                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Đèn</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-lightbulb-fill" style={{ fontSize: '80px' }}></i>
                        </div>
                        <div className='justify-content-around mt-2 text-center'>
                            <select id='led' className='border border-primary rounded text-center'
                                onChange={handleLedChange}>
                                <option value=''>Chọn thiết bị</option>
                                {leds.map(led => <option value={led.feed_key} key={led.feed_key}>{led.name}</option>)}
                            </select>
                            {
                                selectedLed && (
                                    <p> Trạng thái:
                                        <span className={selectedLed.current_state > 0 ? 'text-success' : 'text-danger'}>
                                            {selectedLed.current_state > 0 ? 'Đang bật' : 'Đang tắt'}
                                        </span>
                                    </p>
                                )
                            }
                        </div>
                        <div className='row justify-content-around mt-3'>
                            {
                                selectedLed ? (
                                    selectedLed.current_state > 0 ? (
                                        <button className='col-4 border border-primary rounded text-center'
                                            onClick={() => handleOffDevice('led')}>Tắt</button>
                                    ) : (
                                        <button className='col-4 border border-primary rounded text-center'
                                            onClick={() => handleOnDevice('led')}>Bật</button>

                                    )
                                ) : (null)
                            }
                        </div>
                    </div>

                    <div className='col-3 bg-white rounded p-2 m-2'>
                        <div className='text-center'>
                            <h5>Máy bơm</h5>
                        </div>
                        <div className='text-center'>
                            <i class="bi bi-droplet-fill" style={{ fontSize: '80px' }}></i>
                        </div>
                        <div className='justify-content-around mt-2 text-center'>
                            <select id='pump' className='border border-primary rounded text-center'
                                onChange={handlePumpChange}>
                                <option value=''>Chọn thiết bị</option>
                                {pumps.map(pump => <option value={pump.feed_key} key={pump.feed_key}>{pump.name}</option>)}
                            </select>
                            {
                                selectedPump && (
                                    <p> Trạng thái:
                                        <span className={selectedPump.current_state > 0 ? 'text-success' : 'text-danger'}>
                                            {selectedPump.current_state > 0 ? 'Đang bật' : 'Đang tắt'}
                                        </span>
                                    </p>
                                )
                            }
                        </div>
                        <div className='row justify-content-around mt-3'>
                            {
                                selectedPump ? (
                                    selectedPump.current_state > 0 ? (
                                        <button className='col-4 border border-primary rounded text-center'
                                            onClick={() => handleOffDevice('pump')}>Tắt</button>
                                    ) : (
                                        <button className='col-4 border border-primary rounded text-center'
                                            onClick={() => handleOnDevice('pump')}>Bật</button>

                                    )
                                ) : (null)
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={modalIsOpen} className={styles.modal}
                contentLabel='Thông báo' appElement={document.getElementById('root')}>
                <div className={styles.modalContent}>{modalContent}</div>
                <div className={styles.buttonList}>
                    <button onClick={() => {
                        setModalIsOpen(false)
                        setModalContent('')
                    }}
                        className='btn btn-primary'>Đóng</button>
                </div>
            </Modal>
        </div>
    )
}
