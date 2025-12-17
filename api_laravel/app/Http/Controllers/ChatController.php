<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * List conversations for the authenticated user.
     * Los grupos siempre aparecen primero.
     */
    public function index()
    {
        $user = Auth::user();
        $conversations = $user->conversations()
            ->with(['users', 'messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->sortByDesc(function($conv) {
                // Grupos primero, luego por fecha de actualización
                return [$conv->is_group ? 1 : 0, $conv->updated_at];
            })
            ->values();

        return ConversationResource::collection($conversations);
    }

    /**
     * Show messages for a specific conversation.
     */
    public function show(Conversation $conversation)
    {
        // Ensure user belongs to the conversation
        abort_unless($conversation->users()->where('user_id', Auth::id())->exists(), 403);

        $messages = $conversation->messages()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    /**
     * Store a new message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'body' => 'required|string',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        // Ensure user belongs to the conversation
        abort_unless($conversation->users()->where('user_id', Auth::id())->exists(), 403);

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        // Actualizar timestamp de la conversación
        $conversation->touch();

        // Broadcast to others
        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['message' => 'Message sent!', 'data' => $message]);
    }

    /**
     * Search users to start a new conversation.
     */
    public function searchUsers(Request $request)
    {
        $query = $request->get('q', '');
        $currentUserId = Auth::id();

        $users = User::where('id', '!=', $currentUserId)
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
     * Create a new conversation (1:1 or group).
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
                    'message' => 'Conversation already exists',
                    'data' => new ConversationResource($existingConversation->load('users'))
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
            'message' => 'Conversation created!',
            'data' => new ConversationResource($conversation->load('users'))
        ], 201);
    }
}
