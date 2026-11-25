<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $email = (string) $request->string('email');
        $password = (string) $request->string('password');

        $user = User::query()
            ->where('email', $email)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Email atau kata sandi salah',
            ], 401);
        }

        $token = $user->createToken('kovita-pos')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Keluar berhasil.',
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
