'use client';

import { motion } from 'framer-motion';

interface AIThinkingPulseProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AIThinkingPulse({
  message = 'AI is researching...',
  subMessage,
  size = 'md',
}: AIThinkingPulseProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const ringSizes = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Pulse Animation Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${ringSizes[size]}`}
            style={{
              background: `radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Core orb */}
        <motion.div
          className={`relative ${sizeClasses[size]} rounded-full`}
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(34,211,238,1) 0%, rgba(6,182,212,0.8) 40%, rgba(79,70,229,0.6) 100%)
            `,
            boxShadow: `
              0 0 30px rgba(6,182,212,0.6),
              0 0 60px rgba(6,182,212,0.4),
              inset 0 0 20px rgba(255,255,255,0.3)
            `,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Inner shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-cyan-400"
            style={{
              boxShadow: '0 0 10px rgba(34,211,238,0.8)',
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div
              className="absolute"
              style={{
                transform: `translateX(${(size === 'lg' ? 48 : size === 'md' ? 32 : 16)}px)`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Status Text */}
      <div className="text-center space-y-1">
        <motion.p
          className="text-cyan-400 font-medium text-sm tracking-wide"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        {subMessage && (
          <p className="text-slate-400 text-xs">{subMessage}</p>
        )}
      </div>
    </div>
  );
}

export function AIThinkingDot() {
  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-cyan-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: '0 0 10px rgba(6,182,212,0.8)',
        }}
      />
      <motion.div
        className="absolute w-6 h-6 rounded-full border border-cyan-500/50"
        animate={{
          scale: [1, 1.5],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}

interface EnrichmentProgressProps {
  progress: number;
  label?: string;
}

export function EnrichmentProgress({ progress, label }: EnrichmentProgressProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span className="text-cyan-400">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-cyan-500 to-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 10px rgba(6,182,212,0.6), 0 0 20px rgba(6,182,212,0.3)',
          }}
        />
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
