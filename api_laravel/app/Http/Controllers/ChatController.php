<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\MessageStatusUpdated;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Listar conversaciones del usuario autenticado.
     * Incluye contadores de mensajes no leídos.
     */
    public function index()
    {
        $user = Auth::user();
        $userId = $user->id;

        $conversations = $user->conversations()
            ->with(['users', 'messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->sortByDesc(function($conv) {
                return [$conv->is_group ? 1 : 0, $conv->updated_at];
            })
            ->values();

        // Formatear respuesta con contadores de no leídos
        $data = $conversations->map(function($conv) use ($userId) {
            $lastMessage = $conv->messages->first();
            
            // Contar mensajes no leídos (mensajes de otros usuarios con status != 'read')
            $unreadCount = Message::where('conversation_id', $conv->id)
                ->where('user_id', '!=', $userId)
                ->where('status', '!=', 'read')
                ->count();

            return [
                'id' => $conv->id,
                'name' => $conv->name,
                'is_group' => $conv->is_group,
                'users' => $conv->users->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email
                ]),
                'last_message' => $lastMessage ? [
                    'body' => $lastMessage->body,
                    'user_id' => $lastMessage->user_id,
                    'status' => $lastMessage->status,
                    'created_at' => $lastMessage->created_at
                ] : null,
                'unread_count' => $unreadCount,
                'updated_at' => $conv->updated_at,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Mostrar mensajes de una conversación.
     * Marca mensajes de otros como entregados.
     */
    public function show(Conversation $conversation)
    {
        $userId = Auth::id();
        
        // Verificar que el usuario pertenece a la conversación
        abort_unless($conversation->users()->where('user_id', $userId)->exists(), 403);

        // Marcar mensajes de otros como entregados
        Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $userId)
            ->where('status', 'sent')
            ->update([
                'status' => 'delivered',
                'delivered_at' => now()
            ]);

        $messages = $conversation->messages()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($msg) {
                return [
                    'id' => $msg->id,
                    'conversation_id' => $msg->conversation_id,
                    'user_id' => $msg->user_id,
                    'body' => $msg->body,
                    'status' => $msg->status,
                    'created_at' => $msg->created_at,
                    'delivered_at' => $msg->delivered_at,
                    'read_at' => $msg->read_at,
                    'user' => [
                        'id' => $msg->user->id,
                        'name' => $msg->user->name,
                    ]
                ];
            });

        return response()->json($messages);
    }

    /**
     * Enviar un nuevo mensaje.
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'body' => 'required|string',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);
        $userId = Auth::id();

        // Verificar que el usuario pertenece a la conversación
        abort_unless($conversation->users()->where('user_id', $userId)->exists(), 403);

        $message = $conversation->messages()->create([
            'user_id' => $userId,
            'body' => $request->body,
            'status' => 'sent',
        ]);

        // Actualizar timestamp de la conversación
        $conversation->touch();

        // Broadcast del mensaje a otros usuarios
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => 'Mensaje enviado',
            'data' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'user_id' => $message->user_id,
                'body' => $message->body,
                'status' => $message->status,
                'created_at' => $message->created_at,
                'user' => [
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                ]
            ]
        ]);
    }

    /**
     * Marcar mensajes como leídos.
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);
        $userId = Auth::id();

        // Verificar que el usuario pertenece a la conversación
        abort_unless($conversation->users()->where('user_id', $userId)->exists(), 403);

        // Obtener mensajes no leídos de otros usuarios
        $unreadMessages = Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $userId)
            ->where('status', '!=', 'read')
            ->get();

        foreach ($unreadMessages as $message) {
            $message->update([
                'status' => 'read',
                'read_at' => now()
            ]);

            // Broadcast del cambio de estado
            broadcast(new MessageStatusUpdated(
                $message->id,
                $conversation->id,
                'read',
                now()->toISOString()
            ))->toOthers();
        }

        return response()->json([
            'message' => 'Mensajes marcados como leídos',
            'count' => $unreadMessages->count()
        ]);
    }

    /**
     * Indicador de "escribiendo..."
     */
    public function typing(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'is_typing' => 'boolean',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);
        $user = Auth::user();

        // Verificar que el usuario pertenece a la conversación
        abort_unless($conversation->users()->where('user_id', $user->id)->exists(), 403);

        // Broadcast del evento de typing
        broadcast(new UserTyping(
            $user->id,
            $user->name,
            $conversation->id,
            $request->get('is_typing', true)
        ))->toOthers();

        return response()->json(['message' => 'OK']);
    }

    /**
     * Buscar usuarios para iniciar nueva conversación.
     */
    public function searchUsers(Request $request)
    {
        $query = $request->get('q', '');
        $currentUserId = Auth::id();

        $users = User::where('id', '!=', $currentUserId)
            ->where('is_active', true)
            ->when($query, function($q) use ($query) {
                $q->where(function($q2) use ($query) {
                    $q2->where('name', 'like', "%{$query}%")
                       ->orWhere('email', 'like', "%{$query}%");
                });
            })
            ->select('id', 'name', 'email')
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }

    /**
     * Crear nueva conversación (1:1 o grupo).
     */
    public function createConversation(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'name' => 'nullable|string|max:255',
            'is_group' => 'boolean',
        ]);

        $currentUserId = Auth::id();
        $userIds = $request->user_ids;
        $isGroup = $request->get('is_group', count($userIds) > 1);

        // Para conversaciones 1:1, verificar si ya existe
        if (!$isGroup && count($userIds) === 1) {
            $existingConversation = Conversation::where('is_group', false)
                ->whereHas('users', function($q) use ($currentUserId) {
                    $q->where('user_id', $currentUserId);
                })
                ->whereHas('users', function($q) use ($userIds) {
                    $q->where('user_id', $userIds[0]);
                })
                ->withCount('users')
                ->having('users_count', '=', 2)
                ->first();

            if ($existingConversation) {
                return response()->json([
                    'message' => 'Conversación existente',
                    'data' => $this->formatConversation($existingConversation->load('users'))
                ]);
            }
        }

        // Crear nueva conversación
        $conversation = Conversation::create([
            'name' => $isGroup ? ($request->name ?? 'Grupo') : null,
            'is_group' => $isGroup,
        ]);

        // Agregar usuarios (incluido el usuario actual)
        $allUserIds = array_unique(array_merge([$currentUserId], $userIds));
        $conversation->users()->attach($allUserIds);

        return response()->json([
            'message' => 'Conversación creada',
            'data' => $this->formatConversation($conversation->load('users'))
        ], 201);
    }

    /**
     * Formatear conversación para respuesta JSON
     */
    private function formatConversation(Conversation $conv): array
    {
        return [
            'id' => $conv->id,
            'name' => $conv->name,
            'is_group' => $conv->is_group,
            'users' => $conv->users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email
            ]),
            'unread_count' => 0,
            'updated_at' => $conv->updated_at,
        ];
    }
}

