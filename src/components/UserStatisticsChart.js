import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserStatisticsChart = ({ userData }) => {
    const data = {
        labels: userData.map(user => user.index),
        datasets: [
            {
                label: 'Gems',
                data: userData.map(user => user.gems),
                backgroundColor: '#FFFFFF',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allow the chart to fill the container
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#FFFFFF',
                },
            },
            title: {
                display: true,
                text: 'User Statistics',
                color: '#FFFFFF',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#FFFFFF',
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    color: '#FFFFFF',
                },
                grid: {
                    color: '#444444',
                },
            },
        },
    };

    return (
        <div> {/* Adjust the height and width here */}
            <Bar data={data} options={options} />
        </div>
    );
};

export default UserStatisticsChart;
