import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

type PathDef = {
  d?: string;
  points?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
};

const SvgIcon = ({ size = 24, children, ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    {children}
  </svg>
);

const makeIcon =
  (paths: Array<PathDef & { type?: 'path' | 'circle' | 'rect' | 'polyline' | 'line' }>) =>
  (props: IconProps) => (
    <SvgIcon {...props}>
      {paths.map((item, index) => {
        if (item.type === 'circle') return <circle key={index} cx={item.cx} cy={item.cy} r={item.r} />;
        if (item.type === 'rect') {
          return (
            <rect
              height={item.height}
              key={index}
              rx={item.rx}
              width={item.width}
              x={item.x}
              y={item.y}
            />
          );
        }
        if (item.type === 'polyline') return <polyline key={index} points={item.points} />;
        if (item.type === 'line') return <line key={index} x1={item.x} x2={item.width} y1={item.y} y2={item.height} />;
        return <path d={item.d} key={index} />;
      })}
    </SvgIcon>
  );

export const AlertCircle = makeIcon([
  { type: 'circle', cx: 12, cy: 12, r: 10 },
  { d: 'M12 8v4' },
  { d: 'M12 16h.01' },
]);

export const AudioLines = makeIcon([
  { d: 'M4 10v4' },
  { d: 'M8 7v10' },
  { d: 'M12 4v16' },
  { d: 'M16 7v10' },
  { d: 'M20 10v4' },
]);

export const AudioWaveform = AudioLines;

export const Clock3 = makeIcon([
  { type: 'circle', cx: 12, cy: 12, r: 10 },
  { d: 'M12 6v6l4 2' },
]);

export const Cpu = makeIcon([
  { type: 'rect', x: 6, y: 6, width: 12, height: 12, rx: 2 },
  { d: 'M9 1v3' },
  { d: 'M15 1v3' },
  { d: 'M9 20v3' },
  { d: 'M15 20v3' },
  { d: 'M20 9h3' },
  { d: 'M20 15h3' },
  { d: 'M1 9h3' },
  { d: 'M1 15h3' },
]);

export const Disc3 = makeIcon([
  { type: 'circle', cx: 12, cy: 12, r: 10 },
  { type: 'circle', cx: 12, cy: 12, r: 2 },
  { d: 'M6 12a6 6 0 0 1 6-6' },
  { d: 'M18 12a6 6 0 0 1-6 6' },
]);

export const Download = makeIcon([
  { d: 'M12 3v12' },
  { d: 'm7 10 5 5 5-5' },
  { d: 'M5 21h14' },
]);

export const FileAudio = makeIcon([
  { d: 'M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z' },
  { d: 'M14 2v5h5' },
  { d: 'M9 15v-3' },
  { d: 'M12 16v-5' },
  { d: 'M15 15v-3' },
]);

export const Gauge = makeIcon([
  { d: 'M4 14a8 8 0 0 1 16 0' },
  { d: 'M12 14l4-4' },
  { d: 'M5 19h14' },
]);

export const HardDrive = makeIcon([
  { type: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 },
  { d: 'M7 15h.01' },
  { d: 'M11 15h6' },
]);

export const Headphones = makeIcon([
  { d: 'M3 14a9 9 0 0 1 18 0' },
  { d: 'M4 14v5a2 2 0 0 0 2 2h2v-7H4z' },
  { d: 'M20 14v5a2 2 0 0 1-2 2h-2v-7h4z' },
]);

export const Loader2 = (props: IconProps) => (
  <SvgIcon {...props}>
    <path d="M21 12a9 9 0 1 1-6.2-8.56" />
  </SvgIcon>
);

export const Mic2 = makeIcon([
  { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z' },
  { d: 'M19 10v2a7 7 0 0 1-14 0v-2' },
  { d: 'M12 19v3' },
]);

export const Music2 = makeIcon([
  { d: 'M9 18V5l12-2v13' },
  { type: 'circle', cx: 6, cy: 18, r: 3 },
  { type: 'circle', cx: 18, cy: 16, r: 3 },
]);

export const RotateCcw = makeIcon([
  { d: 'M3 12a9 9 0 1 0 3-6.7' },
  { d: 'M3 3v6h6' },
]);

export const ShieldCheck = makeIcon([
  { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { d: 'm9 12 2 2 4-4' },
]);

export const SlidersHorizontal = makeIcon([
  { d: 'M3 6h10' },
  { d: 'M17 6h4' },
  { d: 'M3 12h4' },
  { d: 'M11 12h10' },
  { d: 'M3 18h12' },
  { d: 'M19 18h2' },
  { type: 'circle', cx: 15, cy: 6, r: 2 },
  { type: 'circle', cx: 9, cy: 12, r: 2 },
  { type: 'circle', cx: 17, cy: 18, r: 2 },
]);

export const Sparkles = makeIcon([
  { d: 'm12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z' },
  { d: 'm19 14 .8 1.8 1.7.7-1.7.7L19 19l-.8-1.8-1.7-.7 1.7-.7z' },
  { d: 'm5 14 .8 1.8 1.7.7-1.7.7L5 19l-.8-1.8-1.7-.7 1.7-.7z' },
]);

export const SplitSquareHorizontal = makeIcon([
  { type: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 },
  { d: 'M12 5v14' },
  { d: 'M7 12h2' },
  { d: 'M15 12h2' },
]);

export const Timer = makeIcon([
  { type: 'circle', cx: 12, cy: 13, r: 8 },
  { d: 'M12 9v4l3 2' },
  { d: 'M9 2h6' },
]);

export const UploadCloud = makeIcon([
  { d: 'M16 16l-4-4-4 4' },
  { d: 'M12 12v9' },
  { d: 'M20 16.5A4.5 4.5 0 0 0 17.4 8 7 7 0 0 0 4 10.5 4 4 0 0 0 4 18h3' },
]);

export const Wand2 = makeIcon([
  { d: 'M15 4V2' },
  { d: 'M15 16v-2' },
  { d: 'M8 9h2' },
  { d: 'M20 9h2' },
  { d: 'M17.8 6.2 19 5' },
  { d: 'M15 9l-9 9-2-2 9-9z' },
]);
