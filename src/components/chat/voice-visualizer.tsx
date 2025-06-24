'use client';

import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageProvider';

interface VoiceVisualizerProps {
  isRecording: boolean;
}

const SoundWave = () => (
    <div className="flex items-center justify-center gap-1.5 h-12">
        <span className="w-1.5 h-full rounded-full bg-white animate-wave" style={{ animationDelay: '-0.4s' }} />
        <span className="w-1.5 h-full rounded-full bg-white animate-wave" style={{ animationDelay: '-0.2s' }} />
        <span className="w-1.5 h-full rounded-full bg-white animate-wave" style={{ animationDelay: '0s' }} />
        <span className="w-1.5 h-full rounded-full bg-white animate-wave" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-full rounded-full bg-white animate-wave" style={{ animationDelay: '0.4s' }} />
    </div>
);

export function VoiceVisualizer({ isRecording }: VoiceVisualizerProps) {
  const { t } = useLanguage();

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300",
      isRecording ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className="p-5 rounded-full bg-primary/20 border-4 border-primary/30">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
            <p className="text-white font-medium text-lg">{t('listening')}</p>
            <SoundWave />
        </div>
        <p className='text-sm text-white/60'>{t('saySomething')}</p>
      </div>
    </div>
  );
}
