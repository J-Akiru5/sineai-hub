<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ThumbnailService
{
    /**
     * Generate a thumbnail from a video file using FFmpeg.
     *
     * @param string $videoUrl The URL of the video file
     * @param string $userId The user ID for storage path
     * @param int $timestamp The timestamp in seconds to extract the frame (default: 5)
     * @return string|null The URL of the generated thumbnail or null on failure
     */
    public static function generateFromVideo(string $videoUrl, string $userId, int $timestamp = 5): ?string
    {
        try {
            // Create a unique filename for the thumbnail
            $filename = 'thumb_' . Str::random(20) . '.jpg';
            $tempPath = sys_get_temp_dir() . '/' . $filename;
            $storagePath = 'user-' . $userId . '/' . $filename;

            // FFmpeg command to extract a frame
            // -ss: seek to timestamp (before input for faster seeking)
            // -i: input file
            // -vframes 1: extract only 1 frame
            // -vf scale: resize to max 640px width maintaining aspect ratio
            // -q:v 2: quality (2 is high quality)
            $command = sprintf(
                'ffmpeg -ss %d -i "%s" -vframes 1 -vf "scale=640:-1" -q:v 2 "%s" -y 2>&1',
                $timestamp,
                escapeshellarg($videoUrl),
                escapeshellarg($tempPath)
            );

            // Execute FFmpeg
            exec($command, $output, $returnCode);

            if ($returnCode !== 0 || !file_exists($tempPath)) {
                Log::warning('FFmpeg thumbnail generation failed', [
                    'video_url' => $videoUrl,
                    'command' => $command,
                    'output' => implode("\n", $output),
                    'return_code' => $returnCode,
                ]);

                // Try again with timestamp 1 (in case video is too short)
                if ($timestamp > 1) {
                    return self::generateFromVideo($videoUrl, $userId, 1);
                }

                return null;
            }

            // Upload to DigitalOcean Spaces
            $uploaded = Storage::disk('digitalocean')->put(
                $storagePath,
                file_get_contents($tempPath),
                'public'
            );

            // Clean up temp file
            @unlink($tempPath);

            if (!$uploaded) {
                Log::warning('Failed to upload thumbnail to storage', ['path' => $storagePath]);
                return null;
            }

            // Build the CDN URL
            $bucket = env('DO_SPACES_BUCKET');
            $thumbnailUrl = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/{$storagePath}";

            Log::info('Thumbnail generated successfully', [
                'video_url' => $videoUrl,
                'thumbnail_url' => $thumbnailUrl,
            ]);

            return $thumbnailUrl;

        } catch (\Exception $e) {
            Log::error('Thumbnail generation exception', [
                'error' => $e->getMessage(),
                'video_url' => $videoUrl,
            ]);
            return null;
        }
    }

    /**
     * Check if FFmpeg is available on the system.
     */
    public static function isFFmpegAvailable(): bool
    {
        exec('ffmpeg -version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }
}
