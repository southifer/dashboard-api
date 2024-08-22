import React, { useEffect, useRef } from 'react';
import { TrashIcon, DownloadIcon } from '@heroicons/react/outline';

const ContextMenu = ({ position, onClose, onDelete, onExport, onSelectAll, onDeselectAll }) => {
    const menuRef = useRef(null);

    // Close the context menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute z-100 bg-[#181A20] shadow-lg rounded border border-gray-600"
            style={{ top: position.y, left: position.x }}
        >
            <button
                className="flex items-center px-4 py-2 text-xs hover:bg-gray-700 w-[150px] text-left"
                onClick={onDelete}
            >
            
                Delete
            </button>
            <button
                className="flex items-center px-4 py-2 text-xs hover:bg-gray-700 w-full text-left"
                onClick={onExport}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15Zm-6.75-10.5a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V10.5Z" clipRule="evenodd" />
                </svg>

                Export
            </button>
            <button
                className="flex items-center px-4 py-2 text-xs hover:bg-gray-700 w-full text-left"
                onClick={onSelectAll}
            >
                
               Select All
            </button>
            <button
                className="flex items-center px-4 py-2 text-xs hover:bg-gray-700 w-full text-left"
                onClick={onDeselectAll}
            >
                
               Deselect All
            </button>
        </div>
    );
};

export default ContextMenu;
