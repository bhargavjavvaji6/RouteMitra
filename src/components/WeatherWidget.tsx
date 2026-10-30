import React, { useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Compass,
} from 'lucide-react';
import { fetchDestinationWeather, DestinationWeather } from '../services/weatherService';

interface WeatherWidgetProps {
  destination: string;
  isOnline?: boolean;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  destination,
  isOnline = true,
  className = '',
}) => {
  const [weather, setWeather] = useState<DestinationWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadWeather = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const data = await fetchDestinationWeather(destination);
      setWeather(data);
    } catch (err) {
      console.error('Error fetching destination weather:', err);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    loadWeather();
  }, [destination, isOnline]);

  // Weather icon component selector
  const renderWeatherIcon = (iconName: DestinationWeather['icon'], sizeClass = 'w-4 h-4') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${sizeClass} text-amber-400 shrink-0 animate-spin-slow`} />;
      case 'moon':
        return <Moon className={`${sizeClass} text-indigo-300 shrink-0`} />;
      case 'cloud-sun':
        return <CloudSun className={`${sizeClass} text-amber-300 shrink-0`} />;
      case 'cloud':
        return <Cloud className={`${sizeClass} text-slate-300 shrink-0`} />;
      case 'cloud-fog':
        return <CloudFog className={`${sizeClass} text-slate-300 shrink-0`} />;
      case 'cloud-rain':
        return <CloudRain className={`${sizeClass} text-sky-400 shrink-0 animate-bounce`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${sizeClass} text-amber-400 shrink-0 animate-pulse`} />;
      case 'snowflake':
        return <Snowflake className={`${sizeClass} text-cyan-300 shrink-0`} />;
      default:
        return <Sun className={`${sizeClass} text-amber-400 shrink-0`} />;
    }
  };

  // Advisory color mapper
  const getAdvisoryStyles = (level: DestinationWeather['drivingAdvisory']['level']) => {
    switch (level) {
      case 'warning':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          badge: 'bg-rose-500 text-white',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
        };
      case 'caution':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
      case 'good':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        };
    }
  };

  if (loading && !weather) {
    return (
      <div
        className={`bg-[#16222F]/90 backdrop-blur-md rounded-2xl px-3 py-2 border border-[#27384A] shadow-md flex items-center justify-between text-xs text-white/70 animate-pulse ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-600 animate-spin" />
          <span>Fetching destination live weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const advisoryStyles = getAdvisoryStyles(weather.drivingAdvisory.level);

  return (
    <div
      className={`bg-[#16222F]/95 backdrop-blur-md rounded-2xl border border-[#27384A] shadow-xl overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Compact Main Bar */}
      <div className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
        {/* Left: Weather Icon + Destination Temp & Condition */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-left cursor-pointer min-w-0 flex-1 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-xl bg-[#202E3E] border border-white/10 flex items-center justify-center shrink-0">
            {renderWeatherIcon(weather.icon, 'w-4 h-4')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-white text-sm">{weather.temperature}°C</span>
              <span className="text-[11px] text-white/70 truncate hidden sm:inline">• {weather.condition}</span>
              {weather.isCached && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cached
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50 truncate">
              Dest: {weather.resolvedLocationName || destination}
            </p>
          </div>
        </button>

        {/* Right: Driving Safety Badge + Expand Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors ${advisoryStyles.bg}`}
          >
            {advisoryStyles.icon}
            <span className="truncate max-w-[120px] sm:max-w-none">{weather.drivingAdvisory.badge}</span>
          </span>

          <button
            type="button"
            onClick={() => loadWeather(true)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse weather details' : 'Expand weather details'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-[#27384A]/70 space-y-2 text-xs">
          {/* Real-Time Driving Route Weather Alert Banner (Matches image_fae85536.png style) */}
          <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${advisoryStyles.bg}`}>
            <div className="mt-0.5">{advisoryStyles.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-[11px] leading-tight text-white">
                {weather.drivingAdvisory.badge}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                {weather.drivingAdvisory.advice}
              </p>
            </div>
          </div>

          {/* Weather Metric Chips */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Feels Like */}
            <div className="bg-[#202E3E]/80 rounded-xl p-2 border border-white/5 text-center">
              <p className="text-[10px] text-white/50">Feels Like</p>
              <p className="text-xs font-bold text-white mt-0.5">{weather.apparentTemperature}°C</p>
              <p className="text-[9px] text-white/40">{weather.tempMin}° / {weather.tempMax}°</p>
            </div>

            {/* Precipitation Prob */}
            <div className="bg-[#202E3E]/80 rounded-xl p-2 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-sky-400">
                <Droplets className="w-3 h-3" />
                <span>Precip</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">{weather.precipitationProb}%</p>
              <p className="text-[9px] text-white/40">Chance</p>
            </div>

            {/* Wind Speed */}
            <div className="bg-[#202E3E]/80 rounded-xl p-2 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-300">
                <Wind className="w-3 h-3" />
                <span>Wind</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">{weather.windSpeed} km/h</p>
              <p className="text-[9px] text-white/40">Surface</p>
            </div>

            {/* Humidity */}
            <div className="bg-[#202E3E]/80 rounded-xl p-2 border border-white/5 text-center">
              <p className="text-[10px] text-emerald-300">Humidity</p>
              <p className="text-xs font-bold text-white mt-0.5">{weather.humidity}%</p>
              <p className="text-[9px] text-white/40">RH Level</p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#34D399]" />
              <span>Coords: {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E</span>
            </span>
            <span>Updated: {weather.lastUpdated}</span>
          </div>
        </div>
      )}
    </div>
  );
};
