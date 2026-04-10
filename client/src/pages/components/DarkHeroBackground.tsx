export default function DarkHeroBackground({ color = "#00D4AA" }: { color?: string }) {
  return (
    <div className="absolute inset-0 bg-[#060E1A] overflow-hidden">
      <div
        className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: color }}
      />
      <div
        className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ background: color }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
