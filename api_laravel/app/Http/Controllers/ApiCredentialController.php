<?php

namespace App\Http\Controllers;

use App\Models\ApiCredential;
use App\Models\ApiCredentialAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ApiCredentialController extends Controller
{
    /**
     * Verificar si el usuario es superadmin
     */
    private function isSuperAdmin($user): bool
    {
        if (!$user) return false;
        
        return $user->roles()
            ->where(function($q) {
                $q->where('slug', 'super-admin')
                  ->orWhere('slug', 'admin')
                  ->orWhere('name', 'like', '%Admin%')
                  ->orWhere('name', 'like', '%Super%');
            })
            ->exists();
    }

    /**
     * Verificar acceso de superadmin
     */
    private function checkAccess(Request $request)
    {
        if (!$this->isSuperAdmin($request->user())) {
            abort(403, 'Acceso denegado. Solo SuperAdmin puede acceder a esta sección.');
        }
    }

    /**
     * Listar todos los proveedores y sus credenciales
     */
    public function index(Request $request)
    {
        $this->checkAccess($request);

        $credentials = ApiCredential::all()
            ->groupBy('provider')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'key_name' => $item->key_name,
                        'value' => $item->is_secret ? $item->masked_value : $item->value,
                        'is_secret' => $item->is_secret,
                        'is_active' => $item->is_active,
                        'label' => $item->label,
                        'description' => $item->description,
                        'updated_at' => $item->updated_at,
                    ];
                });
            });

        return response()->json([
            'success' => true,
            'data' => $credentials
        ]);
    }

    /**
     * Obtener credenciales de un proveedor específico
     */
    public function show(Request $request, string $provider)
    {
        $this->checkAccess($request);

        $credentials = ApiCredential::where('provider', $provider)->get();

        if ($credentials->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'Proveedor no encontrado'
            ], 404);
        }

        $data = $credentials->map(function ($item) {
            return [
                'id' => $item->id,
                'key_name' => $item->key_name,
                'value' => $item->is_secret ? $item->masked_value : $item->value,
                'raw_value' => $item->value, // Para edición - solo SuperAdmin puede ver
                'is_secret' => $item->is_secret,
                'is_active' => $item->is_active,
                'label' => $item->label,
                'description' => $item->description,
            ];
        })->keyBy('key_name');

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Actualizar credenciales de un proveedor
     */
    public function update(Request $request, string $provider)
    {
        $this->checkAccess($request);

        $validated = $request->validate([
            'credentials' => 'required|array',
            'credentials.*.key_name' => 'required|string',
            'credentials.*.value' => 'nullable|string',
        ]);

        $user = $request->user();
        $updated = [];

        foreach ($validated['credentials'] as $item) {
            $keyName = $item['key_name'];
            $newValue = $item['value'];

            // Obtener valor anterior para auditoría
            $existing = ApiCredential::where('provider', $provider)
                ->where('key_name', $keyName)
                ->first();
            
            $oldValue = $existing ? $existing->value : null;

            // Solo actualizar si el valor cambió y no es una máscara
            if ($newValue !== null && !preg_match('/^\*+\w{0,4}$/', $newValue)) {
                // Actualizar o crear
                $credential = ApiCredential::updateOrCreate(
                    ['provider' => $provider, 'key_name' => $keyName],
                    ['value' => $newValue]
                );

                // Registrar en auditoría
                ApiCredentialAuditLog::log(
                    $user->id,
                    $user->name,
                    $provider,
                    $keyName,
                    $existing ? 'update' : 'create',
                    $oldValue,
                    $newValue,
                    $request->ip(),
                    $request->userAgent()
                );

                $updated[] = $keyName;
            }
        }

        // Limpiar cache
        ApiCredential::clearCache($provider);

        return response()->json([
            'success' => true,
            'message' => 'Credenciales actualizadas correctamente',
            'updated' => $updated
        ]);
    }

    /**
     * Probar conexión con Pusher
     */
    public function testConnection(Request $request, string $provider)
    {
        $this->checkAccess($request);

        if ($provider !== 'pusher') {
            return response()->json([
                'success' => false,
                'error' => 'Prueba de conexión no disponible para este proveedor'
            ], 400);
        }

        try {
            $credentials = ApiCredential::getCredentials('pusher');
            
            $appId = $credentials['app_id'] ?? null;
            $appKey = $credentials['app_key'] ?? null;
            $appSecret = $credentials['app_secret'] ?? null;
            $cluster = $credentials['app_cluster'] ?? 'mt1';

            if (!$appId || !$appKey || !$appSecret) {
                return response()->json([
                    'success' => false,
                    'error' => 'Faltan credenciales de Pusher'
                ], 400);
            }

            // Probar autenticación con Pusher
            $stringToSign = "GET\n/apps/{$appId}/channels\nauth_key={$appKey}&auth_timestamp=" . time() . "&auth_version=1.0";
            $authSignature = hash_hmac('sha256', $stringToSign, $appSecret);

            // Hacer una petición simple a la API de Pusher
            $response = Http::timeout(5)->get("https://api-{$cluster}.pusher.com/apps/{$appId}/channels", [
                'auth_key' => $appKey,
                'auth_timestamp' => time(),
                'auth_version' => '1.0',
                'auth_signature' => $authSignature,
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Conexión con Pusher exitosa'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Error de autenticación con Pusher: ' . $response->status()
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error de conexión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener credenciales públicas para el frontend (solo keys no secretas)
     */
    public function getPublicCredentials(string $provider)
    {
        $credentials = ApiCredential::where('provider', $provider)
            ->where('is_active', true)
            ->where('is_secret', false)
            ->get();

        $data = [];
        foreach ($credentials as $cred) {
            $data[$cred->key_name] = $cred->value;
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
