<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
