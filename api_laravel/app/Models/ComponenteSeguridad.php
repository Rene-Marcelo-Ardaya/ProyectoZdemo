<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComponenteSeguridad extends Model
{
    protected $table = 'componente_seguridad';

    protected $fillable = [
        'componente_id',
        'pagina',
        'descripcion',
        'nivel_seguridad_id',
    ];

    public function nivelSeguridad(): BelongsTo
    {
        return $this->belongsTo(NivelSeguridad::class, 'nivel_seguridad_id');
    }
}
