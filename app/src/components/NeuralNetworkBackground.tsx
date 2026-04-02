'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize points
    const pointCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    pointsRef.current = Array.from({ length: pointCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Render every 2nd frame for performance (30fps)
      if (frameCount % 2 === 0) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const points = pointsRef.current;

        // Update and draw points
        points.forEach((point, i) => {
          // Update position
          point.x += point.vx;
          point.y += point.vy;

          // Bounce off edges
          if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
          if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

          // Keep in bounds
          point.x = Math.max(0, Math.min(canvas.width, point.x));
          point.y = Math.max(0, Math.min(canvas.height, point.y));

          // Draw point
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.fill();

          // Draw connections (only check every 5th point for performance)
          if (i % 5 === 0) {
            for (let j = i + 1; j < points.length; j += 3) {
              const dx = points[j].x - point.x;
              const dy = points[j].y - point.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 120) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - distance / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
        });

        // Mouse interaction
        const mouse = mouseRef.current;
        points.forEach((point) => {
          const dx = mouse.x - point.x;
          const dy = mouse.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
