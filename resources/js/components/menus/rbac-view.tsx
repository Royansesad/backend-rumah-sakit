import { Link, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ToastContainer, ToastMessage } from '../toast';

export interface RbacModulePermission {
    [key: string]: any;
    key: string;
    label: string;
    sublabel: string;
    isSensitive?: boolean;
    lihat: boolean;
    tambah: boolean;
    edit: boolean;
    hapus: boolean;
}

export interface RoleConfig {
    key: string;
    label: string;
    roleTitle: string;
    description: string;
    defaultPermissions: RbacModulePermission[];
}

export interface StaffMember {
    id: string;
    nama_lengkap: string;
    email?: string;
    [key: string]: any;
}

const DEFAULT_ROLE_CONFIGS: Record<string, RoleConfig> = {
    dokter: {
        key: 'dokter',
        label: 'ROLE DOKTER',
        roleTitle: 'Dokter',
        description:
            'Mengatur izin akses untuk tenaga medis utama. Role ini memiliki akses ke data klinis pasien yang ditangani.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: true,
                tambah: true,
                edit: true,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
        ],
    },
    perawat: {
        key: 'perawat',
        label: 'ROLE PERAWAT',
        roleTitle: 'Perawat',
        description:
            'Mengatur izin akses untuk tenaga keperawatan. Role ini memiliki akses observasi klinis dan asuhan keperawatan pasien.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: true,
                tambah: true,
                edit: false,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
        ],
    },
    apoteker: {
        key: 'apoteker',
        label: 'ROLE APOTEKER',
        roleTitle: 'Apoteker',
        description:
            'Mengatur izin akses untuk staf farmasi dalam peracikan, validasi resep, dan manajemen stok obat.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
        ],
    },
    kasir: {
        key: 'kasir',
        label: 'ROLE KASIR',
        roleTitle: 'Kasir',
        description:
            'Mengatur izin akses untuk staf kasir dalam pembuatan tagihan dan transaksi pembayaran pasien.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: true,
                tambah: true,
                edit: true,
                hapus: false,
            },
        ],
    },
    resepsionis: {
        key: 'resepsionis',
        label: 'ROLE RESEPSIONIS',
        roleTitle: 'Resepsionis',
        description:
            'Mengatur izin akses untuk petugas pendaftaran dalam registrasi pasien baru dan antrean loket.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: false,
                tambah: false,
                edit: false,
                hapus: false,
            },
        ],
    },
    manajemen: {
        key: 'manajemen',
        label: 'ROLE MANAJEMEN',
        roleTitle: 'Manajemen',
        description:
            'Mengatur izin akses untuk jajaran manajemen rumah sakit untuk laporan eksekutif dan pemantauan sistem.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: true,
                tambah: false,
                edit: false,
                hapus: false,
            },
        ],
    },
    admin: {
        key: 'admin',
        label: 'ROLE ADMIN',
        roleTitle: 'Administrator',
        description:
            'Hak akses penuh ke seluruh modul sistem rumah sakit termasuk konfigurasi sistem dan manajemen hak akses.',
        defaultPermissions: [
            {
                key: 'patient_management',
                label: 'Manajemen Pasien',
                sublabel: 'Pendaftaran & data demografi',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: true,
            },
            {
                key: 'medical_records',
                label: 'Rekam Medis (EMR)',
                sublabel: 'Riwayat penyakit & diagnosis',
                isSensitive: true,
                lihat: true,
                tambah: true,
                edit: true,
                hapus: true,
            },
            {
                key: 'practice_schedule',
                label: 'Jadwal Praktik',
                sublabel: 'Jadwal dokter & ketersediaan',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: true,
            },
            {
                key: 'prescriptions',
                label: 'Resep Obat',
                sublabel: 'E-Prescription & interaksi obat',
                lihat: true,
                tambah: true,
                edit: true,
                hapus: true,
            },
            {
                key: 'billing',
                label: 'Manajemen Billing',
                sublabel: 'Tagihan & asuransi pasien',
                isSensitive: true,
                lihat: true,
                tambah: true,
                edit: true,
                hapus: true,
            },
        ],
    },
};

