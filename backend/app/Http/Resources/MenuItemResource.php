<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'kategori' => $this->kategori,
            'harga' => $this->harga,
            'foto_url' => $this->foto_url,
            'has_varian' => $this->has_varian,
            'is_habis' => $this->is_habis,
        ];
    }
}
