import React, { useState } from 'react';
import { Sparkles, Info, ShieldAlert, Award } from 'lucide-react';
import { KundliCalculationResult, PlanetPosition, ZODIAC_SIGNS, PLANET_DETAILS, HOUSE_NAMES } from '../utils/vedicKundliCalc';

interface NorthIndianKundliChartProps {
  kundliData: KundliCalculationResult;
  lang: string;
  className?: string;
  title?: string;
  chartType?: 'D1' | 'D9' | 'D10';
  onChartTypeChange?: (type: 'D1' | 'D9' | 'D10') => void;
}

export const NorthIndianKundliChart: React.FC<NorthIndianKundliChartProps> = ({
  kundliData,
  lang,
  className = '',
  title,
  chartType = 'D1',
  onChartTypeChange,
}) => {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(1);

  // Determine active houses based on chart type
  const housesData =
    chartType === 'D9'
      ? kundliData.housesD9
      : chartType === 'D10'
      ? kundliData.housesD10
      : kundliData.housesD1;

  // Language helper
  const getLangCode = (l: string): 'hi' | 'en' | 'gu' | 'mr' | 'ta' | 'te' | 'pa' | 'bn' | 'ur' => {
    const valid = ['hi', 'en', 'gu', 'mr', 'ta', 'te', 'pa', 'bn', 'ur'];
    return (valid.includes(l) ? l : 'hi') as any;
  };

  const currentLangCode = getLangCode(lang);

  // Planet Abbreviation Helper
  const getPlanetAbbr = (planetId: string, isRetro: boolean): string => {
    const pDetail = PLANET_DETAILS[planetId];
    if (!pDetail) return planetId;
    const abbr = pDetail.abbr[currentLangCode] || pDetail.abbr['en'] || planetId;
    return isRetro ? `${abbr}(R)` : abbr;
  };

  // Planet Full Name Helper
  const getPlanetFullName = (planetId: string): string => {
    const pDetail = PLANET_DETAILS[planetId];
    if (!pDetail) return planetId;
    return pDetail.full[currentLangCode] || pDetail.full['en'] || planetId;
  };

  // Zodiac Sign Name Helper
  const getSignName = (signNum: number): string => {
    const signObj = ZODIAC_SIGNS[signNum - 1];
    if (!signObj) return `Sign ${signNum}`;
    return (signObj as any)[currentLangCode] || signObj.hi || signObj.en;
  };

  // Lagna Label
  const getLagnaLabel = (): string => {
    return PLANET_DETAILS['lagna'].abbr[currentLangCode] || 'लग्';
  };

  // Coordinate geometry for 12 Houses in North Indian Chart Layout (500x500 SVG)
  // House 1: Top Center Diamond
  // House 2: Top Left Triangle
  // House 3: Upper-Middle Left Triangle
  // House 4: Left Center Diamond
  // House 5: Lower-Middle Left Triangle
  // House 6: Bottom Left Triangle
  // House 7: Bottom Center Diamond
  // House 8: Bottom Right Triangle
  // House 9: Lower-Middle Right Triangle
  // House 10: Right Center Diamond
  // House 11: Upper-Middle Right Triangle
  // House 12: Top Right Triangle
  const housePolygons: Record<number, { points: string; numberPos: { x: number; y: number }; planetsPos: { x: number; y: number } }> = {
    1: {
      points: '250,20 135,135 250,250 365,135',
      numberPos: { x: 250, y: 195 },
      planetsPos: { x: 250, y: 105 },
    },
    2: {
      points: '20,20 250,20 135,135',
      numberPos: { x: 135, y: 110 },
      planetsPos: { x: 135, y: 55 },
    },
    3: {
      points: '20,20 135,135 20,250',
      numberPos: { x: 110, y: 135 },
      planetsPos: { x: 55, y: 135 },
    },
    4: {
      points: '20,250 135,135 250,250 135,365',
      numberPos: { x: 195, y: 250 },
      planetsPos: { x: 105, y: 250 },
    },
    5: {
      points: '20,250 135,365 20,480',
      numberPos: { x: 110, y: 365 },
      planetsPos: { x: 55, y: 365 },
    },
    6: {
      points: '20,480 250,480 135,365',
      numberPos: { x: 135, y: 390 },
      planetsPos: { x: 135, y: 445 },
    },
    7: {
      points: '250,480 135,365 250,250 365,365',
      numberPos: { x: 250, y: 305 },
      planetsPos: { x: 250, y: 395 },
    },
    8: {
      points: '480,480 250,480 365,365',
      numberPos: { x: 365, y: 390 },
      planetsPos: { x: 365, y: 445 },
    },
    9: {
      points: '480,480 365,365 480,250',
      numberPos: { x: 390, y: 365 },
      planetsPos: { x: 445, y: 365 },
    },
    10: {
      points: '480,250 365,135 250,250 365,365',
      numberPos: { x: 305, y: 250 },
      planetsPos: { x: 395, y: 250 },
    },
    11: {
      points: '480,20 365,135 480,250',
      numberPos: { x: 390, y: 135 },
      planetsPos: { x: 445, y: 135 },
    },
    12: {
      points: '480,20 250,20 365,135',
      numberPos: { x: 365, y: 110 },
      planetsPos: { x: 365, y: 55 },
    },
  };

  const selectedHouseInfo = selectedHouse ? housesData[selectedHouse] : null;
  const houseNameObj = selectedHouse ? HOUSE_NAMES[selectedHouse] : null;

  return {
    render: (
      <div className={`flex flex-col items-center w-full max-w-xl mx-auto ${className}`}>
        {/* Divisional Chart Switcher Tabs */}
        {onChartTypeChange && (
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 mb-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-xs w-full justify-center">
            <button
              type="button"
              onClick={() => onChartTypeChange('D1')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                chartType === 'D1'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-lg shadow-[#D4AF37]/20 scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'hi' ? 'लग्न कुंडली (D1)' : lang === 'gu' ? 'લગ્ન કુંડળી (D1)' : 'Birth Chart (D1)'}
            </button>
            <button
              type="button"
              onClick={() => onChartTypeChange('D9')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                chartType === 'D9'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-lg shadow-[#D4AF37]/20 scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'hi' ? 'नवांश कुंडली (D9)' : lang === 'gu' ? 'નવાંશ કુંડળી (D9)' : 'Navamsha (D9)'}
            </button>
            <button
              type="button"
              onClick={() => onChartTypeChange('D10')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                chartType === 'D10'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-lg shadow-[#D4AF37]/20 scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'hi' ? 'दशांश कुंडली (D10)' : lang === 'gu' ? 'દશાંશ કુંડળી (D10)' : 'Dashamsha (D10)'}
            </button>
          </div>
        )}

        {/* Traditional North Indian Kundli Chart SVG Canvas */}
        <div className="relative w-full aspect-square max-w-[460px] p-2 bg-gradient-to-b from-[#0F172A] via-[#0A0E1A] to-[#050B18] border-2 border-[#D4AF37]/50 rounded-3xl shadow-[0_0_35px_rgba(212,175,55,0.15)] overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

          <svg
            viewBox="0 0 500 500"
            className="w-full h-full select-none"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
          >
            <defs>
              {/* Gold gradient for chart outer & inner borders */}
              <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>

              {/* Active house highlight gradient */}
              <linearGradient id="activeHouse" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.35)" />
                <stop offset="100%" stopColor="rgba(184, 134, 11, 0.15)" />
              </linearGradient>
            </defs>

            {/* Background Outer Border */}
            <rect
              x="20"
              y="20"
              width="460"
              height="460"
              fill="#0A0E1A"
              stroke="url(#goldBorder)"
              strokeWidth="3.5"
              rx="4"
            />

            {/* Render 12 Houses */}
            {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
              const poly = housePolygons[houseNum];
              const houseData = housesData[houseNum];
              const isSelected = selectedHouse === houseNum;
              const isLagnaHouse = houseNum === 1;

              return (
                <g key={houseNum} className="cursor-pointer group" onClick={() => setSelectedHouse(houseNum)}>
                  {/* House Polygon Region */}
                  <polygon
                    points={poly.points}
                    fill={isSelected ? 'url(#activeHouse)' : 'rgba(15, 23, 42, 0.65)'}
                    stroke="#D4AF37"
                    strokeWidth={isSelected ? '2.5' : '1.2'}
                    strokeOpacity={isSelected ? '1' : '0.4'}
                    className="transition-all duration-200 group-hover:fill-[#D4AF37]/20"
                  />

                  {/* Zodiac Sign Number (Standard English Numerals 1-12) */}
                  <text
                    x={poly.numberPos.x}
                    y={poly.numberPos.y}
                    fill="#F59E0B"
                    fontSize="13"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none tracking-wider"
                  >
                    {houseData ? houseData.signNum : ''}
                  </text>

                  {/* Planets inside House */}
                  <g transform={`translate(${poly.planetsPos.x}, ${poly.planetsPos.y})`}>
                    {/* Lagna Badge in House 1 */}
                    {isLagnaHouse && (
                      <text
                        x="0"
                        y={houseData.planets.length > 0 ? '-14' : '0'}
                        fill="#38BDF8"
                        fontSize="13"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]"
                      >
                        {getLagnaLabel()}
                      </text>
                    )}

                    {/* Planet Badges */}
                    {houseData &&
                      houseData.planets.map((p, idx) => {
                        const total = houseData.planets.length;
                        // Calculate vertical offset for stacked planets
                        const startY = isLagnaHouse ? 4 : -(total - 1) * 7;
                        const offsetY = startY + idx * 14;

                        return (
                          <text
                            key={p.id}
                            x="0"
                            y={offsetY}
                            fill={p.id === 'sun' || p.id === 'jupiter' ? '#FCD34D' : p.id === 'mars' ? '#F87171' : p.id === 'rahu' || p.id === 'ketu' ? '#C084FC' : '#F3F4F6'}
                            fontSize="11"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none"
                          >
                            {getPlanetAbbr(p.id, p.isRetrograde)}
                          </text>
                        );
                      })}
                  </g>
                </g>
              );
            })}

            {/* Inner Diagonal Lines & Midpoint Diamond Line for Crisp Vedic North Indian Chart */}
            <line x1="20" y1="20" x2="480" y2="480" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.45" />
            <line x1="480" y1="20" x2="20" y2="480" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.45" />
            <polygon
              points="250,20 20,250 250,480 480,250"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* House Inspection Panel */}
        {selectedHouseInfo && houseNameObj && (
          <div className="w-full mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs text-white/90">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {houseNameObj[currentLangCode] || houseNameObj['hi']}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {getSignName(selectedHouseInfo.signNum)} (Sign {selectedHouseInfo.signNum})
              </span>
            </div>

            {selectedHouseInfo.planets.length === 0 ? (
              <p className="text-white/50 italic text-center py-1">
                {lang === 'hi' ? 'इस भाव में कोई ग्रह उपस्थित नहीं है।' : 'No planets in this house.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedHouseInfo.planets.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {getPlanetFullName(p.id)} {p.isRetrograde && '(R)'}
                    </span>
                    <span className="text-amber-300/80 font-mono text-[11px]">
                      {p.degreeFormatted}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    ),
  }.render;
};
