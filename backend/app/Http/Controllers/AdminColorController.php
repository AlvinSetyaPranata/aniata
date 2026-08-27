<?php

namespace App\Http\Controllers;

use App\Models\Color;
use Illuminate\Http\Request;

class AdminColorController extends Controller
{
    public function index()
    {
        return Color::orderBy('name')->get(['id', 'name']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $color = Color::firstOrCreate(['name' => $data['name']]);

        return response()->json($color, 201);
    }

    public function destroy(Color $color)
    {
        $color->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
}
