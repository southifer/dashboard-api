import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://135.125.191.88:5000/api/users');
                console.log(response)
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        
        <div className="p-6 bg-mainBg text-white min-h-screen overflow-x-hidden">
            <div className="grid grid-cols-1 gap-6 mb-4">
                <div className="bg-widgetBg p-5 rounded-lg shadow-md">
                    <p className="flex-grow text-xs font-bold text-gray-200 mb-2 uppercase">User Information</p>
                    <p className='text-white'>⌐ bot: x<strong>{users.length}</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Home;