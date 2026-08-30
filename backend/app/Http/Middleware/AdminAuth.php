<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user('sanctum')) {
            return response()->json(['message' => 'Tidak terautentikasi. Silakan masuk kembali.'], 401);
        }

        return $next($request);
    }
}
