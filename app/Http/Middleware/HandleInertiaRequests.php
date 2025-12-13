<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles') : null,
            ],
            // Share translations for the current locale (loaded from resources/lang/{locale}.json)
            'translations' => function () use ($request) {
                $locale = session('locale', config('app.locale'));
                $path = resource_path('lang/' . $locale . '.json');
                if (file_exists($path)) {
                    $contents = file_get_contents($path);
                    $data = json_decode($contents, true);
                    return $data ?: [];
                }
                return [];
            },
            'locale' => function () use ($request) {
                return session('locale', config('app.locale'));
            },
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
        ]);
    }
}
