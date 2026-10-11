// atelier-mockup.html 아이콘 세트 (1.6px 라인)
const paths = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.5 3.9 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.1 0 5.3 3 4.2 6.2C19.5 15.4 12 20 12 20z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></>,
  bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  share: <><path d="M12 3v13M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></>,
  back: <path d="m15 5-7 7 7 7" />,
  more: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sprout: <><path d="M12 21v-9" /><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8z" /><path d="M12 14c0-4 3-7 8-7 0 4-3 7-8 7z" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>,
  truck: <><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  frame: <><rect x="3" y="3" width="18" height="18" rx="1" /><rect x="7" y="7" width="10" height="10" /></>,
  chev: <path d="m9 5 7 7-7 7" />,
  pen: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>,
  post: <><rect x="4" y="3" width="16" height="12" rx="1.5" /><path d="M4 19h16M4 22h10" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  alert: <><path d="M12 4 2.5 20h19z" /><path d="M12 10v4M12 17v.5" /></>,
  care: <path d="M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 22, filled, className, label }: {
  name: IconName
  size?: number
  filled?: boolean
  className?: string
  label?: string
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" className={className}
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={size <= 14 ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}
      style={{ flex: 'none' }}
    >
      {paths[name]}
    </svg>
  )
}
