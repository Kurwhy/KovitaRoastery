<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $items = collect($this->input('items', []))
            ->map(function ($item) {
                if (isset($item['catatan'])) {
                    $note = trim(strip_tags((string) $item['catatan']));
                    $item['catatan'] = $note === '' ? null : $note;
                }

                return $item;
            })
            ->all();

        $this->merge(['items' => $items]);
    }

    public function rules(): array
    {
        return [
            'tipe_pesanan' => ['required', Rule::in(['dine_in', 'takeaway'])],
            'nomor_meja' => [
                'nullable',
                'integer',
                'between:1,99',
                Rule::requiredIf(fn () => $this->input('tipe_pesanan') === 'dine_in'),
            ],
            'pb1_aktif' => ['required', 'boolean'],
            'metode_bayar' => ['required', Rule::in(['tunai', 'qris'])],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*' => ['required', 'array'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.suhu' => ['nullable', Rule::in(['hot', 'ice'])],
            'items.*.takaran_gula' => ['nullable', Rule::in(['normal', 'kurang', 'tanpa'])],
            'items.*.catatan' => ['nullable', 'string', 'max:150'],
            'items.*.qty' => ['required', 'integer', 'between:1,99'],
            'items.*.addon_ids' => ['sometimes', 'array'],
            'items.*.addon_ids.*' => ['integer', 'distinct', 'exists:addons,id'],
            'uang_diterima' => [
                'nullable',
                'integer',
                'min:0',
                'max:10000000',
                Rule::requiredIf(fn () => $this->input('metode_bayar') === 'tunai'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'tipe_pesanan.required' => 'Tipe pesanan wajib dipilih.',
            'tipe_pesanan.in' => 'Tipe pesanan tidak valid.',
            'nomor_meja.required' => 'Nomor meja wajib diisi untuk Dine-In.',
            'nomor_meja.integer' => 'Nomor meja harus berupa angka.',
            'nomor_meja.between' => 'Nomor meja harus 1 sampai 99.',
            'pb1_aktif.required' => 'Pilihan PB1 wajib diisi.',
            'pb1_aktif.boolean' => 'Pilihan PB1 tidak valid.',
            'metode_bayar.required' => 'Metode pembayaran wajib dipilih.',
            'metode_bayar.in' => 'Metode pembayaran tidak valid.',
            'items.required' => 'Keranjang tidak boleh kosong.',
            'items.array' => 'Daftar item tidak valid.',
            'items.min' => 'Keranjang tidak boleh kosong.',
            'items.max' => 'Keranjang maksimal 50 baris item.',
            'items.*.menu_item_id.required' => 'Menu item wajib diisi.',
            'items.*.menu_item_id.exists' => 'Menu tidak ditemukan.',
            'items.*.suhu.in' => 'Pilihan suhu tidak valid.',
            'items.*.takaran_gula.in' => 'Pilihan takaran gula tidak valid.',
            'items.*.catatan.max' => 'Catatan item maksimal 150 karakter.',
            'items.*.qty.required' => 'Jumlah item wajib diisi.',
            'items.*.qty.integer' => 'Jumlah item harus berupa angka.',
            'items.*.qty.between' => 'Jumlah item harus 1 sampai 99.',
            'items.*.addon_ids.*.exists' => 'Add-on tidak ditemukan.',
            'items.*.addon_ids.*.distinct' => 'Add-on tidak boleh dipilih dua kali.',
            'uang_diterima.required' => 'Uang diterima wajib diisi.',
            'uang_diterima.integer' => 'Uang diterima harus berupa angka.',
            'uang_diterima.min' => 'Uang diterima tidak valid.',
            'uang_diterima.max' => 'Uang diterima maksimal Rp 10.000.000.',
        ];
    }
}
