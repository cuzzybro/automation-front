'use client';

import React, { HTMLAttributes, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type ReactModal from 'react-modal';
import type { UserProperties } from '../lib/types';

// Dynamically import react-modal to avoid SSR issues
const Modal = dynamic(() => import('react-modal'), { ssr: false }) as typeof ReactModal & {
  setAppElement: (element: string | HTMLElement) => void;
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {

    const [formData, setFormData] = useState<UserProperties>({
        properties: {
            userid: '',
            f10pw: '',
            pw: '',
        }
    });

    const [isUpdate, setIsUpdate] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // fetch existing properties
    useEffect(() => {
        if (isOpen) {
            const fetchProperties = async () => {
                try {

                    const response = await fetch("/api/get-properties", { method: "GET" });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error ?? "Failed to fetch properties");
                    }

                    if (data.userid || data.f10pw || data.pw) {
                        setIsUpdate(true);
                        setFormData({
                            properties: {
                                userid: data.userid ?? '',
                                f10pw: data.f10pw ?? '',
                                pw: data.pw ?? '',
                            }

                        });
                    } else {
                        setIsUpdate(false);
                    }

                } catch (err) {
                    console.error(err)
                };
            };
            fetchProperties();
        }
    }, [isOpen])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        properties: {
            ...prev.properties,
            [name]: value,
        }
        
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.properties.userid || !formData.properties.f10pw || !formData.properties.pw) {
        setError('All fields are required');
        return;
        }

        try {
        const response = await fetch('/api/save-properties', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error ?? 'Failed to save properties');
        }

        setError(null);
        setFormData({ properties: { userid: '', f10pw: '', pw: '' }}); // Reset form
        onSuccess();
        } catch (err) {
        setError(`Error saving properties - ${err}`);
        }
    };

    // Custom styles for the modal overlay and content (you can tweak these further)
    const customStyles = {
        overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark semi-transparent overlay
        zIndex: 1000,
        },
        content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        border: 'none',
        background: 'none',
        padding: 0,
        width: '100%',
        maxWidth: '400px', // Constrain the modal width for better aesthetics
        },
    };

    const inputClassName: HTMLAttributes<string>["className"] = "w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm";

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        ariaHideApp={false}
        appElement={typeof window !== 'undefined' ? document.getElementById('body') || undefined : undefined}
        // className="bg-white p-6 shadow-xl max-w-xl mx-auto mt-20"
        style={customStyles}
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >

        <div className='bg-gray-100 rounded-xl shadow-2xl p-8'>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {isUpdate ? 'Update Details' : 'Details Required'}
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="userid"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        User ID
                    </label>
                    <input
                        type="text"
                        id="userid"
                        name="userid"
                        value={formData.properties.userid}
                        placeholder="User Id"
                        onChange={handleInputChange}
                        className={inputClassName}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="f10pw" className="block text-sm font-medium text-gray-700">
                        F10 Password
                    </label>
                    <input
                        type="password"
                        id="f10pw"
                        name="f10pw"
                        placeholder='F10 Password'
                        value={formData.properties.f10pw}
                        onChange={handleInputChange}
                        className={inputClassName}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="pw" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="pw"
                        name="pw"
                        placeholder="CICS Password"
                        value={formData.properties.pw}
                        onChange={handleInputChange}
                        className={ inputClassName}
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className='flex'>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        { isUpdate ? "Update" : "Submit" }
                    </button>
                </div>
            </form>
            </div>
        </Modal>
    );
};

export default LoginModal;