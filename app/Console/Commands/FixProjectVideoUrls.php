<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FixProjectVideoUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:project-video-urls {--dry-run : Do not save changes, just report}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Inject /storage/v1 into project.video_url values when missing';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $this->info('Starting project video URL fixer' . ($dryRun ? ' (dry run)' : ''));

        $count = 0;

        Project::chunkById(100, function ($projects) use (&$count, $dryRun) {
            foreach ($projects as $project) {
                $url = $project->video_url;

                if (!$url || !Str::contains($url, '/object/public/')) {
                    continue;
                }

                if (Str::contains($url, '/storage/v1/')) {
                    // already fixed
                    continue;
                }

                $newUrl = str_replace('/object/public/', '/storage/v1/object/public/', $url);

                $this->line("Project {$project->id}: updating URL\n  from: {$url}\n  to:   {$newUrl}");

                if (!$dryRun) {
                    $project->video_url = $newUrl;
                    $project->save();
                }

                $count++;
            }
        });

        $this->info("Done. Fixed {$count} project(s).");

        return 0;
    }
}
