'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type ReactModal from 'react-modal';

// Dynamically import react-modal to avoid SSR issues
const Modal = dynamic(() => import('react-modal'), { ssr: false }) as typeof ReactModal & {
  setAppElement: (element: string | HTMLElement) => void;
};

// Interface for user properties
interface UserProperties {
  userid: string;
  f10pw: string;
  pw: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {

    const [formData, setFormData] = useState<UserProperties>({
        userid: '',
        f10pw: '',
        pw: '',
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
                            userid: data.userid ?? '',
                            f10pw: data.f10pw ?? '',
                            pw: data.pw ?? '',
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
        [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.userid || !formData.f10pw || !formData.pw) {
        setError('All fields are required');
        return;
        }

        try {
        const response = await fetch('/api/save-properties', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error ?? 'Failed to save properties');
        }

        setError(null);
        setFormData({ userid: '', f10pw: '', pw: '' }); // Reset form
        onSuccess();
        } catch (err) {
        setError(`Error saving properties - ${err}`);
        }
    };

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        ariaHideApp={false}
        appElement={typeof window !== 'undefined' ? document.getElementById('body') || undefined : undefined}
        className="bg-white p-6 shadow-xl max-w-xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {isUpdate ? 'Update Details' : 'Details Required'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="userid" className="block text-sm font-medium text-gray-700">
                User ID
            </label>
            <input
                type="text"
                id="userid"
                name="userid"
                value={formData.userid}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                value={formData.f10pw}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                value={formData.pw}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
            />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className='flex'>
            {/* <div className="flex justify-end space-x-2"> */}
            {/* <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
                Cancel
            </button> */}
            <button
                type="submit"
                className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                { isUpdate ? "Update" : "Submit" }
            </button>
            </div>
        </form>
        </Modal>
    );
};

export default LoginModal;