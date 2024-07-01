import React from 'react'
import { useState, useEffect } from 'react'
import { useUser } from '../components/UserContext.js'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Modal from 'react-modal'
import styles from '../styles/InfoPage.module.css'

export default function InfoPage() {

    const { loggedIn, username } = useUser();
    const [userInfo, setUserInfo] = useState({});
    const navigate = useNavigate();
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [adafruitKey, setAdafruitKey] = useState('');
    const [password, setPassword] = useState('');

    const getUserInfo = async () => {
        const response = await axios.post('http://localhost:3001/api/getUserInfo', { username });
        const data = await response.data;
        data.map((item) => {
            setUserInfo({
                password: item.password,
                email: item.email,
                phone: item.phone,
                address: item.address
            })
        })
    }
    const handleSubmit = async (e) => {
        console.log('Submit');
        e.preventDefault();
        const response = await axios.post('http://localhost:3001/api/updateUserInfo', { username, userInfo });
        console.log(response.status)
        if (response.status == 200) {
            console.log('Update success');
            setIsVerifyModalOpen(false);
            setIsResponseModalOpen(true);
            setResponseMessage('Cập nhật thông tin thành công');
        } else {
            console.log('Update failed');
            setIsVerifyModalOpen(false);
            setIsResponseModalOpen(true);
            setResponseMessage('Cập nhật thông tin thất bại');
        }
    }
    const handleChange = e => {
        setUserInfo({
            ...userInfo,
            [e.target.name]: e.target.value
        })
    }
    const closeModal = () => {
        setIsVerifyModalOpen(false);
    }
    const handleChangeIoKey = async (adafruitKey, password) => {
        console.log(username, adafruitKey, password)
        const response = await axios.post('http://localhost:3001/api/changeIOKey', { username, adafruitKey, password });
        if (response.status == 200) {
            console.log('Change IO Key success');
            setIsResponseModalOpen(true);
            setResponseMessage('Đổi IO Key thành công');
            setShowForm(false);
        } else {
            console.log('Change IO Key failed');
            setIsResponseModalOpen(true);
            setResponseMessage('Mật khẩu không đúng');
            setShowForm(false);
        }
    }
    const closeChangeIOKeyForm = () => {
        setShowForm(false);
    }
    useEffect(() => {
        if (!loggedIn) {
            navigate('/');
            return;
        }
    }, [loggedIn, navigate]);

    useEffect(() => {
        if (!loggedIn) {
            return;
        }
        getUserInfo();
    }, []);
    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded'>
                <div className="container mt-5">
                    <div className="main-body ">
                        <div className="row justify-content-center">
                            <div className="col-lg-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex flex-column align-items-center text-center">
                                            <img src="https://bootdey.com/img/Content/avatar/avatar6.png" alt="Admin" className="rounded-circle p-1 bg-primary" width={110} />
                                            <div className="mt-3">
                                                <h4>{username}</h4>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-9 mt-2">
                                <div className="card">
                                    <form className="card-body">
                                        <div className="row mb-3">
                                            <div className="col-sm-3">
                                                <h6 className="mb-0">Mật khẩu</h6>
                                            </div>
                                            <div className="col-sm-9 text-secondary">
                                                <input type="password" className="form-control"
                                                    defaultValue={userInfo['password'] === undefined ? '' : userInfo['password']}
                                                    onChange={handleChange} name='password'
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-sm-3">
                                                <h6 className="mb-0">Email</h6>
                                            </div>
                                            <div className="col-sm-9 text-secondary">
                                                <input type="email" className="form-control"
                                                    defaultValue={
                                                        userInfo['email'] === undefined ? '' : userInfo['email']
                                                    }
                                                    onChange={handleChange} name='email' />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-sm-3">
                                                <h6 className="mb-0">Số điện thoại</h6>
                                            </div>
                                            <div className="col-sm-9 text-secondary">
                                                <input type="text" className="form-control"
                                                    defaultValue={
                                                        userInfo['phone'] === undefined ? '' : userInfo['phone']
                                                    }
                                                    onChange={handleChange} name='phone' />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-sm-3">
                                                <h6 className="mb-0">Địa chỉ</h6>
                                            </div>
                                            <div className="col-sm-9 text-secondary">
                                                <input type="text" className="form-control"
                                                    defaultValue={
                                                        userInfo['address'] === undefined ? '' : userInfo['address']
                                                    }
                                                    onChange={handleChange} name='address' />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3" />
                                            <div className="col-sm-9 text-secondary">
                                                <div className="row">
                                                    <div className="col">
                                                        <button onClick={e => {
                                                            e.preventDefault();
                                                            setIsVerifyModalOpen(true)
                                                        }}
                                                            className="btn btn-primary px-4 mr-2"
                                                        >Lưu thay đổi</button>
                                                    </div>
                                                    <div className="col">
                                                        <button
                                                            className="btn btn-primary px-4 mr-2"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                setShowForm(true);
                                                            }}>
                                                            Đổi IO_Key
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <Modal
                                        className={styles.modal}
                                        isOpen={isVerifyModalOpen}
                                        onRequestClose={closeModal}
                                        contentLabel='Thông báo'
                                        appElement={document.getElementById('root')}
                                    >
                                        <div className={styles.modalContent}>Bạn chắc chắn lưu các thay đổi?</div>
                                        <div className={styles.buttonList}>
                                            <button onClick={handleSubmit} className='btn btn-primary'>Xác nhận</button>
                                            <button onClick={closeModal} className='btn btn-primary'>Hủy bỏ</button>
                                        </div>
                                    </Modal>
                                    <Modal
                                        className={styles.modal}
                                        isOpen={isResponseModalOpen}
                                        contentLabel='Thông báo'
                                        appElement={document.getElementById('root')}
                                    >
                                        <div className={styles.modalContent}>{responseMessage}</div>
                                        <div className={styles.buttonList}>
                                            <button onClick={() => {
                                                setIsResponseModalOpen(false);
                                                setResponseMessage('');
                                            }}
                                                className='btn btn-primary'>Đóng</button>
                                        </div>
                                    </Modal>
                                    <Modal className={styles.formChangeIoKey}
                                        isOpen={showForm}
                                        contentLabel='Đổi IO Key'
                                        appElement={document.getElementById('root')}
                                    >
                                        <div className={styles.modalContent}>
                                        <label htmlFor="ioKeyInput" className="form-label">IO Key mới</label>
                                            <input type='password' placeholder='Nhập IO Key mới' autoComplete="new-password"
                                                className={styles.input} onChange={e => setAdafruitKey(e.target.value)} />
                                                <label htmlFor="ioKeyInput" className={styles.formChangeIoKeyLabel}>Nhập mật khẩu</label>
                                            <input type='password' placeholder='Nhập mật khẩu' autoComplete="new-password"
                                                className={styles.input} onChange={e => setPassword(e.target.value)} />
                                        </div>
                                        <div className={styles.buttonList}>
                                            <button onClick={() => {
                                                handleChangeIoKey(adafruitKey, password);
                                            }}
                                                className='btn btn-primary'>Xác nhận</button>
                                            <button onClick={closeChangeIOKeyForm}
                                                className='btn btn-primary'>Hủy bỏ</button>
                                        </div>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
