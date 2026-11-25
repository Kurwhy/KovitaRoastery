<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_habis' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_habis.required' => 'Status Habis wajib diisi.',
            'is_habis.boolean' => 'Status Habis tidak valid.',
        ];
    }
}
