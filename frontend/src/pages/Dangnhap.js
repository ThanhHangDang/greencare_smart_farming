import styles from '../styles/Dangnhap.module.css'
import {useState} from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import Modal from 'react-modal'

function Dangnhap() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const {handleLogin} = useUser()

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handelLoginRequest = async (apiEndPoint) => {
        const response = await axios.post(apiEndPoint, formData)
        if (response.status === 200) {
            console.log('Login success')
            handleLogin(response.data.username, response.data.adafruitInfo)
            navigate('/homepage')
        } else {
            console.log('Login failed')
            setIsModalOpen(true)
        }
    }
    const handleSubmit = e => {
        e.preventDefault()
        handelLoginRequest('http://localhost:3001/api/authenticate')
    }
    const closeModal = () => {
        setIsModalOpen(false)
    }
    return (
        <div className={styles.loginContainer}>
            <p className={styles.loginTitle}>Greencare Smart Farming System</p>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <p className={styles.loginFormTitle}>Đăng nhập</p>
                <input type='text' placeholder='Tên đăng nhập' 
                className={styles.loginFormInput} onChange={handleChange}
                name="username"></input>
                <input type='password' placeholder='Nhập mật khẩu' 
                className={styles.loginFormInput} onChange={handleChange}
                name="password"></input>
                <button type="submit" className='login-form-button'>Đăng nhập</button>
                <p className={styles.gotoSignup} >Bạn chưa có tài khoản? <NavLink to='/signup'>Xin mời đăng ký</NavLink></p>
            </form>
            <Modal className={styles.modal}
            isOpen={isModalOpen}
            onRequestClose={closeModal}contentLabel='Thông báo'
            appElement={document.getElementById('root')}>
                <p>Đăng nhập thất bại</p>
                <button onClick={closeModal}>Đóng</button>
            </Modal>
        </div>
    )
}
export default Dangnhap;