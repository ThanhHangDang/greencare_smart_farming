import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/BackgroundPage.css';

export default function Sidebar() {
    return (
        <div>
            <div className="container-fluid">
                <div className="row flex-nowrap">
                    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 rounded m-3 back_ground">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
                            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                                <li className="nav-item">
                                    <NavLink exact activeClassName="active" to="/homepage" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-house" /> <span className="ms-1 d-none d-sm-inline">Trang Chủ</span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink activeClassName="active" to="/info" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-people" /> <span className="ms-1 d-none d-sm-inline">Thông tin tài khoản</span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink activeClassName="active" to="/control" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-grid" /> <span className="ms-1 d-none d-sm-inline">Điều khiển thiết bị</span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink activeClassName="active" to="/history" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-clock-history" /> <span className="ms-1 d-none d-sm-inline">Lịch sử tưới nước</span>
                                    </NavLink>
                                </li>
                                {/* <li className="nav-item">
                                    <NavLink activeClassName="active" to="/forecast" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-broadcast-pin" /> <span className="ms-1 d-none d-sm-inline">Dự đoán tưới nước</span>
                                    </NavLink>
                                </li> */}
                                <li className="nav-item">
                                    <NavLink activeClassName="active" to="/analys" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-graph-up" /> <span className="ms-1 d-none d-sm-inline">Phân tích bệnh cây</span>
                                    </NavLink>
                                </li>
                                {/* <li className="nav-item">
                                    <NavLink activeClassName="active" to="/feedback" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-mailbox" /> <span className="ms-1 d-none d-sm-inline">Đóng góp ý kiến</span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink activeClassName="active" to="/notification" className="nav-link align-middle px-0 text-dark">
                                        <i className="fs-4 bi-bell" /> <span className="ms-1 d-none d-sm-inline">Các thông báo</span>
                                    </NavLink>
                                </li> */}

                                <hr />
                                <div className="dropdown pb-4">
                                    <a href="#a" className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bs4 bi-box-arrow-left"></i>
                                        <span className="d-none d-sm-inline mx-1">Sign Out</span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                                        <li><NavLink className="dropdown-item" to="/info">Thông tin tài khoản</NavLink></li>
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                        <li><NavLink className="dropdown-item" to="/">Đăng xuất</NavLink></li>
                                    </ul>
                                </div>

                            </ul>

                        </div>
                    </div>
                    <div className="col py-3 rounded">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>

    )
}
