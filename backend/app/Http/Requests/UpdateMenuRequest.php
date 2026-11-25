<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('nama')) {
            $this->merge([
                'nama' => trim(strip_tags((string) $this->input('nama'))),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'nama' => ['sometimes', 'string', 'min:3', 'max:60'],
            'kategori' => ['sometimes', Rule::in(['kopi', 'non_kopi', 'makanan', 'camilan'])],
            'harga' => ['sometimes', 'integer', 'between:1000,1000000'],
            'has_varian' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.min' => 'Nama menu harus 3 sampai 60 karakter.',
            'nama.max' => 'Nama menu harus 3 sampai 60 karakter.',
            'kategori.in' => 'Kategori menu tidak valid.',
            'harga.integer' => 'Harga harus berupa bilangan bulat.',
            'harga.between' => 'Harga harus Rp 1.000 sampai Rp 1.000.000.',
            'has_varian.boolean' => 'Status varian tidak valid.',
        ];
    }
}
