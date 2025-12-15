import React, { useEffect, useRef, useState, useCallback } from 'react';

// Roasts array defined outside component for better maintainability
const roasts = [
    "Cut! We'll fix it in post... maybe.",
    "That jump was shorter than a TikTok script.",
    "Writer's block hit you hard, huh?",
    "Even the stunt double couldn't save that one.",
    "Your timing is worse than a buffering stream.",
    "That performance deserves a Razzie.",
];

export default function SparkRunner() {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameover'
    const [score, setScore] = useState(0);

    // Game state ref to avoid stale closures in the game loop
    const gameRef = useRef({
        player: {
            x: 50,
            y: 150,
            width: 30,
            height: 30,
            dy: 0,
            jumpPower: -10,
            gravity: 0.5,
            grounded: true,
        },
        obstacles: [],
        frameCount: 0,
        score: 0,
        gameSpeed: 5,
        isRunning: false,
        nextSpawnFrame: 1, // Track when to spawn next obstacle
    });

    const getRandomRoast = useCallback(() => {
        return roasts[Math.floor(Math.random() * roasts.length)];
    }, []);

    const [currentRoast, setCurrentRoast] = useState('');

    // Reset game state
    const resetGame = useCallback(() => {
        gameRef.current = {
            player: {
                x: 50,
                y: 150,
                width: 30,
                height: 30,
                dy: 0,
                jumpPower: -10,
                gravity: 0.5,
                grounded: true,
            },
            obstacles: [],
            frameCount: 0,
            score: 0,
            gameSpeed: 5,
            isRunning: true,
            nextSpawnFrame: 1, // First spawn happens immediately
        };
        setScore(0);
        setGameState('playing');
    }, []);

    // AABB collision detection
    const checkCollision = useCallback((rect1, rect2) => {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }, []);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const gameLoop = () => {
            const game = gameRef.current;

            if (!game.isRunning) {
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update player physics
            const player = game.player;

            // Apply gravity
            player.dy += player.gravity;
            player.y += player.dy;

            // Ground collision
            if (player.y >= 150) {
                player.y = 150;
                player.dy = 0;
                player.grounded = true;
            }

            // Spawn obstacles when frameCount reaches nextSpawnFrame
            game.frameCount++;
            if (game.frameCount >= game.nextSpawnFrame) {
                const obstacleTypes = ['📄', '⏰'];
                const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                game.obstacles.push({
                    x: 600,
                    y: 160,
                    width: 20,
                    height: 20,
                    type: type,
                });
                // Set next spawn frame (100-200 frames from now)
                game.nextSpawnFrame = game.frameCount + Math.floor(Math.random() * 100) + 100;
            }

            // Update obstacles
            game.obstacles = game.obstacles.filter((obs) => {
                obs.x -= game.gameSpeed;

                // Check collision with player
                if (checkCollision(player, obs)) {
                    game.isRunning = false;
                    setCurrentRoast(getRandomRoast());
                    setGameState('gameover');
                    return false; // Remove obstacle on collision to prevent issues on restart
                }

                // Remove off-screen obstacles and increment score
                if (obs.x + obs.width < 0) {
                    game.score++;
                    setScore(game.score);
                    return false;
                }

                return true;
            });

            // Gradually increase game speed
            if (game.frameCount % 500 === 0) {
                game.gameSpeed += 0.5;
            }

            // Draw ground line
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 180);
            ctx.lineTo(600, 180);
            ctx.stroke();

            // Draw player (🤖)
            ctx.font = '30px Arial';
            ctx.fillText('🤖', player.x, player.y + player.height);

            // Draw obstacles
            ctx.font = '20px Arial';
            game.obstacles.forEach((obs) => {
                ctx.fillText(obs.type, obs.x, obs.y + obs.height);
            });

            // Draw score
            ctx.fillStyle = '#f8fafc';
            ctx.font = '16px Arial';
            ctx.fillText(`Score: ${game.score}`, 10, 25);

            // Continue loop
            animationId = requestAnimationFrame(gameLoop);
        };

        if (gameState === 'playing') {
            gameRef.current.isRunning = true;
            animationId = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [gameState, checkCollision, getRandomRoast]);

    // Draw start screen
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameState !== 'start') return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 Spark Runner 🤖', 300, 70);

        // Draw instructions
        ctx.font = '16px Arial';
        ctx.fillText('Dodge the scripts and deadlines!', 300, 100);

        // Draw player preview
        ctx.font = '40px Arial';
        ctx.fillText('🤖', 285, 140);

        // Draw start prompt
        ctx.fillStyle = '#fbbf24';
        ctx.font = '18px Arial';
        ctx.fillText('Press Space or ↑ to Start', 300, 180);

        ctx.textAlign = 'start';
    }, [gameState]);

    // Draw game over screen
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameState !== 'gameover') return;

        const ctx = canvas.getContext('2d');

        // Draw semi-transparent dark overlay
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game over text
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 300, 60);

        // Draw final score
        ctx.fillStyle = '#f8fafc';
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, 300, 100);

        // Draw roast
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'italic 14px Arial';

        // Word wrap the roast if needed
        const maxWidth = 500;
        const words = currentRoast.split(' ');
        let line = '';
        let y = 140;

        words.forEach((word) => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, 300, y);
                line = word + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, 300, y);

        // Draw restart prompt
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Arial';
        ctx.fillText('Press Space to Restart', 300, 180);

        ctx.textAlign = 'start';
    }, [gameState, score, currentRoast]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();

                if (gameState === 'start' || gameState === 'gameover') {
                    resetGame();
                } else if (gameState === 'playing') {
                    const player = gameRef.current.player;
                    if (player.grounded) {
                        player.dy = player.jumpPower;
                        player.grounded = false;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, resetGame]);

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                width="600"
                height="200"
                className="border rounded-lg bg-slate-900"
            />
            <div className="text-slate-400 text-sm">
                Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">Space</kbd> or{' '}
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">↑</kbd> to jump
            </div>
        </div>
    );
}
