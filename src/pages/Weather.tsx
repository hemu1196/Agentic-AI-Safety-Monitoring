import React from 'react';
import { useProject } from '../hooks/useProject';
import { MetricCard } from '../components/MetricCard';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const Weather: React.FC = () => {
  const { projectData } = useProject();
  const weather = projectData.weather;

  // Map icon names to components
  const getWeatherIcon = (name: string, sizeClass: string = "w-5 h-5") => {
    switch (name) {
      case 'Sun':
        return <Sun className={`${sizeClass} text-amber-500`} />;
      case 'CloudSun':
        return <CloudSun className={`${sizeClass} text-orange-500`} />;
      case 'Cloud':
        return <Cloud className={`${sizeClass} text-slate-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${sizeClass} text-blue-500`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${sizeClass} text-purple-500`} />;
      case 'CloudWind':
        return <Wind className={`${sizeClass} text-slate-500`} />;
      default:
        return <CloudSun className={`${sizeClass} text-orange-500`} />;
    }
  };

  // Helper to color hazards
  const getHazardBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'High':
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Weather Monitoring
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Local microclimate forecasts and environmental construction safety impacts.
        </p>
      </div>

      {/* Current Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100/50">
            {getWeatherIcon(weather.condition === 'Partly Cloudy' ? 'CloudSun' : weather.condition === 'Sunny' ? 'Sun' : 'CloudRain', "w-12 h-12")}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Outlook</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{weather.location}</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{weather.condition} conditions today</p>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">{weather.temp}°C</span>
          <span className="text-sm text-slate-400 font-bold">Feels like {weather.temp - 1}°C</span>
        </div>
      </div>

      {/* Weather Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Ambient Temperature"
          value={`${weather.temp}°C`}
          subtext="Sensor nodes calibrated"
          icon={<Thermometer className="w-5 h-5" />}
        />
        <MetricCard
          title="Relative Humidity"
          value={`${weather.humidity}%`}
          subtext="Concrete curing threshold safe"
          icon={<Droplets className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Wind Velocity"
          value={`${weather.windSpeed} km/h`}
          changeText={weather.windSpeed > 25 ? 'High Wind Alert' : 'Safe limits'}
          isPositive={weather.windSpeed <= 25}
          subtext="Crane limits at 35 km/h"
          icon={<Wind className="w-5 h-5 text-slate-500" />}
        />
        <MetricCard
          title="Rain Probability"
          value={`${weather.rainProb}%`}
          changeText={weather.rainProb > 50 ? 'Precipitation Warning' : 'Dry conditions'}
          isPositive={weather.rainProb <= 50}
          subtext="Outdoor works scheduled"
          icon={<CloudRain className="w-5 h-5 text-indigo-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-Day Forecast */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">7-Day Meteorological Forecast</h3>
            <p className="text-xs font-semibold text-slate-400">Weekly outlook indices for scheduling outdoor works</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weather.forecast.map((f, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-between text-center gap-2"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.day}</span>
                {getWeatherIcon(f.icon, "w-6 h-6")}
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{f.temp}°C</span>
                <span className="text-[9px] font-bold text-blue-500">{f.rainProb}% rain</span>
              </div>
            ))}
          </div>
        </div>

        {/* Construction Impact Assessment */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Construction Safety Assessment</h3>
            <p className="text-xs font-semibold text-slate-400 mb-5">Current environmental safety hazards</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rain Hazard Risk</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getHazardBadge(weather.impacts.rain)}`}>
                {weather.impacts.rain}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wind Lift Crane Hazard</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getHazardBadge(weather.impacts.wind)}`}>
                {weather.impacts.wind}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heat Fatigue Hazard</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getHazardBadge(weather.impacts.heat)}`}>
                {weather.impacts.heat}
              </span>
            </div>
          </div>

          {/* Actionable insight */}
          <div className="mt-5 p-3 rounded-xl bg-orange-50/30 border border-orange-100/50 dark:bg-orange-950/10 dark:border-orange-900/30 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 leading-normal">
              <strong>Notice:</strong> High-altitude wind gusts in Zone B suspension sections should be monitored. Halt crane operations if wind velocity registers &gt; 35 km/h.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
