<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Obtener configuraciones públicas (sin autenticación)
     * Usado por el frontend al cargar la app
     */
    public function getPublic()
    {
        return response()->json([
            'success' => true,
            'data' => Setting::getPublicSettings()
        ]);
    }

    /**
     * Obtener todas las configuraciones (requiere auth)
     * Usado en el panel de administración
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Setting::getAllGrouped()
        ]);
    }

    /**
     * Actualizar una configuración
     */
    public function update(Request $request, $key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json([
                'success' => false,
                'error' => 'Configuración no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'value' => 'nullable|string',
        ]);

        $setting->value = $validated['value'];
        $setting->save();
        
        Setting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Configuración actualizada'
        ]);
    }

    /**
     * Subir imagen (logo, favicon, etc.)
     */
    public function uploadImage(Request $request, $key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json([
                'success' => false,
                'error' => 'Configuración no encontrada'
            ], 404);
        }

        if ($setting->type !== 'image') {
            return response()->json([
                'success' => false,
                'error' => 'Esta configuración no acepta imágenes'
            ], 400);
        }

        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,svg,ico,webp|max:2048'
        ]);

        // Eliminar imagen anterior si existe
        if ($setting->value && Storage::disk('public')->exists($setting->value)) {
            Storage::disk('public')->delete($setting->value);
        }

        // Guardar nueva imagen
        $path = $request->file('image')->store('branding', 'public');
        
        $setting->value = $path;
        $setting->save();
        
        Setting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Imagen subida correctamente',
            'data' => [
                'path' => $path,
                'url' => asset('storage/' . $path)
            ]
        ]);
    }

    /**
     * Actualizar múltiples configuraciones a la vez
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string'
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        Setting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Configuraciones actualizadas'
        ]);
    }

    /**
     * Eliminar imagen de una configuración (borra archivo y limpia valor)
     */
    public function deleteImage($key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json([
                'success' => false,
                'error' => 'Configuración no encontrada'
            ], 404);
        }

        if ($setting->type !== 'image') {
            return response()->json([
                'success' => false,
                'error' => 'Esta configuración no es de tipo imagen'
            ], 400);
        }

        // Eliminar archivo si existe
        if ($setting->value && Storage::disk('public')->exists($setting->value)) {
            Storage::disk('public')->delete($setting->value);
        }

        // Limpiar valor
        $setting->value = null;
        $setting->save();
        
        Setting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada correctamente'
        ]);
    }

    /**
     * Servir imagen de branding vía API (alternativa a storage link)
     */
    public function getBrandingImage($filename)
    {
        $path = storage_path('app/public/branding/' . $filename);

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        return response()->file($path);
    }
}
