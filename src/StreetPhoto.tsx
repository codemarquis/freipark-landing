import { type MouseEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import berlinStreet from './assets/photos/berlin-street.jpg';

// Real photo of a Berlin street (Fernsehturm + elevated U-Bahn, Prenzlauer
// Berg), annotated with pin markers — a free spot found in the gap along
// the curb, and the already-parked cars around it. Percent-based positions
// are eyeballed against the photo's visible car row, not measured pixel
// coordinates — illustrative, not a real geodata overlay.
//
// Presented as a real 3D object (CSS perspective + rotateX/rotateY driven
// by pointer position, preserve-3d so the pins sit on their own translateZ
// layer above the photo plane) rather than a flat image — a tilt/parallax
// card, not a modeled scene.

type Marker = {
  left: string;
  top: string;
  kind: 'free' | 'parked';
};

const MARKERS: Marker[] = [
  { left: '21%', top: '78%', kind: 'free' },
  { left: '9%', top: '84%', kind: 'parked' },
  { left: '31%', top: '82%', kind: 'parked' },
  { left: '39%', top: '80%', kind: 'parked' },
];

function FreePin() {
  const { t } = useTranslation();
  return (
    <div className="relative -translate-x-1/2 -translate-y-full">
      <div className="flex flex-col items-center drop-shadow-lg">
        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          {t('streetPhoto.freeSpot')}
        </span>
        <svg width="26" height="32" viewBox="0 0 26 32" className="-mt-0.5">
          <path
            d="M13 0C5.8 0 0 5.8 0 13c0 9 13 19 13 19s13-10 13-19C26 5.8 20.2 0 13 0z"
            fill="#2563eb"
          />
          <circle cx="13" cy="13" r="5" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function ParkedBadge() {
  const { t } = useTranslation();
  return (
    <div className="relative -translate-x-1/2 -translate-y-1/2">
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-700/90 text-xs shadow-lg"
        title={t('streetPhoto.parked')}
      >
        🚗
      </div>
    </div>
  );
}

const MAX_TILT_DEG = 10;

export function StreetPhoto() {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [active, setActive] = useState(false);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    setTilt({
      rx: (0.5 - py) * MAX_TILT_DEG * 2,
      ry: (px - 0.5) * MAX_TILT_DEG * 2,
    });
  }

  function reset() {
    setActive(false);
    setTilt({ rx: 0, ry: 0 });
  }

  return (
    <div>
      <div
        ref={wrapRef}
        className="[perspective:1200px]"
        onMouseMove={(e) => {
          setActive(true);
          handleMove(e);
        }}
        onMouseLeave={reset}
      >
        <div
          className="relative h-[320px] w-full overflow-hidden rounded-xl shadow-2xl sm:h-[420px] [transform-style:preserve-3d]"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: active ? 'transform 60ms linear' : 'transform 400ms ease-out',
          }}
        >
          <img
            src={berlinStreet}
            alt={t('streetPhoto.altText')}
            className="h-full w-full object-cover"
          />
          {MARKERS.map((m, i) => (
            <div
              key={i}
              className="absolute [transform:translateZ(28px)]"
              style={{ left: m.left, top: m.top }}
            >
              {m.kind === 'free' ? <FreePin /> : <ParkedBadge />}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" /> {t('streetPhoto.freeSpot')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-700" /> {t('streetPhoto.parked')}
        </span>
      </div>
    </div>
  );
}
