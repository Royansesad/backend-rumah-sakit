export type Role =
    | 'admin'
    | 'dokter'
    | 'perawat'
    | 'apoteker'
    | 'kasir'
    | 'resepsionis'
    | 'manajemen'
    | 'pasien';

export interface User {
    id: string;
    nama_lengkap: string;
    email: string;
    role: Role;
    no_hp?: string;
    status_akun?: string;
    nomor_str?: string;
    spesialisasi?: string;
    shift?: string;
    jabatan?: string;
    [key: string]: any;
}

export interface Patient {
    id: string;
    nomor_rekam_medis: string;
    nama_lengkap: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    golongan_darah?: string;
    alamat?: string;
    no_hp?: string;
    nik?: string;
    nama_kontak_darurat?: string;
    no_hp_kontak_darurat?: string;
    alergi?: string;
    riwayat_penyakit?: string;
    status_aktif?: string;
}

export interface AuditLog {
    id: string;
    pembuat_type: string;
    pembuat_id: string;
    modul: string;
    aksi: string;
    data_sebelum?: string;
    data_sesudah?: string;
    ip_address?: string;
    created_at: string;
}

export const ROLE_LABELS: Record<Role, string> = {
    admin: 'Administrator',
    dokter: 'Dokter',
    perawat: 'Perawat',
    apoteker: 'Apoteker',
    kasir: 'Kasir',
    resepsionis: 'Resepsionis',
    manajemen: 'Manajemen',
    pasien: 'Pasien',
};
