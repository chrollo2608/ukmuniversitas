'use client';

import { useState, useEffect } from 'react';
import { Users, Loader, Search, Download, Filter } from 'lucide-react';
import Navbar from '@/app/components/Dashboard/Navbar';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Footer from '@/app/components/Dashboard/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUKM, setCurrentUKM] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState({
        prodi: [],
        fakultas: []
    });
    const [filterParams, setFilterParams] = useState({
        filterBy: '',
        filterValue: ''
    });
    const handleSearch = async (value) => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/ukm/members?ukm=${encodeURIComponent(currentUKM)}&search=${value}`
            );
            const data = await response.json();

            if (data.success) {
                // Smooth transition for new data
                const fadeOut = async () => {
                    setMembers([]);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    setMembers(data.members);
                };
                fadeOut();
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleFilter = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/ukm/members?ukm=${encodeURIComponent(currentUKM)}&filterBy=${filterParams.filterBy}&filterValue=${filterParams.filterValue}`
            );
            const data = await response.json();

            if (data.success) {
                setMembers(data.members);
            }
        } catch (error) {
            console.error('Filter error:', error);
        } finally {
            setLoading(false);
            setFilterOpen(false);
        }
    };

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('users'));
                if (!userData?.ukm || userData.ukm.length === 0) {
                    setError('No UKM data found');
                    return;
                }

                const ukmName = userData.ukm[0];
                setCurrentUKM(ukmName);

                const response = await fetch(`/api/ukm/members?ukm=${encodeURIComponent(ukmName)}`);
                const data = await response.json();

                if (data.success) {
                    setMembers(data.members);
                    setFilterOptions({
                        prodi: [...new Set(data.members.map(m => m.prodi))],
                        fakultas: [...new Set(data.members.map(m => m.fakultas))]
                    });
                } else {
                    setError(data.message || 'Failed to fetch members');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('Error loading members');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }
    const content = (
        <div className="p-6 pt-20 space-y-6"> {/* Added pt-20 for navbar clearance */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Daftar Anggota {currentUKM}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Total Anggota: {members.length}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari anggota..."
                            className="w-full md:w-auto pl-10 pr-4 py-2 rounded-lg border border-gray-200 
        text-gray-900 placeholder-gray-500
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
        hover:border-gray-300
        transition-all duration-200"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                            aria-label="Buka menu filter"
                        >
                            <Filter className="w-4 h-4 text-gray-800" />
                            <span>Filter Anggota</span>
                        </button>

                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Program Studi
                                        </label>
                                        <select
                                            value={filterParams.filterBy === 'prodi' ? filterParams.filterValue : ''}
                                            onChange={(e) => setFilterParams({ filterBy: 'prodi', filterValue: e.target.value })}
                                            className="w-full rounded-lg border border-gray-200 p-2 text-gray-500"
                                            aria-label="Pilih Program Studi"
                                        >
                                            <option value="">Tampilkan Semua Prodi</option>
                                            {filterOptions.prodi.map((prodi) => (
                                                <option key={prodi} value={prodi}>{prodi}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Filter berdasarkan program studi anggota
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Fakultas
                                        </label>
                                        <select
                                            value={filterParams.filterBy === 'fakultas' ? filterParams.filterValue : ''}
                                            onChange={(e) => setFilterParams({ filterBy: 'fakultas', filterValue: e.target.value })}
                                            className="w-full rounded-lg border border-gray-200 p-2 text-gray-500"
                                            aria-label="Pilih Fakultas"
                                        >
                                            <option value="">Tampilkan Semua Fakultas</option>
                                            {filterOptions.fakultas.map((fakultas) => (
                                                <option key={fakultas} value={fakultas}>{fakultas}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Filter berdasarkan fakultas anggota
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setFilterParams({ filterBy: '', filterValue: '' });
                                                handleFilter();
                                            }}
                                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                                            aria-label="Reset filter"
                                        >
                                            Hapus Filter
                                        </button>
                                        <button
                                            onClick={handleFilter}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                            aria-label="Terapkan filter"
                                        >
                                            Terapkan Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 md:mx-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Nama</th>
                                <th className="px-4 py-3 text-left">NIM</th>
                                <th className="px-4 py-3 text-left">Prodi</th>
                                <th className="px-4 py-3 text-left">Fakultas</th>
                                <th className="px-4 py-3 text-left">Tanggal Diterima</th>
                            </tr>
                        </thead>
                        <AnimatePresence mode="wait">
                            <tbody className="divide-y divide-gray-200">
                                {members.map((member, index) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.05,
                                            ease: "easeOut"
                                        }}
                                        className="bg-white hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{member.nim}</td>
                                        <td className="px-4 py-3 text-gray-600">{member.prodi}</td>
                                        <td className="px-4 py-3 text-gray-600">{member.fakultas}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(member.tanggalDiterima)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </AnimatePresence>
                    </table>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar isOpen={sidebarOpen} userRole="pengurus" userUKM={currentUKM} />
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-61' : 'ml-0'}`}>
                    <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userUKM={currentUKM} />
                    <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-20' : 'ml-0'} bg-gray-50`}>
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="pengurus" userUKM={currentUKM} />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-61' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userUKM={currentUKM} />
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-20' : 'ml-0'} bg-gray-50`}>
                    {error ? (
                        <div className="h-full flex items-center justify-center text-red-500">
                            {error}
                        </div>
                    ) : (
                        content
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}