import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Inline SVG icons. Kept local rather than pulling an icon package — the set is
 * small, and `currentColor` means they inherit text colour everywhere.
 */
function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 13 4.5 4.5L19 7" />
    </Svg>
  );
}

/* --- Media controls --- */

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </Svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 5v14M14.5 5v14" />
    </Svg>
  );
}

export function SoundOnIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9.5h3L12 5v14L7 14.5H4v-5Z" />
      <path d="M15.5 9.5a4 4 0 0 1 0 5" />
      <path d="M18 7a7 7 0 0 1 0 10" />
    </Svg>
  );
}

export function SoundOffIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9.5h3L12 5v14L7 14.5H4v-5Z" />
      <path d="m16 10 4 4M20 10l-4 4" />
    </Svg>
  );
}

/* --- Social icons: filled, so they read at small sizes --- */

function FilledSvg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2.05c4 0 4.75 2.5 4.75 5.8V21h-4v-5.85c0-1.4-.03-3.2-2-3.2-2 0-2.3 1.53-2.3 3.1V21h-4V9Z" />
    </FilledSvg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M12 2.2c-2.7 0-3 .01-4.06.06-1.06.05-1.79.22-2.42.47a4.9 4.9 0 0 0-1.77 1.15A4.9 4.9 0 0 0 2.6 5.65c-.25.63-.42 1.36-.47 2.42C2.08 9.13 2.07 9.43 2.07 12s.01 2.87.06 3.93c.05 1.06.22 1.79.47 2.42a4.9 4.9 0 0 0 1.15 1.77 4.9 4.9 0 0 0 1.77 1.15c.63.25 1.36.42 2.42.47 1.06.05 1.36.06 4.06.06s3-.01 4.06-.06c1.06-.05 1.79-.22 2.42-.47a5.14 5.14 0 0 0 2.92-2.92c.25-.63.42-1.36.47-2.42.05-1.06.06-1.36.06-3.93s-.01-2.87-.06-3.93c-.05-1.06-.22-1.79-.47-2.42a4.9 4.9 0 0 0-1.15-1.77 4.9 4.9 0 0 0-1.77-1.15c-.63-.25-1.36-.42-2.42-.47C15 2.21 14.7 2.2 12 2.2Zm0 1.8c2.65 0 2.92.01 3.95.06.95.04 1.47.2 1.81.34.46.18.79.39 1.13.73.34.34.55.67.73 1.13.14.34.3.86.34 1.81.05 1.03.06 1.3.06 3.93s-.01 2.9-.06 3.93c-.04.95-.2 1.47-.34 1.81-.18.46-.39.79-.73 1.13-.34.34-.67.55-1.13.73-.34.14-.86.3-1.81.34-1.03.05-1.3.06-3.95.06s-2.92-.01-3.95-.06c-.95-.04-1.47-.2-1.81-.34a3.1 3.1 0 0 1-1.13-.73 3.1 3.1 0 0 1-.73-1.13c-.14-.34-.3-.86-.34-1.81-.05-1.03-.06-1.3-.06-3.93s.01-2.9.06-3.93c.04-.95.2-1.47.34-1.81.18-.46.39-.79.73-1.13.34-.34.67-.55 1.13-.73.34-.14.86-.3 1.81-.34C9.08 4.01 9.35 4 12 4Zm0 3.06a4.94 4.94 0 1 0 0 9.88 4.94 4.94 0 0 0 0-9.88Zm0 8.14a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.29-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
    </FilledSvg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.62c-.8-.1-1.7-.16-2.5-.16-2.5 0-4.2 1.52-4.2 4.32v2.12H7.3V13h2.2v8h4Z" />
    </FilledSvg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.2 22 12 22 12s0-3.2-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </FilledSvg>
  );
}
