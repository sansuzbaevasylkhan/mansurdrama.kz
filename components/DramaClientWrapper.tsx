'use client';

import React from 'react';
import { Drama } from '@prisma/client';

interface DramaClientWrapperProps {
  drama: Drama;
}

export function DramaClientWrapper({ drama }: DramaClientWrapperProps) {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <div className="text-white text-center py-20">
        <h2 className="text-2xl font-bold">Эпизодтар жүктелуде...</h2>
        <p className="text-white/60 mt-2">Системаға қосылуды күтіңіз</p>
      </div>
    </div>
  );
}