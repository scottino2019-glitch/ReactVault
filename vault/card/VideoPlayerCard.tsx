import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Bookmark, 
  Tv, 
  ListVideo,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface VideoEpisode {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  chapter: string;
}

const PLAYLIST: VideoEpisode[] = [
  {
    id: '1',
    chapter: 'Capitolo 01',
    title: 'Fondamenti & Luce Dinamica',
    duration: '08:20',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    chapter: 'Capitolo 02',
    title: 'Geometrie, Spazio & Prospettiva',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    chapter: 'Capitolo 03',
    title: 'Motion Design & Micro-interazioni',
    duration: '15:10',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    chapter: 'Capitolo 04',
    title: 'Architettura dei Sistemi UI 2026',
    duration: '18:30',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
  },
];

export function VideoPlayerCardPreview() {
  const [activeVideoId, setActiveVideoId] = useState('2');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(38);
  const [speed, setSpeed] = useState('1.0x');
  const [isSaved, setIsSaved] = useState(false);
  const [volume, setVolume] = useState(85);

  const activeVideo = PLAYLIST.find((v) => v.id === activeVideoId) || PLAYLIST[0];

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div id="video-player-card-preview" className="w-full max-w-4xl mx-auto select-none p-2 sm:p-4">
      {/* Chassis Monitor Cinema con Player Principale a Sinistra e Player/Playlist Laterale a Destra */}
      <div className="relative bg-gradient-to-b from-[#1c1d24] via-[#14151a] to-[#0d0e12] rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-neutral-700/60 text-white overflow-hidden">
        
        {/* Barra Superiore Bezel Monitor */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-rose-400" /> CINEMA DISPLAY 4K HDR • STUDIO SUITE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
              DOLBY VISION PRO
            </span>
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`p-1.5 rounded-lg border border-neutral-700 transition-colors ${
                isSaved ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' : 'text-neutral-400 hover:text-white'
              }`}
              title="Salva nei preferiti"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Layout a Due Colonne: Schermo Video + Player Laterale */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          {/* SCHERMO VIDEO PRINCIPALE (7 COLONNE SU MD, 8 SU LG) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-inner flex items-center justify-center group">
              
              {/* Immagine Poster Video Dinamica */}
              <img 
                src={activeVideo.thumbnail} 
                alt={activeVideo.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'opacity-85'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20"></div>

              {/* Tasto Play Centrale a Cerchio */}
              <button
                type="button"
                onClick={togglePlay}
                className="relative z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 border-2 border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              {/* Badge Sovrapposto In Alto */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <span className="px-2.5 py-1 rounded-md bg-neutral-900/90 text-[10px] font-bold text-white border border-white/20 shadow">
                  {activeVideo.chapter}: {activeVideo.title}
                </span>
              </div>

              {/* Controlli In-Screen Inferiori */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-20 flex flex-col gap-2 bg-gradient-to-t from-black via-black/90 to-transparent">
                {/* Barra Scrubber Progresso */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-neutral-300">04:15</span>
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                      setProgress(Math.round(pos));
                    }}
                    className="relative flex-1 h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 rounded-full shadow-md transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">{activeVideo.duration}</span>
                </div>

                {/* Pulsanti Azione In Basso */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={togglePlay} className="text-white hover:text-rose-400 cursor-pointer">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button type="button" onClick={toggleMute} className="text-white hover:text-cyan-400 cursor-pointer">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                      className="w-16 accent-rose-500 h-1 cursor-pointer hidden sm:block"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = ['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];
                        const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
                        setSpeed(next);
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white border border-white/20 cursor-pointer"
                    >
                      {speed}
                    </button>
                    <button type="button" className="text-neutral-300 hover:text-white cursor-pointer">
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Dettagli Video in Basso */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  {activeVideo.title}
                </h4>
                <p className="text-xs text-neutral-400">
                  Masterclass Design System • 4K UHD 60fps • Stereo 3D Audio
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                HDR10+
              </span>
            </div>
          </div>

          {/* PLAYER LATERALE / SIDEBAR DELLA PLAYLIST */}
          <div className="md:col-span-5 lg:col-span-4 bg-neutral-900/90 rounded-2xl p-3 border border-neutral-800 flex flex-col h-full">
            
            {/* Intestazione Sidebar Laterale */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                <ListVideo className="w-4 h-4 text-rose-400" />
                <span>Player Laterale • Playlist</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                4 Video
              </span>
            </div>

            {/* Lista Video / Capitoli del Player Laterale */}
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {PLAYLIST.map((item) => {
                const isActive = item.id === activeVideoId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveVideoId(item.id);
                      setIsPlaying(true);
                      setProgress(0);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/50 shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {/* Miniatura Video con Badge Durata */}
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono bg-black/80 text-white px-1 rounded">
                        {item.duration}
                      </span>
                      {isActive && isPlaying && (
                        <div className="absolute inset-0 bg-rose-600/40 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        </div>
                      )}
                    </div>

                    {/* Dettagli Video */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono uppercase font-bold ${isActive ? 'text-rose-400' : 'text-neutral-400'}`}>
                          {item.chapter}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold text-rose-300 bg-rose-900/60 px-1.5 rounded">
                            {isPlaying ? 'In Riproduzione' : 'Pausa'}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-neutral-200'}`}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Piè di Pagina Sidebar */}
            <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500 px-1">
              <span>Auto-play prossimo video</span>
              <span className="text-emerald-400 font-bold">Attivo</span>
            </div>

          </div>

        </div>

        {/* Piedistallo / Stand Base Inferiore del Monitor */}
        <div className="flex flex-col items-center mt-3 pt-2 border-t border-neutral-800/50">
          <div className="w-16 h-3 bg-gradient-to-b from-neutral-700 to-neutral-900 border-x border-neutral-600"></div>
          <div className="w-40 h-2 bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 rounded-full shadow-lg border border-neutral-600/50"></div>
        </div>

      </div>
    </div>
  );
}

export const videoPlayerReactCode = `import React, { useState } from 'react';
import { Play, Pause, Volume2, Maximize, Tv, ListVideo } from 'lucide-react';

export function VideoPlayerCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('2');

  const playlist = [
    { id: '1', title: 'Fondamenti & Luce Dinamica', duration: '08:20' },
    { id: '2', title: 'Geometrie, Spazio & Prospettiva', duration: '12:45' },
    { id: '3', title: 'Motion Design & Interazioni', duration: '15:10' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-neutral-950 text-white rounded-3xl border border-neutral-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Schermo Video Principale */}
        <div className="lg:col-span-8 aspect-video bg-neutral-900 rounded-2xl relative flex items-center justify-center">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center shadow-xl"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        </div>

        {/* Player Laterale / Playlist */}
        <div className="lg:col-span-4 bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
          <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5 text-rose-400">
            <ListVideo className="w-4 h-4" /> Player Laterale • Playlist
          </h4>
          <div className="space-y-2">
            {playlist.map(v => (
              <div 
                key={v.id}
                onClick={() => { setActiveId(v.id); setIsPlaying(true); }}
                className={\`p-2 rounded-xl text-xs cursor-pointer \${v.id === activeId ? 'bg-rose-950/60 text-white border border-rose-500' : 'bg-neutral-800 text-neutral-300'}\`}
              >
                <div className="font-bold">{v.title}</div>
                <div className="text-[10px] text-neutral-400">{v.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;

export const videoPlayerHtmlCode = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cinema Display 4K con Player Laterale</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-neutral-950 text-white min-h-screen flex items-center justify-center p-4">

<!-- CARD VIDEO PLAYER CON PLAYER LATERALE / PLAYLIST (HTML5 + TAILWIND) -->
<div id="cinema-video-card" class="w-full max-w-4xl mx-auto select-none p-2 sm:p-4 font-sans">
  <div class="relative bg-gradient-to-b from-[#1c1d24] via-[#14151a] to-[#0d0e12] rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-neutral-700/60 text-white overflow-hidden">
    
    <!-- Barra Superiore Bezel Monitor -->
    <div class="flex items-center justify-between pb-3 px-2 border-b border-neutral-800 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span class="font-mono text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
          📺 CINEMA DISPLAY 4K HDR • STUDIO SUITE
        </span>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
        PRO DOLBY VISION
      </span>
    </div>

    <!-- Layout a Due Colonne: Schermo Principale e Player Laterale -->
    <div class="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
      
      <!-- Schermo Video Principale (7 Colonne MD, 8 Colonne LG) -->
      <div class="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
        <div class="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-inner flex items-center justify-center">
          
          <img 
            id="main-video-img"
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" 
            alt="Video Active" 
            class="w-full h-full object-cover opacity-85 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20"></div>

          <!-- Pulsante Play Centrale -->
          <button 
            id="video-play-center-btn"
            type="button" 
            class="relative z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 border-2 border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <span id="center-play-icon" class="text-2xl font-bold">▶</span>
          </button>

          <!-- Titolo Sovrapposto in Alto -->
          <div class="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span id="video-overlay-title" class="px-2.5 py-1 rounded-md bg-neutral-900/90 text-[10px] font-bold text-white border border-white/20">
              Capitolo 02: Geometrie, Spazio & Prospettiva
            </span>
          </div>

          <!-- Controlli In-Screen Inferiori -->
          <div class="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-20 flex flex-col gap-2 bg-gradient-to-t from-black via-black/90 to-transparent">
            <!-- Scrubber -->
            <div class="flex items-center gap-3">
              <span id="video-time-cur" class="text-[11px] font-mono text-neutral-300">04:15</span>
              <div id="video-progress-track" class="relative flex-1 h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden">
                <div id="video-progress-fill" class="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 rounded-full" style="width: 38%;"></div>
              </div>
              <span id="video-time-tot" class="text-[11px] font-mono text-neutral-400">12:45</span>
            </div>

            <!-- Bottoni Inferiori -->
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-3">
                <button id="video-play-btn" type="button" class="text-white hover:text-rose-400 cursor-pointer">
                  ▶
                </button>
                <button id="video-mute-btn" type="button" class="text-white hover:text-cyan-400 cursor-pointer">
                  🔊
                </button>
                <input id="video-vol-slider" type="range" min="0" max="100" value="80" class="w-16 accent-rose-500 h-1 cursor-pointer" />
              </div>

              <div class="flex items-center gap-2.5">
                <button id="video-speed-btn" type="button" class="px-2 py-0.5 rounded bg-white/10 text-xs font-mono font-bold text-white border border-white/20 cursor-pointer">
                  1.0x
                </button>
              </div>
            </div>
          </div>

        </div>

        <div class="mt-3 px-1 flex items-center justify-between">
          <div>
            <h4 id="video-main-heading" class="font-bold text-sm sm:text-base text-white">Geometrie, Spazio & Prospettiva</h4>
            <p class="text-xs text-neutral-400">Masterclass Design System • 4K UHD 60fps</p>
          </div>
          <span class="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
            HDR10+
          </span>
        </div>
      </div>

      <!-- Player Laterale / Playlist -->
      <div class="md:col-span-5 lg:col-span-4 bg-neutral-900/90 rounded-2xl p-3 border border-neutral-800 flex flex-col h-full">
        
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 px-1">
          <span class="text-xs font-bold text-neutral-200 flex items-center gap-1">
            🎬 Player Laterale • Playlist
          </span>
          <span class="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">4 Video</span>
        </div>

        <!-- Lista Video Laterale -->
        <div id="video-lateral-list" class="space-y-2 overflow-y-auto max-h-[300px]">
          <!-- Video 1 -->
          <div data-id="1" class="video-lateral-item p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800/80 cursor-pointer flex items-center gap-2.5 transition-all">
            <div class="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover" />
              <span class="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded">08:20</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[9px] font-mono text-neutral-400 font-bold">Capitolo 01</div>
              <div class="text-xs font-semibold text-neutral-200 truncate">Fondamenti & Luce Dinamica</div>
            </div>
          </div>

          <!-- Video 2 (Attivo) -->
          <div data-id="2" class="video-lateral-item p-2 rounded-xl border border-rose-500/60 bg-rose-950/40 ring-1 ring-rose-500/50 cursor-pointer flex items-center gap-2.5 transition-all">
            <div class="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover" />
              <span class="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded">12:45</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[9px] font-mono text-rose-400 font-bold flex justify-between">
                <span>Capitolo 02</span>
                <span class="text-rose-300">In Riproduzione</span>
              </div>
              <div class="text-xs font-semibold text-white truncate">Geometrie, Spazio & Prospettiva</div>
            </div>
          </div>

          <!-- Video 3 -->
          <div data-id="3" class="video-lateral-item p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800/80 cursor-pointer flex items-center gap-2.5 transition-all">
            <div class="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover" />
              <span class="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded">15:10</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[9px] font-mono text-neutral-400 font-bold">Capitolo 03</div>
              <div class="text-xs font-semibold text-neutral-200 truncate">Motion Design & Micro-interazioni</div>
            </div>
          </div>

          <!-- Video 4 -->
          <div data-id="4" class="video-lateral-item p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800/80 cursor-pointer flex items-center gap-2.5 transition-all">
            <div class="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover" />
              <span class="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded">18:30</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[9px] font-mono text-neutral-400 font-bold">Capitolo 04</div>
              <div class="text-xs font-semibold text-neutral-200 truncate">Architettura dei Sistemi UI 2026</div>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 px-1">
          <span>Auto-play prossimo video</span>
          <span class="text-emerald-400 font-bold">Attivo</span>
        </div>

      </div>

    </div>

    <!-- Stand Base -->
    <div class="flex flex-col items-center mt-3 pt-2 border-t border-neutral-800/50">
      <div class="w-16 h-3 bg-gradient-to-b from-neutral-700 to-neutral-900 border-x border-neutral-600"></div>
      <div class="w-40 h-2 bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 rounded-full shadow-lg border border-neutral-600/50"></div>
    </div>

  </div>
</div>

<script>
(function() {
  let isPlaying = false;
  let activeId = '2';
  const videos = {
    '1': { title: 'Fondamenti & Luce Dinamica', chapter: 'Capitolo 01', duration: '08:20', thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
    '2': { title: 'Geometrie, Spazio & Prospettiva', chapter: 'Capitolo 02', duration: '12:45', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
    '3': { title: 'Motion Design & Micro-interazioni', chapter: 'Capitolo 03', duration: '15:10', thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
    '4': { title: 'Architettura dei Sistemi UI 2026', chapter: 'Capitolo 04', duration: '18:30', thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' }
  };

  const playCenterBtn = document.getElementById('video-play-center-btn');
  const playIcon = document.getElementById('center-play-icon');
  const playBottomBtn = document.getElementById('video-play-btn');
  const overlayTitle = document.getElementById('video-overlay-title');
  const mainHeading = document.getElementById('video-main-heading');
  const mainImg = document.getElementById('main-video-img');
  const timeTot = document.getElementById('video-time-tot');
  const lateralItems = document.querySelectorAll('.video-lateral-item');

  function togglePlay() {
    isPlaying = !isPlaying;
    if (playIcon) playIcon.textContent = isPlaying ? '❚❚' : '▶';
    if (playBottomBtn) playBottomBtn.textContent = isPlaying ? '❚❚' : '▶';
    if (mainImg) {
      mainImg.style.transform = isPlaying ? 'scale(1.05)' : 'scale(1.0)';
    }
  }

  playCenterBtn?.addEventListener('click', togglePlay);
  playBottomBtn?.addEventListener('click', togglePlay);

  lateralItems.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (!id || !videos[id]) return;
      activeId = id;
      const v = videos[id];
      if (overlayTitle) overlayTitle.textContent = v.chapter + ': ' + v.title;
      if (mainHeading) mainHeading.textContent = v.title;
      if (mainImg) mainImg.src = v.thumb;
      if (timeTot) timeTot.textContent = v.duration;

      lateralItems.forEach((el) => {
        el.className = 'video-lateral-item p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800/80 cursor-pointer flex items-center gap-2.5 transition-all text-neutral-300';
      });
      item.className = 'video-lateral-item p-2 rounded-xl border border-rose-500/60 bg-rose-950/40 ring-1 ring-rose-500/50 cursor-pointer flex items-center gap-2.5 transition-all text-white';

      isPlaying = true;
      if (playIcon) playIcon.textContent = '❚❚';
      if (playBottomBtn) playBottomBtn.textContent = '❚❚';
      if (mainImg) mainImg.style.transform = 'scale(1.05)';
    });
  });
})();
</script>
</body>
</html>`;

export const videoPlayerJsCode = `/**
 * Cinema Display 4K & Lateral Video Player - Pure Vanilla JavaScript Controller
 * File: cinema-video-player.js
 */
(function() {
  let isPlaying = false;
  let activeId = '2';

  const videos = {
    '1': { title: 'Fondamenti & Luce Dinamica', chapter: 'Capitolo 01', duration: '08:20', thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
    '2': { title: 'Geometrie, Spazio & Prospettiva', chapter: 'Capitolo 02', duration: '12:45', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
    '3': { title: 'Motion Design & Micro-interazioni', chapter: 'Capitolo 03', duration: '15:10', thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
    '4': { title: 'Architettura dei Sistemi UI 2026', chapter: 'Capitolo 04', duration: '18:30', thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' }
  };

  const playCenterBtn = document.getElementById('video-play-center-btn');
  const playIcon = document.getElementById('center-play-icon');
  const playBottomBtn = document.getElementById('video-play-btn');
  const overlayTitle = document.getElementById('video-overlay-title');
  const mainHeading = document.getElementById('video-main-heading');
  const mainImg = document.getElementById('main-video-img');
  const timeTot = document.getElementById('video-time-tot');
  const lateralItems = document.querySelectorAll('.video-lateral-item');

  function togglePlay() {
    isPlaying = !isPlaying;
    if (playIcon) playIcon.textContent = isPlaying ? '❚❚' : '▶';
    if (playBottomBtn) playBottomBtn.textContent = isPlaying ? '❚❚' : '▶';
    if (mainImg) {
      mainImg.style.transform = isPlaying ? 'scale(1.05)' : 'scale(1.0)';
    }
  }

  playCenterBtn?.addEventListener('click', togglePlay);
  playBottomBtn?.addEventListener('click', togglePlay);

  lateralItems.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (!id || !videos[id]) return;
      activeId = id;
      const v = videos[id];
      if (overlayTitle) overlayTitle.textContent = v.chapter + ': ' + v.title;
      if (mainHeading) mainHeading.textContent = v.title;
      if (mainImg) mainImg.src = v.thumb;
      if (timeTot) timeTot.textContent = v.duration;

      lateralItems.forEach((el) => {
        el.className = 'video-lateral-item p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800/80 cursor-pointer flex items-center gap-2.5 transition-all text-neutral-300';
      });
      item.className = 'video-lateral-item p-2 rounded-xl border border-rose-500/60 bg-rose-950/40 ring-1 ring-rose-500/50 cursor-pointer flex items-center gap-2.5 transition-all text-white';

      isPlaying = true;
      if (playIcon) playIcon.textContent = '❚❚';
      if (playBottomBtn) playBottomBtn.textContent = '❚❚';
      if (mainImg) mainImg.style.transform = 'scale(1.05)';
    });
  });
})();
`;
