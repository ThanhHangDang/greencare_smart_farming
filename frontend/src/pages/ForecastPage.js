import React from 'react';

export default function ForecastPage() {
    return (
        <div className='row min-vh-100 ml-5'>
            <div className='col-11 back_ground rounded justify-content-around' >
                <div className='row justify-content-evenly'>
                    <div className='col-5 bg-white rounded p-2 m-3'>
                        <div className='text-center'>
                            <h5>Số liệu trung bình</h5>
                            <p>17/03/2024</p>
                        </div>
                        <div className='row'>
                            <div className='col-6 pl-2'>
                                <div><i class="fs-4 bi-thermometer-sun text-danger" />&nbsp;&nbsp;&nbsp;&nbsp;Nhiệt độ &nbsp;&nbsp;&nbsp;&nbsp; 26.7</div>
                                <div><i class="fs-4 bi-moisture" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm khí &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                            </div>
                            <div className='col-6'>
                                <div> <i class="fs-4 bi-brightness-high text-warning" />&nbsp;&nbsp;&nbsp;&nbsp;Ánh sáng &nbsp;&nbsp;&nbsp;&nbsp; 42%</div>
                                <div> <i class="fs-4 bi-water text-secondary" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm đất &nbsp;&nbsp;&nbsp;&nbsp; 62%</div>
                            </div>
                        </div>

                    </div>

                    <div className='col-5 bg-white rounded p-2 m-3'>

                        <div className='text-center'>
                            <h5>Lần tưới nước gần nhất</h5>
                            <p>17/03/2024</p>
                        </div>
                        <div className='row'>
                            <div className='col-6 pl-2'>
                                <div><i class="fs-4 bi-thermometer-sun text-danger" />&nbsp;&nbsp;&nbsp;&nbsp;Nhiệt độ &nbsp;&nbsp;&nbsp;&nbsp; 26.7</div>
                                <div><i class="fs-4 bi-moisture" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm khí &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                                <div><i class="fs-4 bi-droplet-half" />&nbsp;&nbsp;&nbsp;&nbsp;Lượng nước &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                            </div>
                            <div className='col-6'>
                                <div> <i class="fs-4 bi-brightness-high text-warning" />&nbsp;&nbsp;&nbsp;&nbsp;Ánh sáng &nbsp;&nbsp;&nbsp;&nbsp; 42%</div>
                                <div> <i class="fs-4 bi-water text-secondary" />&nbsp;&nbsp;&nbsp;&nbsp;Độ ẩm đất &nbsp;&nbsp;&nbsp;&nbsp; 62%</div>
                                <div><i class="fs-4 bi-alarm" />&nbsp;&nbsp;&nbsp;&nbsp;Thời gian &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                            </div>
                        </div>
                    </div>

                    <div className='col-3 bg-white rounded text-center mt-3'>
                        <h3 className='pt-3'>Dự đoán tưới nước</h3>
                        <h1><i class="fs-1 bi-arrow-right-circle " /></h1>

                    </div>
                </div>

                <div className='mt-3'>
                    <h3>Kết quả dự đoán</h3>
                </div>
                <div className='row mt-3 justify-content-evenly'>
                    <div className='col-lg-6 bg-white justify-content-evenly rounded pt-3 pb-3'>
                        <div className='text-center'>
                            <h5>Cây của bạn cần tưới nước</h5>
                            <p>17/03/2024</p>
                        </div>
                        <div className='row'>
                            <div className='col-6 pl-2'>
                                <div><i class="fs-4 bi-droplet-half" />&nbsp;&nbsp;&nbsp;&nbsp;Lượng nước &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                            </div>
                            <div className='col-6'>
                                <div><i class="fs-4 bi-alarm" />&nbsp;&nbsp;&nbsp;&nbsp;Thời gian &nbsp;&nbsp;&nbsp;&nbsp; 75%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
