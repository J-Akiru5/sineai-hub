<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'allowed_role_id'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * The role that is allowed to access this channel (optional).
     */
    public function allowedRole()
    {
        return $this->belongsTo(Role::class, 'allowed_role_id');
    }
}
