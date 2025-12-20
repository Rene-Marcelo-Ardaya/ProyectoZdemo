<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use App\Models\PersonaWhatsapp;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class WhatsappVerificationController extends Controller
{
    /**
     * Base URL y API Key de Evolution API
     */
    private function getEvolutionConfig(): array
    {
        return [
            'url' => env('EVOLUTION_API_URL', 'http://localhost:8080'),
            'key' => env('EVOLUTION_API_KEY', ''),
        ];
    }

    /**
     * Obtener estado de verificación WhatsApp de una persona
     */
    public function status(int $personalId): JsonResponse
    {
        $persona = Persona::with('whatsapp')->findOrFail($personalId);
        
        return response()->json([
            'personal_id' => $personalId,
            'has_whatsapp' => $persona->whatsapp !== null,
            'status' => $persona->whatsapp?->status ?? 'none',
            'verified_at' => $persona->whatsapp?->verified_at,
            'whatsapp_jid' => $persona->whatsapp?->whatsapp_jid,
        ]);
    }

    /**
     * Enviar código de verificación por WhatsApp
     */
    public function sendCode(Request $request, int $personalId): JsonResponse
    {
        $request->validate([
            'instance_name' => 'required|string',
        ]);

        $persona = Persona::findOrFail($personalId);

        if (!$persona->celular) {
            return response()->json(['error' => 'La persona no tiene número de celular'], 400);
        }

        // Crear o actualizar registro de WhatsApp
        $whatsapp = PersonaWhatsapp::firstOrNew(['personal_id' => $personalId]);
        $code = $whatsapp->generateCode();
        $whatsapp->instance_name = $request->instance_name;
        $whatsapp->save();

        // Preparar número de teléfono
        $phoneNumber = $persona->codigo_pais . $persona->celular;

        // Enviar mensaje via Evolution API
        $config = $this->getEvolutionConfig();
        
        try {
            $response = Http::timeout(10)->withHeaders([
                'apikey' => $config['key'],
                'Content-Type' => 'application/json',
            ])->post("{$config['url']}/message/sendText/{$request->instance_name}", [
                'number' => $phoneNumber,
                'text' => "Tu código de verificación es: {$code}",
            ]);
        } catch (\Exception $e) {
            $whatsapp->status = PersonaWhatsapp::STATUS_FAILED;
            $whatsapp->save();
            
            return response()->json([
                'error' => 'Error de conexión con Evolution API',
                'exception' => $e->getMessage(),
                'evolution_url' => $config['url'],
            ], 500);
        }

        if ($response->failed()) {
            $whatsapp->status = PersonaWhatsapp::STATUS_FAILED;
            $whatsapp->save();

            return response()->json([
                'error' => 'Error al enviar mensaje',
                'details' => $response->json(),
                'evolution_url' => "{$config['url']}/message/sendText/{$request->instance_name}",
                'phone' => $phoneNumber,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Código de verificación enviado',
            'status' => $whatsapp->status,
            'sent_at' => $whatsapp->verification_sent_at,
        ]);
    }

    /**
     * Verificar código recibido y guardar JID
     * Este endpoint será llamado cuando se reciba un mensaje con el código
     */
    public function verify(Request $request, int $personalId): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:4',
            'whatsapp_jid' => 'required|string',
        ]);

        $whatsapp = PersonaWhatsapp::where('personal_id', $personalId)->first();

        if (!$whatsapp) {
            return response()->json(['error' => 'No hay verificación pendiente'], 404);
        }

        if ($whatsapp->status === PersonaWhatsapp::STATUS_VERIFIED) {
            return response()->json(['error' => 'Ya está verificado'], 400);
        }

        if ($whatsapp->verifyCode($request->code, $request->whatsapp_jid)) {
            $whatsapp->save();

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp verificado correctamente',
                'whatsapp_jid' => $whatsapp->whatsapp_jid,
                'verified_at' => $whatsapp->verified_at,
            ]);
        }

        return response()->json([
            'error' => 'Código incorrecto',
        ], 400);
    }

    /**
     * Resetear verificación para volver a intentar
     */
    public function reset(int $personalId): JsonResponse
    {
        $whatsapp = PersonaWhatsapp::where('personal_id', $personalId)->first();

        if ($whatsapp) {
            $whatsapp->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Verificación reseteada',
        ]);
    }
}
