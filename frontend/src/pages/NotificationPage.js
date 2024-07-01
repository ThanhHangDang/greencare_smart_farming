import React from 'react'

export default function NotificationPage() {
    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded'>
                <div className='container mt-5'>
                    <div className='mt-3'>
                        <h3>Bảng các thông báo</h3>
                    </div>
                    <table class="table table-bordered table-hover text-center">
                        <thead className='table-secondary'>
                            <tr>
                                <th scope="col bg-secondary">STT</th>
                                <th scope="col">Nội dung</th>
                                <th scope="col">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td className='text-start'>aaaa Mức nước hệ thống tưới cây đã giảm xuống dưới ngưỡng cho phép.</td>
                                <td>
                                    <button className='btn btn-danger'>Xóa</button>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td className='text-start'> Mức nước hệ thống tưới cây đã giảm xuống dưới ngưỡng cho phép.</td>
                                <td>
                                    <button className='btn btn-danger'>Xóa</button>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td className='text-start'> Mức nước hệ thống tưới cây đã giảm xuống dưới ngưỡng cho phép.</td>
                                <td>
                                    <button className='btn btn-danger'>Xóa</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
