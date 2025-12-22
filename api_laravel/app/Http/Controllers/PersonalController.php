<?php

namespace App\Http\Controllers;

use App\Models\Personal;
use App\Models\Cargo;
use Illuminate\Http\Request;

class PersonalController extends Controller
{
    /**
     * Listar todo el personal
     */
    public function index()
    {
        $personal = Personal::with('cargo:id,nombre')
            ->orderBy('apellido_paterno')
            ->orderBy('nombre')
            ->get()
            ->map(function ($empleado) {
                return [
                    'id' => $empleado->id,
                    'codigo_empleado' => $empleado->codigo_empleado,
                    'nombre' => $empleado->nombre,
                    'apellido_paterno' => $empleado->apellido_paterno,
                    'apellido_materno' => $empleado->apellido_materno,
                    'nombre_completo' => $empleado->nombre_completo,
                    'ci' => $empleado->ci,
                    'cargo_id' => $empleado->cargo_id,
                    'cargo_nombre' => $empleado->cargo->nombre ?? '-',
                    'fecha_ingreso' => $empleado->fecha_ingreso?->format('Y-m-d'),
                    'estado' => $empleado->estado,
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
                'codigo_empleado' => $empleado->codigo_empleado,
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
                'estado' => $empleado->estado,
                'observaciones' => $empleado->observaciones,
                'user_id' => $empleado->user_id,
            ]
        ]);
    }

    /**
     * Crear nuevo empleado
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_empleado' => 'required|string|max:20|unique:personal,codigo_empleado',
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20|unique:personal,ci',
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
            'estado' => 'nullable|in:activo,inactivo,licencia,vacaciones',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id|unique:personal,user_id',
        ]);

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

        $validated = $request->validate([
            'codigo_empleado' => 'required|string|max:20|unique:personal,codigo_empleado,' . $empleado->id,
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
            'estado' => 'nullable|in:activo,inactivo,licencia,vacaciones,baja_medica',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id|unique:personal,user_id,' . $empleado->id,
        ]);

        $empleado->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Empleado actualizado correctamente'
        ]);
    }

    /**
     * Eliminar empleado
     */
    public function destroy($id)
    {
        $empleado = Personal::findOrFail($id);
        $empleado->delete();

        return response()->json([
            'success' => true,
            'message' => 'Empleado eliminado correctamente'
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
                'licencia' => Personal::where('estado', 'licencia')->count(),
                'vacaciones' => Personal::where('estado', 'vacaciones')->count(),
            ]
        ]);
    }
}
