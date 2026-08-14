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
    const [selectedStaffMember, setSelectedStaffMember] =
        useState<StaffMember | null>(() => {
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
            const rolePerms = [
                ...(prev[selectedRole] || activeConfig.defaultPermissions),
            ];
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
            const rolePerms = (
                prev[selectedRole] || activeConfig.defaultPermissions
            ).map((p) => ({
                ...p,
                [action]: nextValue,
            }));

            return {
                ...prev,
                [selectedRole]: rolePerms,
            };
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        const staffName = selectedStaffMember
            ? selectedStaffMember.nama_lengkap
            : activeConfig.roleTitle;

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
                className={`inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[4px] transition-all focus:ring-2 focus:ring-blue-400/40 focus:outline-none ${
                    checked
                        ? isMuted
                            ? 'bg-[#8eb6ea] text-white hover:bg-[#7aa7e3]'
                            : 'bg-[#1e62d0] text-white shadow-xs hover:bg-[#1853b3]'
                        : 'border border-gray-300 bg-white hover:border-gray-400'
                }`}
            >
                {checked && (
                    <svg
                        className="h-3.5 w-3.5 stroke-[3]"
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
                onClose={(id) =>
                    setToasts((prev) => prev.filter((t) => t.id !== id))
                }
            />

            {/* Page Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                    Manajemen Hak Akses
                </h1>
                <p className="mt-1.5 font-sans text-sm text-gray-600 md:text-base">
                    Atur akses untuk staf dalam sistem. Perubahan ini akan
                    segera berlaku untuk staf.
                </p>
            </div>

            {/* Main Content Grid Layout */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                {/* Left Column: Role Filter & Staff User List */}
                <div className="space-y-4 lg:col-span-4 xl:col-span-3">
                    {/* Role Filter Pill / Selector Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setRoleDropdownOpen(!roleDropdownOpen)
                            }
                            className="flex w-full items-center justify-between rounded-xl border border-[#83cdc1] bg-[#f0faf7] px-4 py-2.5 text-xs font-bold tracking-wider text-[#145e5b] uppercase shadow-xs transition-colors hover:bg-[#e4f6f2]"
                        >
                            <span className="truncate">
                                {activeConfig.label}
                            </span>
                            <svg
                                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                                    roleDropdownOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu for Roles */}
                        {roleDropdownOpen && (
                            <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-30 mt-1.5 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
                                {Object.keys(DEFAULT_ROLE_CONFIGS).map(
                                    (rKey) => {
                                        const staffCount = (
                                            staffByRole[rKey] || []
                                        ).length;
                                        return (
                                            <button
                                                key={rKey}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRole(rKey);
                                                    setRoleDropdownOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                                                    selectedRole === rKey
                                                        ? 'bg-[#edf8f6] text-[#145e5b]'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>
                                                    {
                                                        DEFAULT_ROLE_CONFIGS[
                                                            rKey
                                                        ].label
                                                    }
                                                </span>
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-normal text-gray-600">
                                                    {staffCount} staf
                                                </span>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </div>

                    {/* Staff List Box (Directly from Database) */}
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                        {currentStaffList.length > 0 ? (
                            currentStaffList.map((staff) => {
                                const isSelected =
                                    selectedStaffMember?.id === staff.id;

                                return (
                                    <div
                                        key={staff.id}
                                        onClick={() =>
                                            setSelectedStaffMember(staff)
                                        }
                                        className={`flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors ${
                                            isSelected
                                                ? 'border-l-4 border-[#145e5b] bg-gray-100/90'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div
                                                className={`truncate text-sm ${
                                                    isSelected
                                                        ? 'font-bold text-gray-900'
                                                        : 'font-medium text-gray-700'
                                                }`}
                                            >
                                                {staff.nama_lengkap}
                                            </div>
                                            {staff.email && (
                                                <div className="mt-0.5 truncate text-[11px] text-gray-400">
                                                    {staff.email}
                                                </div>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <svg
                                                className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-gray-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="space-y-2 p-6 text-center text-xs text-gray-500">
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
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                        {/* Card Header Section */}
                        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:p-8">
                            <div className="min-w-0 flex-1">
                                {/* Small User Avatar & Name */}
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                                    <svg
                                        className="h-3.5 w-3.5 shrink-0 text-gray-800"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="truncate">
                                        {currentStaffDisplayName}
                                    </span>
                                </div>

                                {/* Large Role Title */}
                                <h2 className="mt-1.5 text-2xl font-bold text-gray-900 md:text-3xl">
                                    Role: {activeConfig.roleTitle}
                                </h2>

                                {/* Role Description */}
                                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-500 md:text-sm">
                                    {activeConfig.description}
                                </p>
                            </div>

                            {/* Top Right Save Button */}
                            <div className="shrink-0 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#145e5b] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#0f4a47] active:scale-[0.98] disabled:opacity-75 md:w-auto"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg
                                                className="h-3.5 w-3.5 animate-spin text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
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
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="min-w-[220px] px-6 py-4 text-xs font-bold tracking-wider text-gray-800 uppercase">
                                            MODUL SISTEM
                                        </th>
                                        {(
                                            [
                                                'lihat',
                                                'tambah',
                                                'edit',
                                                'hapus',
                                            ] as const
                                        ).map((action) => {
                                            const allChecked =
                                                currentPermissions.every(
                                                    (p) => p[action],
                                                );

                                            return (
                                                <th
                                                    key={action}
                                                    className="min-w-[90px] px-4 py-4 text-center text-xs font-bold tracking-wider text-gray-800 uppercase"
                                                >
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span>
                                                            {action.toUpperCase()}
                                                        </span>
                                                        {renderCheckbox(
                                                            allChecked,
                                                            () =>
                                                                handleToggleColumnAll(
                                                                    action,
                                                                ),
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
                                            className="transition-colors hover:bg-gray-50/70"
                                        >
                                            {/* Module Title & Subtitle */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {mod.label}
                                                    </span>
                                                    {mod.isSensitive && (
                                                        <span className="inline-flex items-center rounded-[3px] border border-[#fcd0d0] bg-[#fee8e8] px-1.5 py-0.5 text-[9px] leading-none font-bold tracking-wider text-[#e04545] uppercase">
                                                            DATA SENSITIF
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {mod.sublabel}
                                                </p>
                                            </td>

                                            {/* LIHAT Checkbox */}
                                            <td className="px-4 py-4 text-center">
                                                {renderCheckbox(
                                                    mod.lihat,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'lihat',
                                                        ),
                                                    `Lihat ${mod.label}`,
                                                    mod.key ===
                                                        'medical_records' &&
                                                        mod.lihat,
                                                )}
                                            </td>

                                            {/* TAMBAH Checkbox */}
                                            <td className="px-4 py-4 text-center">
                                                {renderCheckbox(
                                                    mod.tambah,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'tambah',
                                                        ),
                                                    `Tambah ${mod.label}`,
                                                    mod.key ===
                                                        'medical_records' &&
                                                        mod.tambah,
                                                )}
                                            </td>

                                            {/* EDIT Checkbox */}
                                            <td className="px-4 py-4 text-center">
                                                {renderCheckbox(
                                                    mod.edit,
                                                    () =>
                                                        handleTogglePermission(
                                                            mod.key,
                                                            'edit',
                                                        ),
                                                    `Edit ${mod.label}`,
                                                    mod.key ===
                                                        'medical_records' &&
                                                        mod.edit,
                                                )}
                                            </td>

                                            {/* HAPUS Checkbox */}
                                            <td className="px-4 py-4 text-center">
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
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-[#fcfdfd] px-6 py-4 text-xs sm:flex-row">
                            <div className="flex items-center gap-2 text-gray-500">
                                <svg
                                    className="h-4 w-4 shrink-0 text-gray-500"
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
                                className="font-bold tracking-wider text-[#145e5b] uppercase transition-colors hover:text-[#0f4a47] hover:underline"
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
