import React from 'react';
import '../styles/Dangky.css';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dangky() {
    const [signupInfo, setSignupInfo] = useState({
        username: '',
        password: '',
        rePassword: '',
        phone: ''
    });
    const navigate = useNavigate();

    const signupRequest = async (apiEndPoint) => {
        const response = await axios.post(apiEndPoint, signupInfo);
        if (response.status === 200) {
            window.alert('Đăng ký thành công');
            navigate('/');
        } else {
            window.alert('Đăng ký thất bại');
        }
    }

    const handleChange = e => {
        setSignupInfo({
            ...signupInfo,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = e => {
        e.preventDefault();
        signupRequest('http://localhost:3001/api/signup');
    }

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <p className="signup-form-title">ĐĂNG KÝ TÀI KHOẢN</p>
                <input type="text" placeholder="Tên đăng nhập"
                    className="signup-form-input" name="username"
                    onChange={handleChange}></input>
                <input type="text" placeholder="Nhập mật khẩu"
                    className="signup-form-input" name="password"
                    onChange={handleChange}></input>
                <input type="text" placeholder="Nhập lại mật khẩu"
                    className="signup-form-input" name="rePassword"
                    onChange={handleChange}></input>
                {
                    signupInfo.password !== signupInfo.rePassword && signupInfo.rePassword !== '' ?
                        <p className="signup-form-error">Mật khẩu không khớp</p> : ''
                }
                <input type="tel" placeholder="Nhập số điện thoại"
                    className="signup-form-input" name="phone"
                    onChange={handleChange}></input>
                <button type="submit" className="signup-form-button"
                    disabled={signupInfo.password !== signupInfo.rePassword && signupInfo.rePassword !== ''}>Tạo tài khoản</button>
                <p className="goto-login">Bạn đã có tài khoản?<NavLink to='/'> Hãy đăng nhập ngay</NavLink></p>
            </form>
            <div className="signup-title">
                <p>Greencare</p>
                <p>Smart</p>
                <p>Farming</p>
                <p>System</p>
            </div>
        </div>
    )
}
export default Dangky;