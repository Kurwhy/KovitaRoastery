<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuUnavailableException extends Exception
{
    public function __construct(public readonly array $items)
    {
        $names = collect($items)->pluck('nama')->implode(', ');
        parent::__construct("Menu {$names} baru saja habis");
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'unavailable_items' => $this->items,
        ], 422);
    }
}
