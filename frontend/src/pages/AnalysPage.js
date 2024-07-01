import React from 'react';
import { useUser } from '../components/UserContext';
import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export default function AnalysPage() {
    const [base64Image, setBase64Image] = useState('');
    const { adafruitInfo, loggedIn } = useUser();
    const [result, setResult] = useState('');
    const [analysisTime, setAnalysisTime] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loggedIn) {
            navigate('/');
        }
        const socket = socketIOClient('http://localhost:3001', {
            query: adafruitInfo
        });

        socket.on('updateImage', (data, update_at) => {
            setBase64Image(data);
            const time = moment(update_at).locale('vi').utcOffset(7).format('DD/MM/YYYY HH:mm:ss');
            setAnalysisTime(time);
        });

        socket.on('updateResult', (data) => {
            setResult(data);
        });

        return () => {
            socket.off('updateImage');
            socket.off('updateResult')
            socket.disconnect();
        }
    }, [loggedIn]);

    const getImage = async () => {
        await axios.post('http://localhost:3001/api/getImage', adafruitInfo).then(
            response => {
                setBase64Image(response.data);
            }
        ).catch(error => {
            console.log(error);
        });
    }

    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded justify-content-around'>
                <div className='row justify-content-evenly'>
                    <div className='col-3 bg-white rounded p-2 m-5'>
                        <div className='text-center'>
                            <img src={base64Image === '' ? 'https://via.placeholder.com/224' : `data:image/jpeg;base64,${base64Image}`}
                                alt='plant'
                                style={{ width: '224px', height: '224px' }} />
                        </div>
                    </div>

                    {/* <div className='col-3 bg-white rounded p-2 m-5'>
                        <div className='text-center'>
                            <h5>Dự đoán</h5>
                        </div>
                        <div className='text-center'>
                            <button className='btn btn-outline-primary' onClick={getImage}>
                                <i class="bi bi-arrow-right-square" style={{ fontSize: '40px' }}></i>
                            </button>
                        </div>
                    </div> */}
                </div>

                <div className='mt-3'>
                    <h3>Kết quả dự đoán</h3>
                </div>
                <div className='row mt-5 justify-content-evenly'>
                    <div className='col-lg-6 bg-white justify-content-evenly rounded pt-3 pb-3'>
                        <div className='text-center'>
                            <h6>Thời gian: {analysisTime}</h6>
                            <h4>Kết quả: {result}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
