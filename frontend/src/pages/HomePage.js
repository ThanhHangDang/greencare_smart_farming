import React from 'react';
import LineChart from '../components/LineChart.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/BackgroundPage.css';
import { useState, useEffect } from 'react';
import { useUser } from '../components/UserContext.js';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';
import axios from 'axios';
import '../styles/HomePage.css';
import socketIOClient from 'socket.io-client';

export default function HomePage() {

    const [temp, setTemp] = useState({});
    const [light, setLight] = useState({});
    const [humidity, setHumidity] = useState({});
    const [sm, setSm] = useState({});
    const navigate = useNavigate();
    const { loggedIn, adafruitInfo, username, threshold } = useUser();
    const [dataType, setDataType] = useState('temperature');
    const [avgDatas, setAvgDatas] = useState([{}]);
    const [overTemp, setOverTemp] = useState(false);
    const [lowerLight, setLowerLight] = useState(false);
    const [lowerSm, setLowerSm] = useState(false);

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        const socket = socketIOClient('http://localhost:3001', {
            query: adafruitInfo
        });
        
        socket.on('updateDataNow', (feed_key, last_value, updated_at) => {
            if (feed_key === 'temp') {
                setTemp(prev => ({ ...prev, 'value': last_value, 'created_at': updated_at}));
            } else if (feed_key === 'light') {
                setLight(prev => ({ ...prev, 'value': last_value, 'created_at': updated_at}));
            }
            else if (feed_key === 'humidity') {
                setHumidity(prev => ({ ...prev, 'value': last_value, 'created_at': updated_at}));
            }
            else if (feed_key === 'sm') {
                setSm(prev => ({ ...prev, 'value': last_value, 'created_at': updated_at}));
            }
        });
        return () => {
            socket.off('updateDataNow');
            socket.disconnect();
        };
    }, [loggedIn, adafruitInfo]);


    const getAvgDatas = async (apiEndpoint) => {
        const response = await axios.post(apiEndpoint, { username: username });
        const data = await response.data;
        return data;
    }

    const getDataNow = async (apiEndpoint) => {
        const response = await axios.post(apiEndpoint, adafruitInfo);
        const data = await response.data;
        return data;
    }

    useEffect(() => {
        if (!loggedIn) {
            navigate('/');
        }
    }, [loggedIn, navigate]);

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        getDataNow('http://localhost:3001/api/getDataNow').then(data => {
            setTemp(data[0]);
            setLight(data[1]);
            setHumidity(data[2]);
            setSm(data[3]);
        }).catch(er => console.log(er));
    }, [loggedIn]);

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        getAvgDatas('http://localhost:3001/api/getAvgDateLastest1Day').then(data => {
            setAvgDatas(data);
        }).catch(er => console.log(er));
    }, [loggedIn]);

    useEffect(() => {
        if (temp['value'] && threshold[0]) {
            if (temp['value'] > threshold[0].value) {
                setOverTemp(true);
            } else {
                setOverTemp(false);
            }
        }
    }, [temp, threshold]);

    useEffect(() => {
        if (light['value'] && threshold[1]) {
            if (light['value'] < threshold[1].value) {
                setLowerLight(true);
            } else {
                setLowerLight(false);
            }
        }
    }, [light, threshold]);
    useEffect(() => {
        if (sm['value'] && threshold[2]) {
            if (sm['value'] < threshold[2].value) {
                setLowerSm(true);
            } else {
                setLowerSm(false);
            }
        }
    }, [sm, threshold]);

    return (
        <div className='row min-vh-100'>
            <div className='col-9 back_ground rounded '>
                <div className='row justify-content-around '>
                    <div className='col-8 bg-white rounded m-2 p-2'>

                        <div className='text-center'>
                            <h5>Số liệu trung bình</h5>
                            <p>{moment(temp['created_at']).locale('vi').utcOffset(7).format('DD/MM/YYYY')}</p>
                        </div>
                        <div className='row'>
                            <div className='col-6 pl-2'>
                                <div><i className="fs-4 bi-thermometer-sun text-danger" />&nbsp;&nbsp;&nbsp;&nbsp;Nhiệt độ &nbsp;&nbsp;&nbsp;&nbsp; {avgDatas[0][0] ? `${avgDatas[0][0]['avg_temperature'].toFixed(2)} °C` : 'unknow'}</div>
                                <div><i className="fs-4 bi-moisture" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm khí &nbsp;&nbsp;&nbsp;&nbsp; {avgDatas[0][0] ? `${avgDatas[0][0]['avg_humidity'].toFixed(2)} %` : 'unknow'}</div>
                            </div>
                            <div className='col-6'>
                                <div> <i className="fs-4 bi-brightness-high text-warning" />&nbsp;&nbsp;&nbsp;&nbsp;Ánh sáng &nbsp;&nbsp;&nbsp;&nbsp; {avgDatas[0][0] ? `${avgDatas[0][0]['avg_light_intensity'].toFixed(2)} lux` : 'unknow'}</div>
                                <div> <i className="fs-4 bi-water text-secondary" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm đất &nbsp;&nbsp;&nbsp;&nbsp; {avgDatas[0][0] ? `${avgDatas[0][0]['avg_soil_moisture'].toFixed(2)} %` : 'unknow'}</div>
                            </div>
                        </div>

                    </div>

                    <div className='col-3 text-center bg-white rounded m-2 p-2'>
                        <h5>Tình trạng</h5>
                        { !(overTemp || lowerLight || lowerSm) ? <p className='text-success'>Tình trạng bình thường</p> : null}
                        {overTemp ? <p className='pt-3 text-danger'>Nhiệt độ quá cao</p> : null}
                        {lowerLight ? <p className='pt-3 text-danger'>Ánh sáng quá thấp</p> : null}
                        {lowerSm ? <p className='pt-3 text-danger'>Độ ẩm đất quá thấp</p> : null}
                    </div>
                </div>


                <div className='bg-white m-2 rounded'>
                    <div className='row'>
                        <div className='col-3 m-2'><h5>Thống kê</h5></div>
                        <div className='row col-lg-8 rounded border border-dark m-1'>
                            <div className={
                                dataType === 'temperature' ? 'col-lg-3 select-type selected' : 'col-lg-3 select-type'
                            } onClick={() => setDataType('temperature')}>
                                Nhiệt độ
                            </div>
                            <div className={
                                dataType === 'light_intensity' ? 'col-lg-3 select-type selected' : 'col-lg-3 select-type'
                            } onClick={() => setDataType('light_intensity')}>
                                Ánh sáng
                            </div>
                            <div className={
                                dataType === 'humidity' ? 'col-lg-3 select-type selected' : 'col-lg-3 select-type'
                            } onClick={() => setDataType('humidity')}>
                                Ẩm khí
                            </div>
                            <div className={
                                dataType === 'soil_moisture' ? 'col-lg-3 select-type selected' : 'col-lg-3 select-type'
                            } onClick={() => setDataType('soil_moisture')}>
                                Ẩm đất
                            </div>
                        </div>
                    </div>
                    <div className='row col-8 float-end m-3'>
                        {dataType === 'temperature' ? <div className='row'>Giá trị nhiệt độ trong 7 ngày gần nhất (°C)</div> : null}
                        {dataType === 'light_intensity' ? <div className='row'>Giá trị ánh sáng trong 7 ngày gần nhất (lux)</div> : null}
                        {dataType === 'humidity' ? <div className='row'>Giá trị ẩm khí trong 7 ngày gần nhất (%)</div> : null}
                        {dataType === 'soil_moisture' ? <div className='row'>Giá trị ẩm đất trong 7 ngày gần nhất (%)</div> : null}
                    </div>
                    <LineChart dataType={dataType} />
                </div>



            </div>
            <div className='col-2 rounded back_ground' style={{ marginLeft: '20px' }}>
                <div className='text-center pt-2'>
                    <h5>Chỉ số hiện tại</h5>
                    <p>{moment(temp['created_at']).locale('vi').utcOffset(7).format('DD/MM/YYYY HH:mm:ss')}</p>
                </div>
                <div className='pt-3'>
                    <div>
                        <i className="fs-4 bi-thermometer-sun text-danger" /><span className="ms-1 d-none d-sm-inline">&nbsp;&nbsp;&nbsp;&nbsp;Nhiệt độ &nbsp;&nbsp;&nbsp; {temp ? `${temp['value']} °C` : 'unknow'}</span>
                    </div>
                    <div>
                        <i className="fs-4 bi-brightness-high text-warning" /><span className="ms-1 d-none d-sm-inline">&nbsp;&nbsp;&nbsp;&nbsp;Ánh sáng &nbsp;&nbsp;&nbsp;&nbsp; {light ? `${light['value']} lux` : 'unknow'}</span>
                    </div>
                    <div>
                        <i className="fs-4 bi-moisture" /><span className="ms-1 d-none d-sm-inline">&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm không khí &nbsp;&nbsp;&nbsp;&nbsp; {humidity ? `${humidity['value']} %` : 'unknow'}</span>
                    </div>
                    <div>
                        <i className="fs-4 bi-water text-secondary" /><span className="ms-1 d-none d-sm-inline ">&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm đất &nbsp;&nbsp;&nbsp;&nbsp; {sm ? `${sm['value']} %` : 'unknow'}</span>
                    </div>
                </div>
            </div>
        </div >
    )
}
