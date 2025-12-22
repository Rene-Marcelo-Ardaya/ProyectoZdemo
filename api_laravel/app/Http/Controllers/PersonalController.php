<?php

namespace App\Http\Controllers;

use App\Models\Personal;
use App\Models\Cargo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PersonalController extends Controller
{
    /**
     * Listar personal activo
     */
    public function index()
    {
        $personal = Personal::with('cargo:id,nombre')
            ->where('estado', 'activo') // Solo mostrar activos
            ->orderBy('apellido_paterno')
            ->orderBy('nombre')
            ->get()
            ->map(function ($empleado) {
                return [
                    'id' => $empleado->id,
                    'nombre' => $empleado->nombre,
                    'apellido_paterno' => $empleado->apellido_paterno,
                    'apellido_materno' => $empleado->apellido_materno,
                    'nombre_completo' => $empleado->nombre_completo,
                    'ci' => $empleado->ci,
                    'cargo_id' => $empleado->cargo_id,
                    'cargo_nombre' => $empleado->cargo->nombre ?? '-',
                    'fecha_ingreso' => $empleado->fecha_ingreso?->format('Y-m-d'),
                    'telefono' => $empleado->telefono,
                    'email' => $empleado->email,
                    'created_at' => $empleado->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $personal
        ]);
    }

    /**
     * Obtener un empleado específico
     */
    public function show($id)
    {
        $empleado = Personal::with('cargo:id,nombre')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $empleado->id,
                'nombre' => $empleado->nombre,
                'apellido_paterno' => $empleado->apellido_paterno,
                'apellido_materno' => $empleado->apellido_materno,
                'ci' => $empleado->ci,
                'fecha_nacimiento' => $empleado->fecha_nacimiento?->format('Y-m-d'),
                'genero' => $empleado->genero,
                'direccion' => $empleado->direccion,
                'telefono' => $empleado->telefono,
                'email' => $empleado->email,
                'cargo_id' => $empleado->cargo_id,
                'fecha_ingreso' => $empleado->fecha_ingreso?->format('Y-m-d'),
                'fecha_salida' => $empleado->fecha_salida?->format('Y-m-d'),
                'salario' => $empleado->salario,
                'tipo_contrato' => $empleado->tipo_contrato,
                'observaciones' => $empleado->observaciones,
                'user_id' => $empleado->user_id,
                'has_pin' => !empty($empleado->pin), // Indicar si tiene PIN
            ]
        ]);
    }

    /**
     * Crear nuevo empleado
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20|unique:personal,ci',
            'pin' => 'required|string|min:4|max:4',
            'pin_confirmation' => 'required|same:pin',
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'cargo_id' => 'required|exists:cargos,id',
            'fecha_ingreso' => 'required|date',
            'fecha_salida' => 'nullable|date|after:fecha_ingreso',
            'salario' => 'nullable|numeric|min:0',
            'tipo_contrato' => 'nullable|string|max:50',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id|unique:personal,user_id',
        ]);

        // Hashear PIN
        $validated['pin'] = Hash::make($validated['pin']);
        unset($validated['pin_confirmation']);
        
        // Siempre activo al crear
        $validated['estado'] = 'activo';

        $empleado = Personal::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Empleado creado correctamente',
            'data' => $empleado
        ], 201);
    }

    /**
     * Actualizar empleado
     */
    public function update(Request $request, $id)
    {
        $empleado = Personal::findOrFail($id);

        $rules = [
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20|unique:personal,ci,' . $empleado->id,
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'cargo_id' => 'required|exists:cargos,id',
            'fecha_ingreso' => 'required|date',
            'fecha_salida' => 'nullable|date|after:fecha_ingreso',
            'salario' => 'nullable|numeric|min:0',
            'tipo_contrato' => 'nullable|string|max:50',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id|unique:personal,user_id,' . $empleado->id,
        ];

        // PIN solo se valida si se envía
        if ($request->filled('pin')) {
            $rules['pin'] = 'string|min:4|max:4';
            $rules['pin_confirmation'] = 'required|same:pin';
        }

        $validated = $request->validate($rules);

        // Hashear PIN si se cambió
        if (isset($validated['pin'])) {
            $validated['pin'] = Hash::make($validated['pin']);
            unset($validated['pin_confirmation']);
        }

        $empleado->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Empleado actualizado correctamente'
        ]);
    }

    /**
     * Desactivar empleado (soft delete)
     */
    public function destroy($id)
    {
        $empleado = Personal::findOrFail($id);
        $empleado->update(['estado' => 'inactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Empleado desactivado correctamente'
        ]);
    }

    /**
     * Obtener estadísticas de personal
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Personal::count(),
                'activos' => Personal::where('estado', 'activo')->count(),
                'inactivos' => Personal::where('estado', 'inactivo')->count(),
            ]
        ]);
    }
}
