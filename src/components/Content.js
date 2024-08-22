import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useWindowDimensions from './useWindowDimensions'; // Adjust the path if needed
import UserStatisticsChart from './UserStatisticsChart';
import Swal from 'sweetalert2';
import ContextMenu from './ContextMenu'; // Import the ContextMenu component
import { saveAs } from 'file-saver'; // Import file-saver library
import Terminal from './Terminal';


const Content = () => {
    const [users, setUsers] = useState([]);
    const [previousData, setPreviousData] = useState([]);
    const [updatedCells, setUpdatedCells] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const { width } = useWindowDimensions(); // Get the window width
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(100); // Set the number of rows per page
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

    const [searchQueries, setSearchQueries] = useState({
        username: '',
        level: '',
        ping: '',
        status: '',
        rotation_status: '',
        proxy: '',
        world: '',
        position: '',
        gems: '',
        playtime: '',
        online_time: '',
        age: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://93.113.180.31:5000/api/users');
                const newUsers = response.data;
                const newUpdatedCells = new Set();

                newUsers.forEach((user) => {
                    const prevUser = previousData.find(p => p.index === user.index);
                    if (prevUser) {
                        Object.keys(user).forEach(key => {
                            if (prevUser[key] !== user[key]) {
                                newUpdatedCells.add(`${user.index}-${key}`);
                            }
                        });
                    }
                });

                setUpdatedCells(newUpdatedCells);
                setPreviousData(newUsers);
                setUsers(newUsers);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const intervalId = setInterval(() => {
            fetchData();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [previousData]);

    useEffect(() => {
        setSelectAll(users.length > 0 && selectedRows.size === users.length);
    }, [selectedRows, users]);

    const formatNumber = (num) => new Intl.NumberFormat().format(num);

    const handleSelectRow = (index, event) => {
        const isShiftClick = event?.shiftKey; // Optional chaining to avoid errors if event is undefined
    
        if (isShiftClick && lastSelectedIndex !== null) {
            const newSelectedRows = new Set(selectedRows);
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
    
            for (let i = start; i <= end; i++) {
                newSelectedRows.add(i);
            }
    
            setSelectedRows(newSelectedRows);
        } else {
            setSelectedRows(prevSelectedRows => {
                const newSelectedRows = new Set(prevSelectedRows);
                if (newSelectedRows.has(index)) {
                    newSelectedRows.delete(index);
                } else {
                    newSelectedRows.add(index);
                }
                return newSelectedRows;
            });
        }
    
        setLastSelectedIndex(index);
    };
    
    const handleRowClass = (index) => {
        return selectedRows.has(index) ? 'bg-gray-200' : '';
    };
    
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set()); // Deselect all
        } else {
            setSelectedRows(new Set(users.map(user => user.index))); // Select all
        }
        setSelectAll(!selectAll); // Toggle selectAll state
    };

    const OnSelectAll = () => {
        setSelectedRows(new Set(users.map(user => user.index)));  // Select all
    };
    const OnDeselectAll = () => {
        setSelectedRows(new Set()); // Deselect all
    };

    const CustomCheckbox = ({ isChecked, onChange }) => {
        return (
            <div
                className={`relative flex items-center justify-center h-5 w-5 border-2 rounded cursor-pointer ${isChecked ? 'bg-white border-white' : 'bg-[#181A20] border-white'}`}
                onClick={onChange}
            >
                {isChecked && (
                    <svg className="absolute w-3 h-3" fill="none" stroke="black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        );
    };

    const handleSearchChange = (e) => {
        setSearchQueries(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const filterUsers = () => {
        return users.filter(user => {
            return Object.keys(searchQueries).every(key => {
                return searchQueries[key] === '' || user[key].toString().toLowerCase().includes(searchQueries[key].toLowerCase());
            });
        });
    };

    const showAlert = (icon, title, text) => {
        Swal.fire({
        icon,
        title,
        text,
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#404570',
        customClass: {
            popup: 'dark-popup',
            title: 'dark-title',
            content: 'dark-content',
            confirmButton: 'dark-confirm-button',
        },
        });
    };

    const handleRowContextMenu = (e, index) => {
        e.preventDefault();
        setContextMenu({
            position: {x: e.clientX, y: e.clientY},
            index
        })
    };

    const handleDelete = async () => {
        if (selectedRows.size === 0) {
            showAlert('warning', 'No Selection', 'No rows selected!');
            return;
        }

        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: `You are about to delete ${selectedRows.size} row(s)!`,
            showCancelButton: true,
            confirmButtonColor: '#DC3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'dark-popup',
                title: 'dark-title',
                content: 'dark-content',
                confirmButton: 'dark-confirm-button',
            },
        });

        if (confirmation.isConfirmed) {

            try {
                const deleteRequests = Array.from(selectedRows).map(index =>
                    axios.delete(`http://93.113.180.31:5000/api/users/${index}`)
                );
                await Promise.all(deleteRequests);

                setUsers(users.filter(user => !selectedRows.has(user.index)));
                setSelectedRows(new Set());

                showAlert('success', 'Deleted', `${selectedRows.size} row(s) deleted successfully!`);
            } catch (error) {
                console.error('Error deleting selected rows:', error);
                showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete selected rows!');
            }
        }
    };

    const handleExport = async () => {
        if (selectedRows.size === 0) {
            Swal.fire('No Selection', 'No rows selected!', 'warning');
            return;
        }

        const confirmation = await Swal.fire({
            icon: 'info',
            title: 'Are you sure?',
            text: `You are about to export ${selectedRows.size} row(s)!`,
            showCancelButton: true,
            confirmButtonColor: '#DC3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'export',
            cancelButtonText: 'cancel',
        });
    
        if (confirmation.isConfirmed) {
            // Collect data for the selected rows
            const selectedData = users.filter(user => selectedRows.has(user.index));
        
            // Convert the data to a string format suitable for a .txt file
            const dataStr = selectedData.map(user => `${user.username}|${user.age}`).join('\n');
        
            // Create a Blob and use file-saver to save it as a .txt file
            const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, 'export.txt');
        
            Swal.fire('Exported', 'Selected rows have been exported to export.txt', 'success');
        }
    };

    const totalUsers = users.length;
    const totalOnline = users.filter(user => user.status === 'Online').length;
    const totalOffline = users.filter(user => user.status !== 'Online').length;
    const totalBanned = users.filter(user => user.status === 'Account Banned').length;
    const totalGems = users.reduce((acc, user) => acc + user.gems, 0);
    const avgGems = totalUsers > 0 ? (totalGems / totalUsers).toFixed(2) : 0;

    const maxTableWidth = width - 100; // Adjust width with a buffer (e.g., 100px)

    // Pagination calculations
    const filteredUsers = filterUsers();
    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const goToNextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="p-6 bg-mainBg text-white">
            <div className="grid grid-cols-1 mb-4">
                <Terminal></Terminal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-widgetBg p-5 rounded-lg shadow-md">
                    <p className="flex-grow text-xs font-bold text-gray-200 mb-2 uppercase">USER STATISTIC</p>
                    <p className='text-lg'>⌐ Online: {formatNumber(totalOnline)}</p>
                    <p className='text-lg'>⌐ Offline: {formatNumber(totalOffline)}</p>
                    <p className='text-lg'>⌐ Banned: {formatNumber(totalBanned)}</p>
                    <p className='text-lg'>⌐ Gems: {formatNumber(totalGems)}</p>
                    <p className='text-lg'>⌐ Average Gems: {formatNumber(avgGems)}</p>
                </div>
                <div className="bg-widgetBg p-5 rounded-lg shadow-md">
                    <p className="flex-grow text-xs font-bold text-gray-200 mb-2 uppercase">USER CHART</p>
                    <div className="bg-widgetBg p-4 rounded-lg">
                        <UserStatisticsChart userData={users} />
                    </div>
                </div>
            </div>
            
            <div className="bg-widgetBg p-4 rounded-lg shadow-md">
                <div className="max-w-full overflow-x-auto custom-scrollbar" style={{ maxWidth: `${maxTableWidth}px` }}>
                    <div className="sticky top-0 bg-bg-widgetBg p-2" style={{ zIndex: 20, backgroundColor: '#181A20' }}>
                        <p style={{ fontSize: '0.7rem' }}>selected bot <u>x{selectedRows.size}</u></p>
                    </div>
                    <div className="max-w-full max-h-[500px] overflow-x-auto custom-scrollbar" style={{ maxWidth: `${maxTableWidth}px` }}>

                        {contextMenu && (
                            <ContextMenu
                                position={contextMenu.position}
                                onClose={() => setContextMenu(null)}
                                onDelete={handleDelete}
                                onExport={handleExport}
                                onSelectAll={OnSelectAll}
                                onDeselectAll={OnDeselectAll}
                            />
                        )}

                        <table className="min-w-full divide-y divide-gray-700 " style={{ width: '100%' }}>
                            <thead className='border-b-2 border-[#181A20]' style={{ position: 'sticky', top: 0, backgroundColor: '#181A20', zIndex: 10, marginBottom: '50px' }}>
                                <tr>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Level</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ping</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rotation</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proxy</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">World</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gems</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Playtime</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Online Time</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Age</th>
                                </tr>
                                <tr>
                                    <th className="px-4 py-2 whitespace-nowrap text-center text-sm">
                                        <CustomCheckbox
                                            isChecked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" >
                                        <input
                                            name="username"
                                            type="text"
                                            value={searchQueries.username}
                                            onChange={handleSearchChange}
                                            className="max-w-[100px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0 "
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="level"
                                            type="text"
                                            value={searchQueries.level}
                                            onChange={handleSearchChange}
                                            className="max-w-[60px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="ping"
                                            type="text"
                                            value={searchQueries.ping}
                                            onChange={handleSearchChange}
                                            className="max-w-[60px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="status"
                                            type="text"
                                            value={searchQueries.status}
                                            onChange={handleSearchChange}
                                            className="max-w-[130px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="rotation_status"
                                            type="text"
                                            value={searchQueries.rotation_status}
                                            onChange={handleSearchChange}
                                            className="max-w-[140px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="proxy"
                                            type="text"
                                            value={searchQueries.proxy}
                                            onChange={handleSearchChange}
                                            className="mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="world"
                                            type="text"
                                            value={searchQueries.world}
                                            onChange={handleSearchChange}
                                            className="mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="position"
                                            type="text"
                                            value={searchQueries.position}
                                            onChange={handleSearchChange}
                                            className="max-w-[50px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="gems"
                                            type="text"
                                            value={searchQueries.gems}
                                            onChange={handleSearchChange}
                                            className="max-w-[110px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="playtime"
                                            type="text"
                                            value={searchQueries.playtime}
                                            onChange={handleSearchChange}
                                            className="max-w-[100px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="online_time"
                                            type="text"
                                            value={searchQueries.online_time}
                                            onChange={handleSearchChange}
                                            className="max-w-[100px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <input
                                            name="age"
                                            type="text"
                                            value={searchQueries.age}
                                            onChange={handleSearchChange}
                                            className="max-w-[90px] mt-1 px-2 py-1 bg-[#0F1015] border border-gray-600 rounded text-xs text-gray-400 focus:outline-none focus:ring-0"
                                            placeholder=""
                                        />
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-700" style={{ marginTop: '8px' }}>
                                {currentUsers.map((user) => (
                                    <tr 
                                        key={user.index} 
                                        className={`bg-[#181A20] cursor-pointer ${selectedRows.has(user.index) ? 'bg-[#222A31]' : ''}`}
                                        onClick={() => handleSelectRow(user.index)}
                                        onContextMenu={(e) => handleRowContextMenu(e, user.index)}
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                                            <CustomCheckbox
                                                isChecked={selectedRows.has(user.index)}
                                                onChange={() => handleSelectRow(user.index)}
                                            />
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-username`) ? 'glow-update' : ''}`}>
                                            {user.username}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-level`) ? 'glow-update' : ''}`}>
                                            Lv. {user.level}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-ping`) ? 'glow-update' : ''}`}>
                                            {user.ping} ms
                                        </td>
                                        <td className={`font-semibold px-4 py-2 whitespace-nowrap text-sm glow ${updatedCells.has(`${user.index}-status`) ? 'glow-update' : ''} ${user.status === 'Online' ? 'text-green-500' : 'text-red-500'}`}>
                                            {user.status}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-rotation_status`) ? 'glow-update' : ''}`}>
                                            {user.rotation_status}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-proxy`) ? 'glow-update' : ''}`}>
                                            {user.proxy}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-world`) ? 'glow-update' : ''}`}>
                                            {user.world}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-position`) ? 'glow-update' : ''}`}>
                                            {user.position}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-gems`) ? 'glow-update' : ''}`}>
                                        💎 {formatNumber(user.gems)}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-playtime`) ? 'glow-update' : ''}`}>
                                            {user.playtime} hours
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-online_time`) ? 'glow-update' : ''}`}>
                                            {user.online_time}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-300 glow ${updatedCells.has(`${user.index}-age`) ? 'glow-update' : ''}`}>
                                            {(user.age)} days
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-widgetBg text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        
                        <div className="flex flex-wrap justify-center sm:justify-start space-x-2">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === index + 1
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-[#0F1015] text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-widgetBg text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="text-xs text-gray-400 flex justify-between w-full max-w-md">
                        <span>1 to {currentUsers.length} of {users.length}</span>
                        <span>Page {currentPage} of {totalPages}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Content;
