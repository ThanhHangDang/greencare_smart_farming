import React from 'react'
import { useEffect, useState} from 'react'
import {useUser} from '../components/UserContext'
import axios from 'axios'
import moment from 'moment'
import Modal from 'react-modal'
import styles from '../styles/InfoPage.module.css'
import socketIOClient from 'socket.io-client';

export default function HistoryPage() {
    const [history, setHistory] = useState([])
    const {username, loggedIn, adafruitInfo} = useUser()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [feed_key, setFeed_key] = useState('')
    const [start_time, setStart_time] = useState('')

    const openModal = (feed_key, start_time) => {
        setModalIsOpen(true)
        setFeed_key(feed_key)
        setStart_time(start_time)
    }
    const closeModal = () => {
        setModalIsOpen(false)
        setFeed_key('')
        setStart_time('')
    }
    const searchHandler = (e) => {
        let keyword = e.target.value
        let date = keyword.split(' ')[0]
        let time = keyword.split(' ')[1] ??= ''
        date = date.split('/').reverse().join('-')
        keyword = date + ' ' + time
        keyword = keyword.trim()
        getPumpLog('http://localhost:3001/api/getPumpLog', keyword)
    }
    console.log(history)
    const getPumpLog = async (apiEndpoint, searchTerm) => {
        const response = await axios.post(apiEndpoint, {username: username, searchTerm: searchTerm})
        const data = response.data
        data.forEach(item => {
            item.start_time = moment(item.start_time).locale('vi').utcOffset(7).format('DD/MM/YYYY HH:mm:ss')
            if (item.interval_time === null) {
                return
            }
            const minute = Math.floor(item.interval_time / 60)
            if (minute === 0) {
                item.interval_time = `${item.interval_time} giây`
            } else {
                const sec = item.interval_time - minute * 60
                if (sec === 0) {
                    item.interval_time = `${minute} phút`
                } else {
                item.interval_time = `${minute} phút ${sec} giây`
                }
            }
        })
        setHistory(data)
    }
    const deleteHandler = async () => {
        let fk = feed_key
        let st = start_time
        const apiEndpoint = 'http://localhost:3001/api/deletePumpLog'
        st = moment(st, 'DD/MM/YYYY HH:mm:ss').utcOffset(7).format('YYYY-MM-DD HH:mm:ss')
        const response = await axios.post(apiEndpoint, { feed_key: fk, start_time: st})
        if (response.status === 200) {
            const newHistory = history.filter(item => {
                return !(item.feed_key === fk && item.start_time === start_time)
            })
            setHistory(newHistory)
            closeModal()
        }
    }

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        const apiEndpoint = 'http://localhost:3001/api/getPumpLog'
        getPumpLog(apiEndpoint, '')

        const socket = socketIOClient('http://localhost:3001', {
            query: adafruitInfo
        });

        socket.on("updateStateDevice", data => {
            getPumpLog(apiEndpoint, '')
        })

        return () => {
            socket.off('updateStateDevice')
            socket.disconnect()
        }
    }, [loggedIn])

    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded'>
                <div className='container mt-5'>
                    <div className='mt-3'>
                        <h3>Lịch sử tưới nước</h3>
                    </div>
                    <div className='mt-3 mb-3 border border-1 border-dark'>
                        <input type='text' className='form-control' placeholder='Tìm kiếm'
                        onChange={searchHandler}></input>
                    </div>
                    <table class="table table-bordered table-hover text-center">
                        <thead className='table-secondary'>
                            <tr>
                                <th scope="col bg-secondary">STT</th>
                                <th scope="col">Tên thiết bị</th>
                                <th scope="col">Thời điểm tưới</th>
                                <th scope="col">Thời gian tưới</th>
                                <th scope="col">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, index) => {
                                return (
                                    <tr key = {index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{item.name}</td>
                                        <td>{item.start_time}</td>
                                        <td>{item.interval_time !== null ? item.interval_time : 'Vẫn đang tưới'}</td>
                                        <td>
                                            <button className='btn btn-danger'
                                            onClick={() => openModal(item.feed_key, item.start_time)}>Xóa</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <Modal
                    className={styles.modal}
                    isOpen={modalIsOpen}
                    contentLabel='Thông báo'
                    appElement={document.getElementById('root')}
                >
                    <div className={styles.modalContent}>Bạn có muốn xóa lịch sử này không?</div>
                    <div className={styles.buttonList}>
                        <button onClick={deleteHandler}
                            className = 'btn btn-danger'>Xóa
                        </button>
                        <button onClick={closeModal}
                            className='btn btn-primary'>Đóng
                        </button>
                    </div>
                </Modal>                
            </div>
        </div>
    )
}
