<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Http\Requests\UpdateMenuStatusRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return MenuItemResource::collection(
            MenuItem::query()->orderBy('id')->get(),
        );
    }

    public function store(StoreMenuRequest $request): JsonResponse
    {
        $data = $request->validated();

        $menuItem = MenuItem::create([
            'nama' => $data['nama'],
            'kategori' => $data['kategori'],
            'harga' => $data['harga'],
            'foto_url' => null,
            'has_varian' => $data['has_varian'] ?? false,
            'is_habis' => $data['is_habis'] ?? false,
        ]);

        return (new MenuItemResource($menuItem))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateMenuRequest $request, MenuItem $menuItem): MenuItemResource
    {
        $menuItem->update($request->validated());

        return new MenuItemResource($menuItem);
    }

    public function updateStatus(
        UpdateMenuStatusRequest $request,
        MenuItem $menuItem,
    ): MenuItemResource {
        $menuItem->update([
            'is_habis' => $request->boolean('is_habis'),
        ]);

        return new MenuItemResource($menuItem);
    }
}
