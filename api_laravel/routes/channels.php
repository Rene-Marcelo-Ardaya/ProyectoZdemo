<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

// Canal de usuario individual
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal de conversación - verifica que el usuario pertenezca a la conversación
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;
    return $conversation->users->contains('id', $user->id);
});

// Canal legacy (por compatibilidad)
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;
    return $conversation->users->contains('id', $user->id);
});
