<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SalesReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'periode' => ['required', Rule::in(['harian', 'bulanan'])],
            'tanggal' => [
                'nullable',
                'date_format:Y-m-d',
                Rule::requiredIf(fn () => $this->input('periode') === 'harian'),
            ],
            'bulan' => [
                'nullable',
                'date_format:Y-m',
                Rule::requiredIf(fn () => $this->input('periode') === 'bulanan'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'periode.required' => 'Periode laporan wajib dipilih.',
            'periode.in' => 'Periode laporan tidak valid.',
            'tanggal.required' => 'Tanggal laporan wajib diisi.',
            'tanggal.date_format' => 'Format tanggal laporan tidak valid.',
            'bulan.required' => 'Bulan laporan wajib diisi.',
            'bulan.date_format' => 'Format bulan laporan tidak valid.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $now = now($timezone);

            if ($this->input('periode') === 'harian') {
                $date = Carbon::createFromFormat(
                    'Y-m-d',
                    (string) $this->input('tanggal'),
                    $timezone,
                )->startOfDay();
                $minimum = $now->copy()->subMonthsNoOverflow(2)->startOfDay();

                if ($date->lt($minimum) || $date->gt($now->copy()->endOfDay())) {
                    $validator->errors()->add(
                        'tanggal',
                        'Tanggal berada di luar periode 2 bulan terakhir.',
                    );
                }

                return;
            }

            $month = Carbon::createFromFormat(
                'Y-m-d',
                $this->input('bulan').'-01',
                $timezone,
            )->startOfMonth();
            $minimumMonth = $now->copy()->subMonthsNoOverflow(2)->startOfMonth();
            $maximumMonth = $now->copy()->startOfMonth();

            if ($month->lt($minimumMonth) || $month->gt($maximumMonth)) {
                $validator->errors()->add(
                    'bulan',
                    'Bulan berada di luar periode 2 bulan terakhir.',
                );
            }
        });
    }
}
