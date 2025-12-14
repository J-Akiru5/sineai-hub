<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Short Film', 'slug' => 'short-film', 'icon' => 'Film', 'color' => '#f59e0b', 'sort_order' => 1, 'description' => 'Films under 40 minutes'],
            ['name' => 'Feature Film', 'slug' => 'feature-film', 'icon' => 'Clapperboard', 'color' => '#ef4444', 'sort_order' => 2, 'description' => 'Full-length films over 40 minutes'],
            ['name' => 'Documentary', 'slug' => 'documentary', 'icon' => 'Video', 'color' => '#3b82f6', 'sort_order' => 3, 'description' => 'Non-fiction films'],
            ['name' => 'Music Video', 'slug' => 'music-video', 'icon' => 'Music', 'color' => '#8b5cf6', 'sort_order' => 4, 'description' => 'Visual music content'],
            ['name' => 'Animation', 'slug' => 'animation', 'icon' => 'Palette', 'color' => '#ec4899', 'sort_order' => 5, 'description' => 'Animated content'],
            ['name' => 'Experimental', 'slug' => 'experimental', 'icon' => 'Sparkles', 'color' => '#14b8a6', 'sort_order' => 6, 'description' => 'Avant-garde and experimental works'],
            ['name' => 'Horror', 'slug' => 'horror', 'icon' => 'Ghost', 'color' => '#1f2937', 'sort_order' => 7, 'description' => 'Horror and thriller content'],
            ['name' => 'Comedy', 'slug' => 'comedy', 'icon' => 'Smile', 'color' => '#fbbf24', 'sort_order' => 8, 'description' => 'Comedy and humorous content'],
            ['name' => 'Drama', 'slug' => 'drama', 'icon' => 'Theater', 'color' => '#6366f1', 'sort_order' => 9, 'description' => 'Dramatic storytelling'],
            ['name' => 'Action', 'slug' => 'action', 'icon' => 'Zap', 'color' => '#f97316', 'sort_order' => 10, 'description' => 'Action-packed content'],
            ['name' => 'Sci-Fi', 'slug' => 'sci-fi', 'icon' => 'Rocket', 'color' => '#06b6d4', 'sort_order' => 11, 'description' => 'Science fiction works'],
            ['name' => 'Behind the Scenes', 'slug' => 'behind-the-scenes', 'icon' => 'Camera', 'color' => '#84cc16', 'sort_order' => 12, 'description' => 'Making-of and BTS content'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
