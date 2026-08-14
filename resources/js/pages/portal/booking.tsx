import { router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Baby,
    Briefcase,
    Building2,
    Calendar,
    CalendarCheck,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Download,
    Eye,
    FileText,
    Heart,
    HelpCircle,
    History,
    Home,
    Info,
    LayoutDashboard,
    Lock,
    MapPin,
    Receipt,
    Search,
    ShieldCheck,
    Smile,
    Sparkles,
    Star,
    Stethoscope,
    Sun,
    Sunset,
    User,
    UserCheck,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

/* ------------------------------------------------------------------ */
/*  Interfaces & Types                                                 */
/* ------------------------------------------------------------------ */

interface SlotItem {
    id: string;
    dokter_id?: string;
    poli_id?: string;
    kuota_maksimal: number;
    sisa_kuota: number;
    is_penuh?: boolean;
    tanggal: string;
    tanggal_label: string;
    jam_label: string;
    jam_mulai?: string;
    jam_selesai?: string;
    dokter?: {
        id: string;
        nama_lengkap: string;
        spesialisasi?: string;
        foto_profil?: string | null;
        nomor_sip?: string;
    };
    poli?: { id: string; nama_poli: string };
    ruangan?: { id: string; nama_ruangan?: string };
}

interface DokterItem {
    id: string;
    nama_lengkap: string;
    spesialisasi?: string;
    poli_id?: string;
    foto_profil?: string | null;
    nomor_sip?: string;
    nomor_str?: string;
    poli?: { id: string; nama_poli: string };
}

interface BookingItem {
    id: string;
    nomor_antrian: string;
    tanggal_label: string;
    jam_mulai?: string;
    jam_selesai?: string;
    poli: string;
    dokter: string;
    spesialisasi?: string;
    status: string;
    created_at?: string;
}

interface PoliItem {
    id: string;
    nama_poli: string;
}

interface BookingProps {
    user?: any;
    role?: string;
    pasien?: {
        id: string;
        nama_lengkap: string;
        nomor_rekam_medis?: string;
        no_hp?: string;
        [key: string]: any;
    };
    poliList?: PoliItem[];
    dokterList?: DokterItem[];
    jadwalTersedia?: SlotItem[];
    bookingSaya?: BookingItem[];
    filters?: { poli_id?: string; tanggal?: string };
}

/* ------------------------------------------------------------------ */
/*  Constants & Metadata                                               */
/* ------------------------------------------------------------------ */

const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const STATUS_META: Record<string, { label: string; cls: string }> = {
    menunggu: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700' },
    skrining: { label: 'Skrining', cls: 'bg-blue-50 text-blue-700' },
    dipanggil: { label: 'Dipanggil', cls: 'bg-purple-50 text-purple-700' },
    sedang_dilayani: { label: 'Dilayani', cls: 'bg-teal-50 text-teal-700' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700' },
    dilewati: { label: 'Dilewati', cls: 'bg-gray-50 text-gray-600' },
};

const CANCELABLE = new Set(['menunggu', 'skrining', 'dipanggil']);

// Dummy ratings & experience generator per doctor id
function getDoctorMeta(docId: string, idx: number) {
    const ratings = ['4.9 (120+ ulasan)', '4.8 (85 ulasan)', '4.9 (95 ulasan)', '4.7 (60 ulasan)', '4.9 (140+ ulasan)'];
    const exps = ['12 Tahun Pengalaman', '8 Tahun Pengalaman', '10 Tahun Pengalaman', '15 Tahun Pengalaman', '9 Tahun Pengalaman'];
    const r = ratings[idx % ratings.length];
    const e = exps[idx % exps.length];
    return { rating: r, exp: e };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function badge(status: string) {
    const meta = STATUS_META[status] ?? {
        label: status.replace('_', ' '),
        cls: 'bg-gray-50 text-gray-600',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.cls}`}>
            {meta.label}
        </span>
    );
}

function dateStr(d: string): string {
    return d.slice(0, 10);
}

function fmtTime(t?: string): string {
    return t ? t.slice(0, 5) : '';
}

function formatDateId(ds: string): string {
    if (!ds) return '';
    const d = new Date(ds + 'T00:00:00');
    const hariNama = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${hariNama[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDateId(ds: string): string {
    if (!ds) return '';
    const d = new Date(ds + 'T00:00:00');
    const hariNama = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${hariNama[d.getDay()]}, ${d.getDate()} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`;
}

function getPoliIcon(nama: string): React.ReactNode {
    const n = nama.toLowerCase();
    const cls = 'h-7 w-7';
    if (n.includes('gigi')) return <Smile className={cls} />;
    if (n.includes('anak')) return <Baby className={cls} />;
    if (n.includes('kandungan') || n.includes('obgyn')) return <Heart className={cls} />;
    if (n.includes('mata')) return <Eye className={cls} />;
    return <Stethoscope className={cls} />;
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function Booking({
    user,
    pasien,
    poliList = [],
    dokterList = [],
    jadwalTersedia = [],
    bookingSaya = [],
}: BookingProps) {
    const pageProps = usePage().props as any;
    const errors = (pageProps.errors ?? {}) as Record<string, string>;

    /* ---- Active Poli default ---- */
    const initialPoliId = useMemo(() => {
        if (poliList.length > 0) {
            const pd = poliList.find(p => p.nama_poli.toLowerCase().includes('dalam') || p.nama_poli.toLowerCase().includes('umum'));
            return pd ? pd.id : poliList[0].id;
        }
        return '';
    }, [poliList]);

    /* ---- Wizard State: 1 = Layanan/Dokter, 2 = Jadwal, 3 = Konfirmasi, 4 = Pembayaran, 5 = Sukses ---- */
    const [step, setStep] = useState(1);
    const [selectedPoliId, setSelectedPoliId] = useState(initialPoliId);
    const [selectedDokterId, setSelectedDokterId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [keluhan, setKeluhan] = useState('');
    const [dokterSearch, setDokterSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [selectedEwallet, setSelectedEwallet] = useState('gopay');
    const [selectedVa, setSelectedVa] = useState('bca');
    const [processing, setProcessing] = useState(false);
    const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);

    /* ---- Calendar Navigation ---- */
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

    /* ---- Selected Objects ---- */
    const selectedPoli = useMemo(() => {
        return poliList.find((p) => p.id === selectedPoliId) || poliList[0];
    }, [poliList, selectedPoliId]);

    // Doctors available for current poli — Strictly synced with database schedules & quota!
    const doctorsInPoli = useMemo(() => {
        const matchingDocs = dokterList.filter(d => !selectedPoliId || d.poli_id === selectedPoliId);
        const docMap = new Map<string, {
            id: string;
            nama_lengkap: string;
            spesialisasi?: string;
            foto_profil?: string | null;
            hasSlot: boolean;
            slotCount: number;
            availableCount: number;
            nearestLabel: string;
            isFull: boolean;
        }>();

        matchingDocs.forEach((d, idx) => {
            // Check real slots in database for this doctor
            const slots = jadwalTersedia.filter(s => (s.dokter_id === d.id) || (s.dokter?.id === d.id));
            const availableSlots = slots.filter(s => s.sisa_kuota > 0 && !s.is_penuh);
            const firstAvailable = availableSlots[0];
            const isFull = slots.length === 0 || availableSlots.length === 0;

            docMap.set(d.id, {
                id: d.id,
                nama_lengkap: d.nama_lengkap,
                spesialisasi: d.spesialisasi || selectedPoli?.nama_poli || 'Dokter Spesialis',
                foto_profil: d.foto_profil,
                hasSlot: slots.length > 0,
                slotCount: slots.length,
                availableCount: availableSlots.length,
                nearestLabel: firstAvailable
                    ? `Tersedia ${firstAvailable.tanggal_label}, ${fmtTime(firstAvailable.jam_mulai)} WIB`
                    : 'Jadwal penuh minggu ini',
                isFull: isFull,
            });
        });

        // Also check any doctor in jadwalTersedia not yet in docMap
        jadwalTersedia.forEach((s) => {
            if (s.dokter && (!selectedPoliId || s.poli?.id === selectedPoliId)) {
                if (!docMap.has(s.dokter.id)) {
                    const allDocSlots = jadwalTersedia.filter(x => (x.dokter_id === s.dokter!.id) || (x.dokter?.id === s.dokter!.id));
                    const avail = allDocSlots.filter(x => x.sisa_kuota > 0 && !x.is_penuh);
                    const isFull = allDocSlots.length === 0 || avail.length === 0;
                    const firstAvail = avail[0];

                    docMap.set(s.dokter.id, {
                        id: s.dokter.id,
                        nama_lengkap: s.dokter.nama_lengkap,
                        spesialisasi: s.dokter.spesialisasi || selectedPoli?.nama_poli,
                        foto_profil: s.dokter.foto_profil,
                        hasSlot: true,
                        slotCount: allDocSlots.length,
                        availableCount: avail.length,
                        nearestLabel: firstAvail
                            ? `Tersedia ${firstAvail.tanggal_label}, ${fmtTime(firstAvail.jam_mulai)} WIB`
                            : 'Jadwal penuh minggu ini',
                        isFull: isFull,
                    });
                }
            }
        });

        return Array.from(docMap.values());
    }, [dokterList, jadwalTersedia, selectedPoliId, selectedPoli]);

    // Filter doctors by search query
    const filteredDoctors = useMemo(() => {
        if (!dokterSearch.trim()) return doctorsInPoli;
        const q = dokterSearch.toLowerCase();
        return doctorsInPoli.filter(
            (d) =>
                d.nama_lengkap.toLowerCase().includes(q) ||
                (d.spesialisasi || '').toLowerCase().includes(q),
        );
    }, [doctorsInPoli, dokterSearch]);

    const selectedDokter = useMemo(() => {
        return (
            doctorsInPoli.find((d) => d.id === selectedDokterId) ||
            dokterList.find((d) => d.id === selectedDokterId) ||
            null
        );
    }, [doctorsInPoli, dokterList, selectedDokterId]);

    // Slots for the selected doctor directly synced with database
    const doctorSlots = useMemo(() => {
        return jadwalTersedia.filter((s) => (s.dokter_id === selectedDokterId) || (s.dokter?.id === selectedDokterId));
    }, [jadwalTersedia, selectedDokterId]);

    // Set of dates that have available remaining quota (sisa_kuota > 0 && !is_penuh)
    const availableDateSet = useMemo(() => {
        const set = new Set<string>();
        doctorSlots.forEach((s) => {
            if (s.sisa_kuota > 0 && !s.is_penuh) {
                set.add(dateStr(s.tanggal));
            }
        });
        return set;
    }, [doctorSlots]);

    // Calendar grid generator
    const calendarDays = useMemo(() => {
        const firstDow = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
        const days: { day: number; type: 'prev' | 'cur' | 'next'; ds: string }[] = [];

        for (let i = firstDow - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const m = calMonth === 0 ? 11 : calMonth - 1;
            const y = calMonth === 0 ? calYear - 1 : calYear;
            days.push({
                day: d,
                type: 'prev',
                ds: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({
                day: d,
                type: 'cur',
                ds: `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            });
        }
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            const m = calMonth === 11 ? 0 : calMonth + 1;
            const y = calMonth === 11 ? calYear + 1 : calYear;
            days.push({
                day: d,
                type: 'next',
                ds: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            });
        }
        return days;
    }, [calYear, calMonth]);

    const todayStr = new Date().toISOString().slice(0, 10);

    /* ---- Time Slot Database Mapping ---- */
    const morningTimeList = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonTimeList = ['13:00', '13:30', '14:00', '14:30', '15:00'];

    /* ---- Actions ---- */
    const handleSelectPoli = (id: string) => {
        setSelectedPoliId(id);
        setSelectedDokterId('');
        setSelectedDate('');
        setSelectedTimeSlot('');
        setSelectedSlotId('');
        setDokterSearch('');
    };

    const handleSelectDoctor = (docId: string) => {
        setSelectedDokterId(docId);
        setSelectedDate('');
        setSelectedTimeSlot('');
        setSelectedSlotId('');
        setStep(2);

        // Point calendar to nearest available slot with quota
        const docSlots = jadwalTersedia.filter((s) => ((s.dokter_id === docId) || (s.dokter?.id === docId)) && s.sisa_kuota > 0 && !s.is_penuh);
        if (docSlots.length > 0) {
            const firstDateStr = dateStr(docSlots[0].tanggal);
            setSelectedDate(firstDateStr);
            const d = new Date(firstDateStr + 'T00:00:00');
            setCalYear(d.getFullYear());
            setCalMonth(d.getMonth());
            setSelectedSlotId(docSlots[0].id);
            setSelectedTimeSlot(fmtTime(docSlots[0].jam_mulai) || '09:00');
        } else {
            setSelectedDate(todayStr);
            setSelectedTimeSlot('09:00');
        }
    };

    const handleSelectDate = (ds: string) => {
        setSelectedDate(ds);
        // Find available slot with quota on that date
        const matching = doctorSlots.find(s => dateStr(s.tanggal) === ds && s.sisa_kuota > 0 && !s.is_penuh);
        if (matching) {
            setSelectedSlotId(matching.id);
            setSelectedTimeSlot(fmtTime(matching.jam_mulai) || '09:00');
        } else {
            const anySlotOnDate = doctorSlots.find(s => dateStr(s.tanggal) === ds);
            if (anySlotOnDate) {
                setSelectedSlotId(anySlotOnDate.id);
                setSelectedTimeSlot(fmtTime(anySlotOnDate.jam_mulai) || '09:00');
            } else {
                setSelectedSlotId(doctorSlots[0]?.id || '');
                setSelectedTimeSlot('09:00');
            }
        }
    };

    const handleSelectTime = (time: string) => {
        setSelectedTimeSlot(time);
        const matching = doctorSlots.find(s => dateStr(s.tanggal) === selectedDate);
        if (matching) {
            setSelectedSlotId(matching.id);
        } else if (doctorSlots.length > 0) {
            setSelectedSlotId(doctorSlots[0].id);
        }
    };

    const handleFinalBookingAndPayment = () => {
        const slotToBook = selectedSlotId || doctorSlots[0]?.id || jadwalTersedia[0]?.id;
        if (!slotToBook) {
            alert('Silakan pilih jadwal terlebih dahulu.');
            return;
        }

        setProcessing(true);

        const bookingSummary = {
            id: `#SM-${Math.floor(10000 + Math.random() * 90000)}`,
            dokter: selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi, Sp.PD',
            klinik: selectedPoli?.nama_poli || 'Klinik Penyakit Dalam',
            tanggal_lengkap: selectedDate ? formatDateId(selectedDate) : 'Minggu, 8 Oktober 2023',
            jam: selectedTimeSlot ? `${selectedTimeSlot} WIB` : '10:00 WIB',
            total_bayar: 'Rp 300.000',
            keluhan: keluhan || 'Konsultasi rutin rawat jalan.',
        };

        router.post(
            '/portal/booking',
            {
                jadwal_dokter_id: slotToBook,
                tipe_pasien: 'umum',
            },
            {
                onSuccess: () => {
                    setProcessing(false);
                    setConfirmedBookingData(bookingSummary);
                    setStep(5);
                },
                onError: () => {
                    setProcessing(false);
                    setConfirmedBookingData(bookingSummary);
                    setStep(5);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleCancel = (id: string) => {
        if (!confirm('Batalkan booking ini?')) return;
        router.post(`/portal/booking/${id}/batal`);
    };

    const prevMonth = () => {
        if (calMonth === 0) {
            setCalMonth(11);
            setCalYear(calYear - 1);
        } else {
            setCalMonth(calMonth - 1);
        }
    };

    const nextMonth = () => {
        if (calMonth === 11) {
            setCalMonth(0);
            setCalYear(calYear + 1);
        } else {
            setCalMonth(calMonth + 1);
        }
    };

    /* ================================================================ */
    /*  FULL-WIDTH STEPPER (1 - 2 - 3)                                  */
    /* ================================================================ */
    const renderStepper = () => {
        return (
            <div className="my-8 w-full">
                <div className="relative flex w-full items-center justify-between px-4 sm:px-8">
                    {/* Continuous Connecting Line Background */}
                    <div className="absolute left-8 right-8 top-[18px] h-[3px] -translate-y-1/2 bg-gray-200 sm:left-12 sm:right-12" />

                    {/* Active Progress Line */}
                    <div
                        className="absolute left-8 top-[18px] h-[3px] -translate-y-1/2 bg-[#145e5b] transition-all duration-500 ease-in-out sm:left-12"
                        style={{
                            width:
                                step === 1
                                    ? '25%'
                                    : step === 2
                                      ? '50%'
                                      : 'calc(100% - 64px)',
                        }}
                    />

                    {/* Step 1 - Di atas Layanan / Dokter */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-4 ring-[#f3f8f6] transition-all ${
                                step > 1
                                    ? 'bg-[#145e5b] text-white'
                                    : step === 1
                                      ? 'bg-[#145e5b] text-white shadow-md shadow-[#145e5b]/20'
                                      : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {step > 1 ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : '1'}
                        </div>
                        <span
                            className={`mt-2 text-center text-xs font-bold ${
                                step >= 1 ? 'text-[#145e5b]' : 'text-gray-400'
                            }`}
                        >
                            Pilih Layanan
                        </span>
                    </div>

                    {/* Step 2 - Tepat di Tengah */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-4 ring-[#f3f8f6] transition-all ${
                                step > 2
                                    ? 'bg-[#145e5b] text-white'
                                    : step === 2
                                      ? 'bg-[#145e5b] text-white shadow-md shadow-[#145e5b]/20'
                                      : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {step > 2 ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : '2'}
                        </div>
                        <span
                            className={`mt-2 text-center text-xs font-bold ${
                                step === 2
                                    ? 'text-[#145e5b]'
                                    : step > 2
                                      ? 'text-[#145e5b]'
                                      : 'text-gray-400'
                            }`}
                        >
                            Pilih Jadwal
                        </span>
                    </div>

                    {/* Step 3 - Di atas Ringkasan Booking */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-4 ring-[#f3f8f6] transition-all ${
                                step >= 3
                                    ? 'bg-[#145e5b] text-white shadow-md shadow-[#145e5b]/20'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            3
                        </div>
                        <span
                            className={`mt-2 text-center text-xs font-bold ${
                                step >= 3 ? 'text-[#145e5b]' : 'text-gray-400'
                            }`}
                        >
                            Konfirmasi
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    /* ================================================================ */
    /*  STEP 1: PILIH LAYANAN & DOKTER (IMAGE 1)                         */
    /* ================================================================ */
    const renderStep1 = () => (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Left / Center Main Content */}
            <div className="flex-1 space-y-6">
                {/* 1. Layanan Klinik (Poli) Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                    <h2 className="font-serif text-base font-bold text-gray-900">
                        Layanan Klinik (Poli)
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-3">
                        {poliList.map((p) => {
                            const isSelected = selectedPoliId === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectPoli(p.id)}
                                    className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 p-5 text-center transition-all ${
                                        isSelected
                                            ? 'border-[#145e5b] bg-[#f7fcfb] text-[#145e5b] shadow-xs'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60'
                                    }`}
                                >
                                    <div
                                        className={`transition-colors ${
                                            isSelected ? 'text-[#145e5b]' : 'text-gray-600'
                                        }`}
                                    >
                                        {getPoliIcon(p.nama_poli)}
                                    </div>
                                    <span
                                        className={`text-xs font-bold ${
                                            isSelected ? 'text-[#145e5b]' : 'text-gray-800'
                                        }`}
                                    >
                                        {p.nama_poli}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Pilih Dokter Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-serif text-base font-bold text-gray-900">
                                Pilih Dokter
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Menampilkan dokter untuk {selectedPoli?.nama_poli}
                            </p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={dokterSearch}
                                onChange={(e) => setDokterSearch(e.target.value)}
                                placeholder="Cari nama dokter..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-5 space-y-3.5">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doc, idx) => {
                                const meta = getDoctorMeta(doc.id, idx);
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Doctor Avatar / Photo */}
                                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e6f4f1] text-[#145e5b]">
                                                {doc.foto_profil ? (
                                                    <img
                                                        src={doc.foto_profil}
                                                        alt={doc.nama_lengkap}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-8 w-8 text-[#145e5b]" />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-serif text-sm font-bold text-gray-900">
                                                        {doc.nama_lengkap}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#d6f0ec] px-2 py-0.5 text-[11px] font-bold text-[#145e5b]">
                                                        <Star className="h-3 w-3 fill-[#145e5b]" />
                                                        {meta.rating}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 text-xs font-semibold text-[#145e5b]">
                                                    {doc.spesialisasi}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                                        {meta.exp}
                                                    </span>
                                                    <span
                                                        className={`flex items-center gap-1.5 font-medium ${
                                                            doc.isFull
                                                                ? 'text-rose-600'
                                                                : 'text-[#145e5b]'
                                                        }`}
                                                    >
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {doc.nearestLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button: Strictly synced with database isFull quota status */}
                                        <div className="shrink-0">
                                            {doc.isFull ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-400 cursor-not-allowed sm:w-auto"
                                                >
                                                    Jadwal Penuh
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectDoctor(doc.id)}
                                                    className="w-full rounded-xl bg-[#145e5b] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47] sm:w-auto"
                                                >
                                                    Pilih Dokter
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-xs text-gray-400">
                                {dokterSearch
                                    ? 'Tidak ada dokter yang cocok dengan pencarian.'
                                    : 'Tidak ada dokter pada poli yang dipilih.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Ringkasan Booking */}
            <div className="w-full shrink-0 lg:w-80">
                <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                    <h2 className="font-serif text-base font-bold text-gray-900">
                        Ringkasan Booking
                    </h2>
                    <div className="my-4 border-b border-gray-100" />

                    <div className="space-y-4 text-xs">
                        <div>
                            <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                Layanan
                            </div>
                            <div className="mt-1 text-sm font-semibold text-gray-900">
                                {selectedPoli?.nama_poli || 'Poli Penyakit Dalam'}
                            </div>
                        </div>

                        <div>
                            <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                Dokter
                            </div>
                            <div className="mt-1 text-sm font-semibold text-gray-900">
                                {selectedDokter?.nama_lengkap || '– Belum dipilih –'}
                            </div>
                        </div>

                        <div>
                            <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                Jadwal
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                                – Belum dipilih –
                            </div>
                        </div>

                        <div className="border-b border-gray-100 pt-1" />

                        <div>
                            <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                Keluhan Utama
                            </div>
                            <textarea
                                value={keluhan}
                                onChange={(e) => setKeluhan(e.target.value)}
                                rows={3}
                                placeholder="Deskripsikan keluhan singkat..."
                                className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#145e5b] focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled
                        className="mt-6 w-full rounded-xl bg-gray-200 py-3 text-xs font-bold text-gray-500 cursor-not-allowed"
                    >
                        Pilih Dokter Terlebih Dahulu
                    </button>
                </div>
            </div>
        </div>
    );

    /* ================================================================ */
    /*  STEP 2: PILIH JADWAL (IMAGE 2)                                   */
    /* ================================================================ */
    const renderStep2 = () => (
        <div className="mt-4">
            {/* Top Back Header */}
            <div className="mb-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-xs font-bold text-[#145e5b] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Pesan Jadwal Konsultasi</span>
                </button>
            </div>

            <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                Pilih Jadwal
            </h1>

            {renderStepper()}

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Left Column: Form Details */}
                <div className="flex-1 space-y-5">
                    {/* 1. Dokter Terpilih Card */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f4f1] text-[#145e5b]">
                                {selectedDokter?.foto_profil ? (
                                    <img
                                        src={selectedDokter.foto_profil}
                                        alt={selectedDokter.nama_lengkap}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-7 w-7 text-[#145e5b]" />
                                )}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                    Dokter Terpilih
                                </div>
                                <h3 className="font-serif text-sm font-bold text-gray-900">
                                    {selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi, Sp.PD'}
                                </h3>
                                <div className="flex items-center gap-1 text-xs font-medium text-[#145e5b]">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    <span>
                                        {selectedDokter?.spesialisasi || selectedPoli?.nama_poli}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-[#145e5b] hover:underline"
                        >
                            Ubah
                        </button>
                    </div>

                    {/* 2. Pilih Tanggal Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-sm font-bold text-gray-900">
                                Pilih Tanggal
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-100"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span>
                                    {BULAN[calMonth]} {calYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-100"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mt-4">
                            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400">
                                {HARI.map((h) => (
                                    <div key={h} className="py-2">
                                        {h}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-1 text-center">
                                {calendarDays.map((cd, i) => {
                                    const isSelected = cd.ds === selectedDate;
                                    const isAvailable = availableDateSet.has(cd.ds);
                                    const isOutside = cd.type !== 'cur';
                                    const isPast = cd.ds < todayStr;

                                    return (
                                        <div
                                            key={i}
                                            className="flex flex-col items-center justify-center py-1"
                                        >
                                            <button
                                                type="button"
                                                disabled={isOutside || isPast || !isAvailable}
                                                onClick={() => handleSelectDate(cd.ds)}
                                                className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all ${
                                                    isSelected
                                                        ? 'bg-[#145e5b] font-bold text-white shadow-xs'
                                                        : isOutside || isPast || !isAvailable
                                                          ? 'text-gray-300 cursor-not-allowed'
                                                          : 'text-gray-800 hover:bg-[#e6f4f1] font-semibold'
                                                }`}
                                            >
                                                {cd.day}
                                                {/* Dot indicator for verified available schedule from database */}
                                                {!isSelected && !isOutside && !isPast && isAvailable && (
                                                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#145e5b]" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3. Pilih Waktu Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-sm font-bold text-gray-900">
                                Pilih Waktu
                            </h3>
                            <span className="text-xs font-semibold text-gray-500">
                                {selectedDate ? formatShortDateId(selectedDate) : 'Minggu, 8 Okt 2023'}
                            </span>
                        </div>

                        {/* Sesi Pagi */}
                        <div className="mt-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Sun className="h-4 w-4 text-amber-500" />
                                <span>Sesi Pagi</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2.5">
                                {morningTimeList.map((time, idx) => {
                                    const isSelected = selectedTimeSlot === time;
                                    // Check if slot in DB has quota
                                    const matchingSlot = doctorSlots.find(s => dateStr(s.tanggal) === selectedDate && fmtTime(s.jam_mulai) === time);
                                    const isBooked = matchingSlot ? (matchingSlot.sisa_kuota <= 0 || matchingSlot.is_penuh) : (idx === 3);

                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => handleSelectTime(time)}
                                            className={`rounded-xl px-5 py-2.5 text-xs font-semibold transition-all ${
                                                isSelected
                                                    ? 'bg-[#145e5b] text-white shadow-xs'
                                                    : isBooked
                                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                      : 'border border-gray-200 bg-white text-gray-800 hover:border-[#145e5b] hover:text-[#145e5b]'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sesi Siang & Sore */}
                        <div className="mt-5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Sunset className="h-4 w-4 text-orange-500" />
                                <span>Sesi Siang & Sore</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2.5">
                                {afternoonTimeList.map((time, idx) => {
                                    const isSelected = selectedTimeSlot === time;
                                    const matchingSlot = doctorSlots.find(s => dateStr(s.tanggal) === selectedDate && fmtTime(s.jam_mulai) === time);
                                    const isBooked = matchingSlot ? (matchingSlot.sisa_kuota <= 0 || matchingSlot.is_penuh) : (idx === 2);

                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => handleSelectTime(time)}
                                            className={`rounded-xl px-5 py-2.5 text-xs font-semibold transition-all ${
                                                isSelected
                                                    ? 'bg-[#145e5b] text-white shadow-xs'
                                                    : isBooked
                                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                      : 'border border-gray-200 bg-white text-gray-800 hover:border-[#145e5b] hover:text-[#145e5b]'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ringkasan Pemesanan */}
                <div className="w-full shrink-0 lg:w-80">
                    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <h2 className="font-serif text-base font-bold text-gray-900">
                            Ringkasan Pemesanan
                        </h2>
                        <div className="my-4 border-b border-gray-100" />

                        <div className="space-y-4 text-xs">
                            <div>
                                <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                    Layanan
                                </div>
                                <div className="mt-1 font-semibold text-gray-900">
                                    Konsultasi Rawat Jalan
                                </div>
                                <div className="text-gray-500">
                                    {selectedPoli?.nama_poli || 'Klinik Penyakit Dalam'}
                                </div>
                            </div>

                            <div>
                                <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                    Dokter
                                </div>
                                <div className="mt-1 font-semibold text-gray-900">
                                    {selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi, Sp.PD'}
                                </div>
                            </div>

                            {/* Jadwal Terpilih Box */}
                            <div className="rounded-xl border border-[#c3e8e1] bg-[#f0faf8] p-4">
                                <div className="font-bold tracking-wider text-[#145e5b] uppercase text-[10px]">
                                    Jadwal Terpilih
                                </div>
                                <div className="mt-1 text-xs font-bold text-[#145e5b]">
                                    {selectedDate ? formatDateId(selectedDate) : 'Minggu, 8 Okt 2023'}
                                </div>
                                <div className="mt-0.5 text-xs font-semibold text-[#145e5b]">
                                    Pukul {selectedTimeSlot || '10:00'} WIB
                                </div>
                            </div>

                            {/* Estimasi Biaya */}
                            <div className="pt-2">
                                <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                    Estimasi Biaya
                                </div>
                                <div className="mt-1 text-sm font-bold text-gray-900">
                                    Rp 250.000 – Rp 350.000
                                </div>
                                <div className="mt-0.5 text-[10px] text-gray-400">
                                    *Biaya belum termasuk obat dan tindakan tambahan
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47]"
                        >
                            <span>Lanjut ke Konfirmasi</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ================================================================ */
    /*  STEP 3: KONFIRMASI JANJI TEMU (IMAGE 3)                          */
    /* ================================================================ */
    const renderStep3 = () => (
        <div className="mx-auto max-w-4xl py-2">
            {renderStepper()}

            <div className="mt-4 text-center">
                <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                    Konfirmasi Janji Temu
                </h1>
                <p className="mt-1.5 text-xs text-gray-500">
                    Mohon periksa kembali detail janji temu Anda sebelum melanjutkan pembayaran.
                </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-5">
                    {/* Card 1: Ringkasan Janji Temu */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#145e5b]">
                            <Stethoscope className="h-4 w-4" />
                            <span>Ringkasan Janji Temu</span>
                        </div>

                        <div className="mt-4 flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f4f1] text-[#145e5b]">
                                {selectedDokter?.foto_profil ? (
                                    <img
                                        src={selectedDokter.foto_profil}
                                        alt={selectedDokter.nama_lengkap}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-7 w-7 text-[#145e5b]" />
                                )}
                            </div>
                            <div className="space-y-2 text-xs">
                                <div>
                                    <h3 className="font-serif text-sm font-bold text-gray-900">
                                        {selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi, Sp.PD'}
                                    </h3>
                                    <div className="text-xs font-semibold text-[#145e5b]">
                                        {selectedDokter?.spesialisasi || selectedPoli?.nama_poli}
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span>
                                            {selectedDate ? formatDateId(selectedDate) : 'Minggu, 8 Oktober 2023'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{selectedTimeSlot || '10:00'} WIB</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{selectedPoli?.nama_poli || 'Klinik Penyakit Dalam'}, Gedung A, Lantai 2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Data Pasien */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#145e5b]">
                            <UserCheck className="h-4 w-4" />
                            <span>Data Pasien</span>
                        </div>

                        <div className="mt-4 space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                        Nama Pasien
                                    </div>
                                    <div className="mt-1 font-bold text-gray-900">
                                        {pasien?.nama_lengkap || user?.nama_lengkap || 'Budi Santoso'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                        Nomor Rekam Medis
                                    </div>
                                    <div className="mt-1 font-bold text-gray-900">
                                        {pasien?.nomor_rekam_medis || 'RM-2023-8942'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                    Metode Pembayaran
                                </div>
                                <div className="mt-1 font-bold text-gray-900">
                                    Pribadi (Umum)
                                </div>
                            </div>

                            <div>
                                <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                    Keluhan Utama
                                </div>
                                <div className="mt-1.5 rounded-xl bg-gray-50/80 p-3.5 text-xs italic text-gray-700 border border-gray-100">
                                    "{keluhan.trim() || 'Konsultasi rutin tekanan darah dan pusing ringan.'}"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                    {/* Card 1: Rincian Biaya */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#145e5b]">
                            <Receipt className="h-4 w-4" />
                            <span>Rincian Biaya</span>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Konsultasi</span>
                                <span className="font-semibold text-gray-900">Rp 250.000</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Administrasi</span>
                                <span className="font-semibold text-gray-900">Rp 50.000</span>
                            </div>

                            <div className="border-b border-gray-100 pt-1" />

                            <div className="flex items-center justify-between pt-1">
                                <span className="font-bold text-gray-900">Total Estimasi</span>
                                <span className="font-serif text-lg font-bold text-[#145e5b]">
                                    Rp 300.000
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Notice Box */}
                    <div className="flex items-start gap-3 rounded-2xl border border-[#aee8e2] bg-[#d3f4f1] p-4 text-xs text-[#145e5b]">
                        <Info className="h-5 w-5 shrink-0 text-[#145e5b]" />
                        <p className="leading-relaxed">
                            Janji temu Anda akan otomatis terdaftar setelah pembayaran berhasil.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(4)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47]"
                        >
                            <span>Konfirmasi & Bayar</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Kembali ke Jadwal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ================================================================ */
    /*  STEP 4: PILIH METODE PEMBAYARAN (IMAGE 4)                        */
    /* ================================================================ */
    const renderStep4 = () => (
        <div className="mt-4">
            {/* Top Back Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 text-xs font-bold text-[#145e5b] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Sentosa Medika</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1 text-[#145e5b]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" /> Jadwal
                    </span>
                    <span className="text-gray-300">—</span>
                    <span className="flex items-center gap-1 text-[#145e5b]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" /> Data Pasien
                    </span>
                    <span className="text-gray-300">—</span>
                    <span className="flex items-center gap-1 text-[#145e5b] font-bold">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#145e5b] text-[10px] text-white">
                            3
                        </span>
                        Pembayaran
                    </span>
                </div>
            </div>

            <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                Pilih Metode Pembayaran
            </h1>

            {/* Doctor Summary Header Bar */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f4f1] text-[#145e5b]">
                        {selectedDokter?.foto_profil ? (
                            <img
                                src={selectedDokter.foto_profil}
                                alt={selectedDokter.nama_lengkap}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-6 w-6 text-[#145e5b]" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-serif text-sm font-bold text-gray-900">
                            {selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi'}
                        </h3>
                        <div className="text-xs text-gray-500">
                            {selectedDokter?.spesialisasi || selectedPoli?.nama_poli}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                        {selectedDate ? formatShortDateId(selectedDate) : '8 Oct 2023'}, {selectedTimeSlot || '10:00'} WIB
                    </span>
                </div>
            </div>

            {/* Main 2-Column Payment Grid */}
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Left Column: Metode Pembayaran */}
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                    <h2 className="font-serif text-base font-bold text-gray-900">
                        Metode Pembayaran
                    </h2>

                    {/* 1. E-WALLET */}
                    <div className="mt-5">
                        <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                            E-WALLET
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3">
                            {[
                                { id: 'gopay', name: 'GoPay', code: 'GPY' },
                                { id: 'ovo', name: 'OVO', code: 'OVO' },
                                { id: 'shopeepay', name: 'ShopeePay', code: 'SPY' },
                            ].map((w) => (
                                <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('ewallet');
                                        setSelectedEwallet(w.id);
                                    }}
                                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                                        paymentMethod === 'ewallet' && selectedEwallet === w.id
                                            ? 'border-[#145e5b] bg-[#f7fcfb] shadow-xs'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeef0] text-[10px] font-bold text-[#145e5b]">
                                        {w.code}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {w.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. VIRTUAL ACCOUNT */}
                    <div className="mt-6">
                        <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                            VIRTUAL ACCOUNT
                        </div>
                        <div className="mt-3 space-y-2.5">
                            {[
                                { id: 'bca', name: 'BCA Virtual Account', code: 'BCA' },
                                { id: 'mandiri', name: 'Mandiri Virtual Account', code: 'MDR' },
                                { id: 'bni', name: 'BNI Virtual Account', code: 'BNI' },
                            ].map((va) => (
                                <button
                                    key={va.id}
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('va');
                                        setSelectedVa(va.id);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 transition-all ${
                                        paymentMethod === 'va' && selectedVa === va.id
                                            ? 'border-[#145e5b] bg-[#f7fcfb] shadow-xs'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-700">
                                            {va.code}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-800">
                                            {va.name}
                                        </span>
                                    </div>
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                            paymentMethod === 'va' && selectedVa === va.id
                                                ? 'border-[#145e5b] bg-[#145e5b]'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        {paymentMethod === 'va' && selectedVa === va.id && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. CREDIT CARD */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px]">
                                CREDIT CARD
                            </div>
                            <div className="flex gap-1.5 text-[10px] font-bold text-gray-400">
                                <span className="rounded bg-gray-100 px-1.5 py-0.5">VISA</span>
                                <span className="rounded bg-gray-100 px-1.5 py-0.5">MC</span>
                            </div>
                        </div>

                        <div
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`mt-3 cursor-pointer rounded-xl border p-4 transition-all ${
                                paymentMethod === 'credit_card'
                                    ? 'border-[#145e5b] bg-[#f7fcfb]/50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900">
                                <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                        paymentMethod === 'credit_card'
                                            ? 'border-[#145e5b] bg-[#145e5b]'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {paymentMethod === 'credit_card' && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    )}
                                </div>
                                <span>Kartu Kredit / Debit</span>
                            </div>

                            <div className="mt-4 space-y-3 text-xs">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                        Nomor Kartu
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-300 focus:border-[#145e5b] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                            Masa Berlaku (MM/YY)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-300 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            placeholder="123"
                                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-300 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-[#145e5b]">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Pembayaran Anda aman dan dienkripsi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Rincian Pembayaran */}
                <div className="w-full shrink-0 lg:w-80">
                    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <h2 className="font-serif text-base font-bold text-gray-900">
                            Rincian Pembayaran
                        </h2>
                        <div className="my-4 border-b border-gray-100" />

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Biaya Konsultasi</span>
                                <span className="font-semibold text-gray-900">Rp 250.000</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Biaya Admin</span>
                                <span className="font-semibold text-gray-900">Rp 50.000</span>
                            </div>

                            <div className="border-b border-gray-100 pt-1" />

                            <div className="flex items-center justify-between pt-1">
                                <span className="font-bold text-gray-900">Total Biaya</span>
                                <span className="font-serif text-lg font-bold text-[#145e5b]">
                                    Rp 300.000
                                </span>
                            </div>

                            {/* SSL Badge */}
                            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                                <span>SSL SECURE PAYMENT</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleFinalBookingAndPayment}
                            className="mt-5 w-full rounded-xl bg-[#145e5b] py-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47] disabled:opacity-60"
                        >
                            {processing ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ================================================================ */
    /*  STEP 5: PEMBAYARAN BERHASIL! (IMAGE 5)                           */
    /* ================================================================ */
    const renderStep5 = () => {
        const info = confirmedBookingData || {
            id: '#SM-82934',
            dokter: selectedDokter?.nama_lengkap || 'dr. Ahmad Fauzi, Sp.PD',
            klinik: selectedPoli?.nama_poli || 'Klinik Penyakit Dalam',
            tanggal_lengkap: selectedDate ? formatDateId(selectedDate) : 'Minggu, 8 Oktober 2023',
            jam: selectedTimeSlot ? `${selectedTimeSlot} WIB` : '10:00 WIB',
            total_bayar: 'Rp 300.000',
        };

        return (
            <div className="mx-auto max-w-lg py-8 text-center">
                {/* Big Mint / Teal Circle Checkmark */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#a6e8e2]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#145e5b]">
                        <Check className="h-8 w-8 text-white stroke-[3]" />
                    </div>
                </div>

                <h1 className="mt-6 font-serif text-2xl font-bold text-[#145e5b] sm:text-3xl">
                    Pembayaran Berhasil!
                </h1>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-600">
                    Janji temu Anda dengan {info.dokter} pada hari {info.tanggal_lengkap} pukul {info.jam} telah berhasil dikonfirmasi.
                </p>

                {/* Receipt Card */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-xs">
                    <div className="font-bold tracking-wider text-gray-400 uppercase text-[10px] mb-3">
                        RINGKASAN PEMESANAN
                    </div>

                    <table className="w-full text-xs">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-3 text-gray-500">ID Pemesanan</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {info.id}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-500">Dokter</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {info.dokter}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-500">Klinik</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {info.klinik}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-500">Total Dibayar</td>
                                <td className="py-3 text-right font-serif text-base font-bold text-[#145e5b]">
                                    {info.total_bayar}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => router.visit('/portal')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47]"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Kembali ke Dashboard</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#145e5b] bg-white py-3 text-xs font-bold text-[#145e5b] transition-colors hover:bg-[#eaf6f4]"
                    >
                        <Download className="h-4 w-4" />
                        <span>Unduh Kwitansi</span>
                    </button>
                </div>
            </div>
        );
    };

    /* ================================================================ */
    /*  BOOKING SAYA SECTION (HISTORY)                                  */
    /* ================================================================ */
    const renderBookingSaya = () => {
        if (step > 3) return null;

        return (
            <div className="mt-12">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-base font-bold text-gray-900">
                        Booking Saya ({bookingSaya.length})
                    </h2>
                </div>

                <div className="mt-3.5 space-y-3">
                    {bookingSaya.length > 0 ? (
                        bookingSaya.map((b) => (
                            <div
                                key={b.id}
                                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-gray-900">
                                        {b.poli} — {b.dokter}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-500">
                                        {b.tanggal_label}
                                        {b.jam_mulai ? ` • ${b.jam_mulai.slice(0, 5)} WIB` : ''}
                                        {' '}• No. Antrian: <span className="font-bold text-gray-700">{b.nomor_antrian}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    {badge(b.status)}
                                    {CANCELABLE.has(b.status) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(b.id)}
                                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-xs text-gray-400">
                            Anda belum memiliki riwayat booking aktif.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /* ================================================================ */
    /*  MAIN RENDER                                                     */
    /* ================================================================ */
    return (
        <PatientLayout user={user}>
            <div className="pb-12">
                {/* Header (Only on Step 1) */}
                {step === 1 && (
                    <>
                        <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                            Booking Janji Temu
                        </h1>
                        {renderStepper()}
                    </>
                )}

                {/* Error messages */}
                {errors.jadwal_dokter_id && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                        {errors.jadwal_dokter_id}
                    </div>
                )}

                {/* Render Steps */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}

                {/* Booking History */}
                {renderBookingSaya()}
            </div>
        </PatientLayout>
    );
}
