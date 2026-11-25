<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddonResource;
use App\Models\Addon;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddonController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return AddonResource::collection(
            Addon::query()->orderBy('id')->get(),
        );
    }
}
