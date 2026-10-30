import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Music2,
  Disc,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Smartphone,
  Radio,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { MusicTrack } from '../types';

export const MusicScreen: React.FC = () => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    isFavorite,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleFavorite,
    goBack,
  } = useTrip();

  const [selectedSource, setSelectedSource] = useState<'spotify' | 'youtube' | 'device'>('spotify');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState<number>(45);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Progress animation while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredTracks = tracks.filter(
    (t) =>
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0F1923]/95 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-[#2D3D4F] flex items-center gap-3">
        <button
          type="button"
          onClick={() => goBack()}
          className="p-2 rounded-xl bg-[#1A2633] border border-[#2D3D4F] text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white">Music for the Journey</h1>
          <p className="text-xs text-white/50">Roadtrip convoy synchronised audio</p>
        </div>
      </header>

      {/* Controls Container */}
      <div className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Source Selector Chips */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedSource('spotify')}
            className={`py-3 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedSource === 'spotify'
                ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] shadow-md'
                : 'bg-[#1A2633] border-[#2D3D4F] text-white/60 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="text-xs font-bold">Spotify</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSource('youtube')}
            className={`py-3 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedSource === 'youtube'
                ? 'bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000] shadow-md'
                : 'bg-[#1A2633] border-[#2D3D4F] text-white/60 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-xs font-bold">YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSource('device')}
            className={`py-3 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedSource === 'device'
                ? 'bg-white/20 border-white text-white shadow-md'
                : 'bg-[#1A2633] border-[#2D3D4F] text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-xs font-bold">Device</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-[#243447] border border-[#2D3D4F] rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] transition-colors"
          />
        </div>

        {/* Track List */}
        <div className="space-y-2 pt-2">
          {filteredTracks.map((track: MusicTrack, idx: number) => {
            const isSelected = idx === currentTrackIndex;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(idx)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#087F5B]/20 border-[#34D399]/60 shadow-lg'
                    : 'bg-[#1A2633] border-[#2D3D4F] hover:border-white/20'
                }`}
              >
                {/* Album Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#087F5B] to-[#34D399] text-white'
                      : 'bg-[#243447] text-white/60'
                  }`}
                >
                  {isSelected ? <Music2 className="w-5 h-5" /> : <Disc className="w-5 h-5" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-bold truncate ${
                      isSelected ? 'text-[#34D399]' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Duration & Equalizer */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-white/40 font-mono">
                    {formatDuration(track.durationSeconds)}
                  </span>
                  {isSelected && isPlaying && (
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-1 bg-[#34D399] rounded-full animate-bounce h-3" />
                      <span className="w-1 bg-[#34D399] rounded-full animate-bounce delay-100 h-4" />
                      <span className="w-1 bg-[#34D399] rounded-full animate-bounce delay-200 h-2" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fixed Bottom Now Playing Bar (Matching Flutter UI) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A2633] border-t border-[#2D3D4F] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        {/* Progress Scrubber */}
        <div className="w-full bg-white/10 h-1 cursor-pointer">
          <div
            className="bg-[#34D399] h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Current track info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Favorite heart */}
            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isFavorite ? 'text-red-500' : 'text-white/40 hover:text-white'
              }`}
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
            </button>

            {/* Skip previous */}
            <button
              type="button"
              onClick={prevTrack}
              className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-[#34D399] hover:bg-[#10B981] text-[#0F1923] flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Skip next */}
            <button
              type="button"
              onClick={nextTrack}
              className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
