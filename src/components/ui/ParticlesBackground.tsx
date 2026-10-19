import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Track system theme preference if "system" is selected
  const systemTheme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const currentTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        initParticles();
      }
    };

    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000); // Responsive density
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 0.3, // Slow movement X
          dy: (Math.random() - 0.5) * 0.3, // Slow movement Y
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // determined by theme
      const isDark = currentTheme === 'dark';
      const color = isDark ? '255, 255, 255' : '39, 39, 42'; // White in dark (visible), Zinc-800 in light

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${particle.opacity})`;
        ctx.fill();

        // Update position
        particle.x += particle.dx;
        particle.y += particle.dy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    drawParticles();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTheme]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
