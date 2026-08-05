'use client';

import { Canvas } from '@react-three/fiber';

import { ParticleNetwork } from '@/components/three/ParticleNetwork';
import { FIELD, PARTICLE_PROFILES, type ProfileName } from '@/config/particles';

interface Props {
  profileName: ProfileName;
  color: string;
  seed: number;
  isRunning: boolean;
  onReady: () => void;
  onContextLost: () => void;
  onBudgetMissed: () => void;
}

export function HeroCanvas({
  profileName,
  color,
  seed,
  isRunning,
  onReady,
  onContextLost,
  onBudgetMissed,
}: Props) {
  const profile = PARTICLE_PROFILES[profileName];

  return (
    <Canvas
      className="field-canvas"
      frameloop={isRunning ? 'always' : 'never'}
      dpr={profile.dpr}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{
        position: [0, 0, FIELD.cameraZ],
        fov: FIELD.fov,
        near: 0.1,
        far: FIELD.cameraZ * 4,
      }}
    >
      <ParticleNetwork
        profile={profile}
        color={color}
        seed={seed}
        onReady={onReady}
        onContextLost={onContextLost}
        onBudgetMissed={onBudgetMissed}
      />
    </Canvas>
  );
}
