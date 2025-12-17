<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => $this->is_group,
            'users' => $this->users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Optionally include latest message
            // 'latest_message' => new MessageResource($this->messages->last()), 
        ];
    }
}
