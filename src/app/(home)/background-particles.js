"use client";

import Particles from "@tsparticles/react";
import { useParticle } from "./use-particle";
import { particlesOptions } from "./particles-options";

export function BackgroundParticles() {
  const isInit = useParticle();

  return <>{isInit && <Particles options={particlesOptions} className="absolute inset-0" />}</>;
}
