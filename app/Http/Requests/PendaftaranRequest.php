<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PendaftaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'pasien_id' => [$isUpdate ? 'sometimes' : 'required', 'uuid', 'exists:pasien,id'],
            'jenis_layanan' => [$isUpdate ? 'sometimes' : 'required', 'in:rawat_jalan,rawat_inap,igd'],
            'dokter_id' => ['nullable', 'uuid', 'exists:dokters,id'],
            'poli_id' => ['nullable', 'required_if:jenis_layanan,rawat_jalan', 'uuid', 'exists:poli,id'],
            'ruangan_id' => ['nullable', 'required_if:jenis_layanan,rawat_inap', 'uuid', 'exists:ruangan,id'],
            'tanggal_pendaftaran' => ['nullable', 'date'],
            'keluhan' => ['nullable', 'string', 'max:2000'],
            'penjamin' => [$isUpdate ? 'sometimes' : 'required', 'in:umum,bpjs,asuransi'],
            'nomor_penjamin' => ['nullable', 'required_unless:penjamin,umum', 'string', 'max:50'],
            'prioritas' => ['nullable', 'required_if:jenis_layanan,igd', 'in:normal,urgent,emergency'],
            'catatan_pendaftaran' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pasien_id.required' => 'ID pasien wajib diisi.',
            'pasien_id.exists' => 'Pasien tidak ditemukan.',
            'jenis_layanan.required' => 'Jenis layanan wajib diisi.',
            'jenis_layanan.in' => 'Jenis layanan harus berupa: rawat_jalan, rawat_inap, atau igd.',
            'poli_id.required_if' => 'Poli tujuan wajib diisi untuk rawat jalan.',
            'poli_id.exists' => 'Poli tidak ditemukan.',
            'ruangan_id.required_if' => 'Ruangan wajib diisi untuk rawat inap.',
            'ruangan_id.exists' => 'Ruangan tidak ditemukan.',
            'dokter_id.exists' => 'Dokter tidak ditemukan.',
            'penjamin.required' => 'Penjamin wajib diisi.',
            'penjamin.in' => 'Penjamin harus berupa: umum, bpjs, atau asuransi.',
            'nomor_penjamin.required_unless' => 'Nomor penjamin wajib diisi untuk penjamin BPJS/asuransi.',
            'prioritas.required_if' => 'Prioritas wajib diisi untuk layanan IGD.',
            'prioritas.in' => 'Prioritas harus berupa: normal, urgent, atau emergency.',
        ];
    }
}