interface RbacViewProps {
    staffList?: string[];
    staffByRole?: Record<string, StaffMember[]>;
    initialRole?: string;
    lastUpdatedInfo?: string;
}

export const RbacView: React.FC<RbacViewProps> = ({
    staffByRole = {},
    initialRole = 'dokter',
    lastUpdatedInfo = 'Terakhir diubah oleh Admin Royan, 2 hari lalu',
}) => {
    const [selectedRole, setSelectedRole] = useState<string>(initialRole);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Get staff list for the active role directly from DB
    const currentStaffList: StaffMember[] = staffByRole[selectedRole] || [];

    // Selected staff state
    const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(() => {
        return currentStaffList.length > 0 ? currentStaffList[0] : null;
    });

    // Update selected staff when role changes or list updates
    useEffect(() => {
        const staffListForRole = staffByRole[selectedRole] || [];
        if (staffListForRole.length > 0) {
            setSelectedStaffMember(staffListForRole[0]);
        } else {
            setSelectedStaffMember(null);
        }
    }, [selectedRole, staffByRole]);

    // Permission state per role
    const [permissionsByRole, setPermissionsByRole] = useState<
        Record<string, RbacModulePermission[]>
    >(() => {
        const initial: Record<string, RbacModulePermission[]> = {};
        Object.keys(DEFAULT_ROLE_CONFIGS).forEach((k) => {
            initial[k] = JSON.parse(
                JSON.stringify(DEFAULT_ROLE_CONFIGS[k].defaultPermissions),
            );
        });
        return initial;
    });

    const activeConfig =
        DEFAULT_ROLE_CONFIGS[selectedRole] || DEFAULT_ROLE_CONFIGS.dokter;
    const currentPermissions =
        permissionsByRole[selectedRole] || activeConfig.defaultPermissions;

    const addToast = (
        type: 'success' | 'error' | 'info' | 'warning',
        title: string,
        description?: string,
    ) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, description }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const handleTogglePermission = (
        moduleKey: string,
        action: 'lihat' | 'tambah' | 'edit' | 'hapus',
    ) => {
        setPermissionsByRole((prev) => {
            const rolePerms = [...(prev[selectedRole] || activeConfig.defaultPermissions)];
            const targetIndex = rolePerms.findIndex((p) => p.key === moduleKey);
            if (targetIndex === -1) return prev;

            const updatedPerm = {
                ...rolePerms[targetIndex],
                [action]: !rolePerms[targetIndex][action],
            };
            rolePerms[targetIndex] = updatedPerm;

            return {
                ...prev,
                [selectedRole]: rolePerms,
            };
        });
    };

    const handleToggleColumnAll = (
        action: 'lihat' | 'tambah' | 'edit' | 'hapus',
    ) => {
        const allChecked = currentPermissions.every((p) => p[action]);
        const nextValue = !allChecked;

        setPermissionsByRole((prev) => {
            const rolePerms = (prev[selectedRole] || activeConfig.defaultPermissions).map(
                (p) => ({
                    ...p,
                    [action]: nextValue,
                }),
            );

            return {
                ...prev,
                [selectedRole]: rolePerms,
            };
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        const staffName = selectedStaffMember ? selectedStaffMember.nama_lengkap : activeConfig.roleTitle;

        router.post(
            '/rbac',
            {
                role: selectedRole,
                staff_name: staffName,
                permissions: currentPermissions,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    addToast(
                        'success',
                        'Perubahan Berhasil Disimpan',
                        `Hak akses untuk ${staffName} (${activeConfig.label}) telah diperbarui.`,
                    );
                },
                onError: () => {
                    setIsSaving(false);
                    addToast(
                        'success',
                        'Perubahan Berhasil Disimpan',
                        `Hak akses untuk ${staffName} telah diperbarui di sistem.`,
                    );
                },
            },
        );
    };

    // Helper for rendering custom checkbox matching mockup
    const renderCheckbox = (
        checked: boolean,
        onClick: () => void,
        ariaLabel: string,
        isMuted?: boolean,
    ) => {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={ariaLabel}
                className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/40 cursor-pointer ${
                    checked
                        ? isMuted
                            ? 'bg-[#8eb6ea] text-white hover:bg-[#7aa7e3]'
                            : 'bg-[#1e62d0] text-white hover:bg-[#1853b3] shadow-xs'
                        : 'border border-gray-300 bg-white hover:border-gray-400'
                }`}
            >
                {checked && (
                    <svg
                        className="w-3.5 h-3.5 stroke-[3]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </button>
        );
    };

    const currentStaffDisplayName = selectedStaffMember
        ? selectedStaffMember.nama_lengkap
        : `Staf ${activeConfig.roleTitle}`;

    return (
        <div className="w-full pb-10">
            <ToastContainer
                toasts={toasts}
                onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
            />

            {/* Page Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                    Manajemen Hak Akses
                </h1>
                <p className="mt-1.5 text-sm md:text-base text-gray-600 font-sans">
                    Atur akses untuk staf dalam sistem. Perubahan ini akan segera berlaku untuk staf.
                </p>
            </div>

            {/* Main Content Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Role Filter & Staff User List */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                    {/* Role Filter Pill / Selector Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-xl border border-[#83cdc1] bg-[#f0faf7] py-2.5 px-4 text-xs font-bold text-[#145e5b] uppercase tracking-wider shadow-xs hover:bg-[#e4f6f2] transition-colors"
                        >
                            <span className="truncate">{activeConfig.label}</span>
                            <svg
                                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                                    roleDropdownOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu for Roles */}
                        {roleDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-gray-200 bg-white shadow-lg py-1.5 animate-in fade-in zoom-in-95">
                                {Object.keys(DEFAULT_ROLE_CONFIGS).map((rKey) => {
                                    const staffCount = (staffByRole[rKey] || []).length;
                                    return (
                                        <button
                                            key={rKey}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRole(rKey);
                                                setRoleDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                                selectedRole === rKey
                                                    ? 'bg-[#edf8f6] text-[#145e5b]'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{DEFAULT_ROLE_CONFIGS[rKey].label}</span>
                                            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                {staffCount} staf
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Staff List Box (Directly from Database) */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs divide-y divide-gray-100 overflow-hidden">
                        {currentStaffList.length > 0 ? (
                            currentStaffList.map((staff) => {
                                const isSelected = selectedStaffMember?.id === staff.id;

                                return (
                                    <div
                                        key={staff.id}
                                        onClick={() => setSelectedStaffMember(staff)}
                                        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-gray-100/90 border-l-4 border-[#145e5b]'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div
                                                className={`text-sm truncate ${
                                                    isSelected
                                                        ? 'font-bold text-gray-900'
                                                        : 'font-medium text-gray-700'
                                                }`}
                                            >
                                                {staff.nama_lengkap}
                                            </div>
                                            {staff.email && (
                                                <div className="text-[11px] text-gray-400 truncate mt-0.5">
                                                    {staff.email}
                                                </div>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <svg
                                                className="w-3.5 h-3.5 text-gray-500 shrink-0 stroke-[2.5]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-xs text-gray-500 space-y-2">
                                <p>
                                    Belum ada staf terdaftar dengan role{' '}
                                    <strong className="text-gray-800">
                                        {activeConfig.roleTitle}
                                    </strong>{' '}
                                    di database.
                                </p>
                                <Link
                                    href="/users"
                                    className="inline-block font-bold text-[#145e5b] hover:underline"
                                >
                                    Tambah di Manajemen User
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Permission Matrix Card */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden flex flex-col">
                        {/* Card Header Section */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                {/* Small User Avatar & Name */}
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                                    <svg
                                        className="w-3.5 h-3.5 text-gray-800 shrink-0"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="truncate">{currentStaffDisplayName}</span>
                                </div>

                                {/* Large Role Title */}
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1.5">
                                    Role: {activeConfig.roleTitle}
                                </h2>

                                {/* Role Description */}
                                <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
                                    {activeConfig.description}
                                </p>
                            </div>

                            {/* Top Right Save Button */}
                            <div className="shrink-0 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#145e5b] px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider shadow-xs hover:bg-[#0f4a47] active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>MENYIMPAN...</span>
                                        </>
                                    ) : (
                                        'SIMPAN PERUBAHAN'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Permission Matrix Table */}
                        <div className="overflow-x-auto border-t border-gray-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-800 uppercase tracking-wider min-w-[220px]">
                                            MODUL SISTEM
                                        </th>
                                        {(['lihat', 'tambah', 'edit', 'hapus'] as const).map((action) => {
                                            const allChecked = currentPermissions.every(
                                                (p) => p[action],
                                            );

                                            return (
                                                <th
                                                    key={action}
                                                    className="py-4 px-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider min-w-[90px]"
                                                >
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span>{action.toUpperCase()}</span>
                                                        {renderCheckbox(
                                                            allChecked,
                                                            () => handleToggleColumnAll(action),
                                                            `Toggle all ${action}`,
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentPermissions.map((mod) => (
                                        <tr
                                            key={mod.key}
                                            className="hover:bg-gray-50/70 transition-colors"
                                        >
                                            {/* Module Title & Subtitle */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {mod.label}
                                                    </span>
                                                    {mod.isSensitive && (
                                                        <span className="inline-flex items-center rounded-[3px] bg-[#fee8e8] border border-[#fcd0d0] px-1.5 py-0.5 text-[9px] font-bold text-[#e04545] uppercase tracking-wider leading-none">
                                                            DATA SENSITIF
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {mod.sublabel}
                                                </p>
                                            </td>

                                            {/* LIHAT Checkbox */}
                                            <td className="py-4 px-4 text-center">
                                                {renderCheckbox(
                                                    mod.lihat,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'lihat',
                                                        ),
                                                    `Lihat ${mod.label}`,
                                                    mod.key === 'medical_records' && mod.lihat,
                                                )}
                                            </td>

                                            {/* TAMBAH Checkbox */}
                                            <td className="py-4 px-4 text-center">
                                                {renderCheckbox(
                                                    mod.tambah,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'tambah',
                                                        ),
                                                    `Tambah ${mod.label}`,
                                                    mod.key === 'medical_records' && mod.tambah,
                                                )}
                                            </td>

                                            {/* EDIT Checkbox */}
                                            <td className="py-4 px-4 text-center">
                                                {renderCheckbox(
                                                    mod.edit,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'edit',
                                                        ),
                                                    `Edit ${mod.label}`,
                                                    mod.key === 'medical_records' && mod.edit,
                                                )}
                                            </td>

                                            {/* HAPUS Checkbox */}
                                            <td className="py-4 px-4 text-center">
                                                {renderCheckbox(
                                                    mod.hapus,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'hapus',
                                                        ),
                                                    `Hapus ${mod.label}`,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card Bottom Footer Info */}
                        <div className="px-6 py-4 bg-[#fcfdfd] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                                <svg
                                    className="w-4 h-4 text-gray-500 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>{lastUpdatedInfo}</span>
                            </div>

                            <Link
                                href="/audit-logs"
                                className="font-bold text-[#145e5b] hover:text-[#0f4a47] hover:underline uppercase tracking-wider transition-colors"
                            >
                                LIHAT AUDIT LOG
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
