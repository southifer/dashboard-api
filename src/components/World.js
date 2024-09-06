import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useWindowDimensions from './useWindowDimensions'; // Adjust the path if needed
import './styles.css'; // Import the CSS file with the transition styles and custom scrollbar

const World = () => {
    const [worlds, setWorlds] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingField, setEditingField] = useState('');
    const [name, setName] = useState('');
    const [door, setDoor] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [originalDoor, setOriginalDoor] = useState('');
    const [textarea, setTextarea] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const { width } = useWindowDimensions(); // Get the window width

    useEffect(() => {
        const fetchWorlds = async () => {
            try {
                const response = await axios.get('http://93.113.180.31:5000/api/worlds');
                setWorlds(response.data);
            } catch (error) {
                console.error('Error fetching worlds:', error);
            }
        };

        fetchWorlds();
    }, []);

    
    useEffect(() => {
        setSelectAll(worlds.length > 0 && selectedRows.size === worlds.length);
    }, [selectedRows, worlds]);
    

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

    const handleAddWorld = async () => {
        if (!name.trim() || !door.trim()) {
            showAlert('error', 'Error', 'Please provide both world name and door!');
            return;
        }

        try {
            await axios.post('http://93.113.180.31:5000/api/worlds', { name, door });
            setWorlds([...worlds, { name, door }]);
            setName('');
            setDoor('');
            showAlert('success', 'Success', 'World added successfully!');
        } catch (error) {
            console.error('Error adding world:', error);
            showAlert('error', 'Error', error.response?.data?.message || 'Failed to add world!');
        }
    };

    const handleUpload = async () => {
        if (!textarea.trim()) {
            showAlert('error', 'Error', 'Text area cannot be empty!');
            return;
        }

        const lines = textarea.split('\n');
        const newWorlds = [];

        for (const line of lines) {
            const [worldName, worldDoor] = line.split('|');
            if (worldName) {
                newWorlds.push({
                    name: worldName.trim(),
                    door: worldDoor ? worldDoor.trim() : ''
                });
            } else {
                showAlert('error', 'Error', `Incorrect format in line: "${line}"`);
                return;
            }
        }

        setLoading(true);

        try {
            const uniqueWorlds = Array.from(new Set(newWorlds.map(world => JSON.stringify(world))))
                .map(world => JSON.parse(world));

            const requests = uniqueWorlds.map(world =>
                axios.post('http://93.113.180.31:5000/api/worlds', world)
        );
            await Promise.all(requests);

            setWorlds([...worlds, ...uniqueWorlds]);
            setTextarea('');
            showAlert('success', 'Success', `${uniqueWorlds.length} worlds added successfully!`);
        } catch (error) {
            console.error('Error uploading data:', error);
            showAlert('error', 'Error', error.response?.data?.message || 'Failed to upload data!');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index, field, value) => {
        setEditingIndex(index);
        setEditingField(field);
        if (field === 'name') {
            setName(value);
            setOriginalName(value);
        } else if (field === 'door') {
            setDoor(value);
            setOriginalDoor(value);
        }
    };

    const handleSave = async (index) => {
        if (editingField === 'name' && name === originalName) {
            setEditingIndex(null);
            setName('');
            setOriginalName('');
            return;
        }

        if (editingField === 'door' && door === originalDoor) {
            setEditingIndex(null);
            setDoor('');
            setOriginalDoor('');
            return;
        }

        const updatedWorld = worlds.find(world => world.index === index);
        if (!updatedWorld) return;

        if (editingField === 'name') {
            updatedWorld.name = name;
        } else if (editingField === 'door') {
            updatedWorld.door = door;
        }

        try {
        await axios.put(`http://93.113.180.31:5000/api/worlds/${index}`, updatedWorld);
            setWorlds(worlds.map(world => (world.index === index ? updatedWorld : world)));
            setEditingIndex(null);
            setName('');
            setDoor('');
            setOriginalName('');
            setOriginalDoor('');
            showAlert('success', 'Success', 'World updated successfully!');
        } catch (error) {
            console.error('Error updating world:', error);
            showAlert('error', 'Error', error.response?.data?.message || 'Failed to update world!');
        }
    };


    const handleSelectRow = (index) => {
        setSelectedRows(prevSelectedRows => {
            const newSelectedRows = new Set(prevSelectedRows);
            if (newSelectedRows.has(index)) {
                newSelectedRows.delete(index);
            } else {
                newSelectedRows.add(index);
            }
            return newSelectedRows;
        });
    };
    const handleSelectAll = () => {
        if (selectAll) {
            handleDeselectAll();
        } else {
            setSelectedRows(new Set(worlds.map(world => world.index)));
        }
        setSelectAll(!selectAll);
    };
    
    
    const handleDeselectAll = () => {
        setSelectedRows(new Set());
    };

    const handleDeleteSelected = async () => {
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
        });

        if (confirmation.isConfirmed) {
            setLoading(true);

            try {
                const deleteRequests = Array.from(selectedRows).map(index =>
                    axios.delete(`http://135.125.191.88:5000/api/worlds/${index}`)
                );
                await Promise.all(deleteRequests);

                setWorlds(worlds.filter(world => !selectedRows.has(world.index)));
                setSelectedRows(new Set());
                showAlert('success', 'Deleted', `${selectedRows.size} row(s) deleted successfully!`);
            } catch (error) {
                console.error('Error deleting selected rows:', error);
                showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete selected rows!');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setShowDeleteButton(true);
    };

    const handleSubmit = () => {
        if (name && door) {
            // Handle adding a single world
            handleAddWorld();
        } else if (textarea) {
            // Handle file upload
            handleUpload();
        } else {
            // Optionally handle a case where neither action is appropriate
            alert('Please provide input to add a world or upload a file.');
        }
    };
    
    const CustomCheckbox = ({ isChecked, onChange }) => {
        return (
            <div
                className={`relative flex items-center justify-center h-4 w-4 border-2 rounded cursor-pointer ${isChecked ? 'bg-white border-white' : 'bg-[#181A20] border-white'}`}
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

    const maxTableWidth = width - 100; // Adjust width with a buffer (e.g., 100px)

    return (
        <div className="p-6 bg-mainBg text-white min-h-screen">
            {loading && (
                <div style={{ position: 'relative', marginTop: '16px' }}>
                <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '4px',
                        backgroundColor: '#007BFF',
                        animation: 'loadingAnimation 2s linear infinite'
                    }} />
                </div>
            )}
            <div className="grid grid-cols-1 gap-6 mb-4">
                <div className="bg-widgetBg p-5 rounded-lg shadow-md">
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex gap-4 mb-1">
                            <input
                                type="text"
                                placeholder="world"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 p-2 rounded bg-[#2A2E35] border border-[#404570] text-white"
                            />
                            <input
                                type="text"
                                placeholder="door"
                                value={door}
                                onChange={(e) => setDoor(e.target.value)}
                                className="flex-1 p-2 rounded bg-[#2A2E35] border border-[#404570] text-white"
                            />
                        </div>
                        <textarea
                            placeholder="Upload worlds (format: world|door)"
                            value={textarea}
                            onChange={(e) => setTextarea(e.target.value)}
                            className="w-full h-36 p-2 rounded bg-[#2A2E35] border border-[#404570] text-white mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-md bg-[#dd364d] text-white border-none cursor-pointer text-sm z-10"
                            >
                            submit
                            </button>
                            {showDeleteButton && (
                                <button
                                    onClick={handleDeleteSelected}
                                    className="px-4 py-2 rounded-md bg-[#dd364d] text-white border-none cursor-pointer text-sm"
                                >
                                    Delete Selected
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-widgetBg p-4 rounded-lg shadow-md">
                <div className="max-w-full overflow-x-auto custom-scrollbar" style={{ maxWidth: `${maxTableWidth}px` }}>
                    <div className="relative max-h-[calc(100vh-210px)] overflow-y-auto custom-scrollbar">

                        <div className="sticky top-0 bg-bg-widgetBg p-2" style={{ zIndex: 20 ,backgroundColor: '#181A20'}}>
                            <p style={{ fontSize: '0.7rem',}}>selected x{selectedRows.size} | double click to edit</p>
                        </div>
                        
                        <div> {/* Adjust padding to account for the sticky header */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }} onContextMenu={handleContextMenu}>
                                <thead style={{ position: 'sticky', top: '2rem', backgroundColor: '#181A20', color: 'white', zIndex: 10 }}>
                                    <tr>
                                        <th style={{ padding: '5px', backgroundColor: '#181A20', borderBottom: '1px solid #404570' }}>
                                            <div className="text-center">
                                                <div className="relative inline-block">
                                                    <CustomCheckbox
                                                        isChecked={selectAll}
                                                        onChange={handleSelectAll}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ padding: '8px', backgroundColor: '#181A20', borderBottom: '1px solid #404570' }}>Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ padding: '8px', backgroundColor: '#181A20', borderBottom: '1px solid #404570' }}>Door</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {worlds.map((world) => (
                                        <tr key={world.index} style={{  borderBottom: '1px solid #404570' }}>
                                            <td className="p-2 text-center">
                                                <div className="relative inline-block">
                                                    <CustomCheckbox
                                                        isChecked={selectedRows.has(world.index)}
                                                        onChange={() => handleSelectRow(world.index)}
                                                    />
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    backgroundColor: editingIndex === world.index && editingField === 'name' ? '#2A2E35' : 'transparent',
                                                    transition: 'background-color 0.3s ease',
                                                    position: 'relative'
                                                }}
                                                onDoubleClick={() => handleEdit(world.index, 'name', world.name)}
                                            >
                                                {editingIndex === world.index && editingField === 'name' ? (
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        onBlur={() => handleSave(world.index)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #404570',
                                                            backgroundColor: '#2A2E35',
                                                            color: 'white',
                                                            transition: 'opacity 1s ease',
                                                            opacity: editingIndex === world.index && editingField === 'name' ? 1 : 0
                                                        }}
                                                    />
                                                ) : (
                                                    world.name
                                                )}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    backgroundColor: editingIndex === world.index && editingField === 'door' ? '#2A2E35' : 'transparent',
                                                    transition: 'background-color 0.3s ease',
                                                    position: 'relative'
                                                }}
                                                onDoubleClick={() => handleEdit(world.index, 'door', world.door)}
                                            >
                                                {editingIndex === world.index && editingField === 'door' ? (
                                                    <input
                                                        type="text"
                                                        value={door}
                                                        onChange={(e) => setDoor(e.target.value)}
                                                        onBlur={() => handleSave(world.index)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #404570',
                                                            backgroundColor: '#2A2E35',
                                                            color: 'white',
                                                            transition: 'opacity 1s ease',
                                                            opacity: editingIndex === world.index && editingField === 'door' ? 1 : 0
                                                        }}
                                                    />
                                                ) : (
                                                    world.door
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @keyframes loadingAnimation {
                        0% {
                            width: 0%;
                        }
                        100% {
                            width: 100%;
                        }
                    }

                    @keyframes fadeIn {
                        0% {
                            opacity: 0;
                        }
                        100% {
                            opacity: 1;
                        }
                    }

                    @keyframes fadeOut {
                        0% {
                            opacity: 1;
                        }
                        100% {
                            opacity: 0;
                        }
                    }
                `}
            </style>

        </div>
    );
};

export default World;