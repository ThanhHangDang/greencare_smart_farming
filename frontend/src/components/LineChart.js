import React, {useEffect, useState} from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as Chartjs,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
} from 'chart.js';
import { useUser } from './UserContext';
import axios from 'axios';
import moment from 'moment';
Chartjs.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
)    

export default function LineChart(pros) {
    const {username} = useUser();
    const dataType = pros.dataType;
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const getAvgDataPast7Days = async (apiEndPoint, endDate) => {
        const response = await axios.post(apiEndPoint, {username, dataType, endDate});
        const data = await response.data;
        return data;
    }
    useEffect(() => {
        // const endDate = '2024-04-12'
        const endDate = moment().locale('vi').utcOffset(7).format('YYYY-MM-DD');
        getAvgDataPast7Days('http://localhost:3001/api/getAvgDataPast7Days', endDate).then(data => {
            const datas = [];
            const labels = [];
            data[0].map(item => {
                datas.push(item['avg_value']);
                labels.push(moment(item['date']).format('DD/MM/YYYY'));
            });
            setChartData({
                labels: labels,
                datasets: [{
                    label: dataType,
                    data: datas,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            });
        });
    }, [dataType]);
    // const [data, setData] = useState( {
    //     data: {
    //         labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    //         datasets: [{
    //             label: 'Doanh thu',
    //             data: [1200, 1500, 900, 1800, 2000],
    //             backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //             borderColor: 'rgba(75, 192, 192, 1)',
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {}
    // })

   
    return (
        <div>
            <Line data={chartData} />
        </div>
    )
}
