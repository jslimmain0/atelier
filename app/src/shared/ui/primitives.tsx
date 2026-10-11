import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from './Icon'
import s from './ui.module.css'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export function Avatar({ name, tone, size = 36, className }: { name: string; tone: string; size?: number; className?: string }) {
  return (
    <div className={cx(s.av, className)} style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: tone }} aria-hidden>
      {name[0]}
    </div>
  )
}

/** 인증 작가 마크 (공개 인증 항목 ≥ 기준 개수일 때만 렌더) */
export function VerifiedBadge({ show, size = 17 }: { show: boolean; size?: number }) {
  if (!show) return null
  return (
    <span className={s.verified} style={{ width: size, height: size }} title="인증 작가" aria-label="인증 작가">
      <Icon name="check" size={Math.round(size * 0.6)} />
    </span>
  )
}

export type Tone = 'sale' | 'ok' | 'warn' | 'patron' | 'accent' | 'danger' | 'line'
export function Chip({ tone = 'line', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx(s.chip, s[`chip-${tone}`], className)}>{children}</span>
}

type BtnVariant = 'dark' | 'accent' | 'patron' | 'ghost' | 'danger'
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; block?: boolean }
export function Button({ variant = 'dark', size = 'md', block, className, ...rest }: BtnProps) {
  return <button className={cx(s.btn, s[`btn-${variant}`], size !== 'md' && s[`btn-${size}`], block && s['btn-block'], className)} {...rest} />
}
export function ButtonLink({ to, variant = 'dark', size = 'md', block, children }: { to: string; variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; block?: boolean; children: ReactNode }) {
  return <Link to={to} className={cx(s.btn, s[`btn-${variant}`], size !== 'md' && s[`btn-${size}`], block && s['btn-block'])}>{children}</Link>
}

export function AppBar({ title, left, right, align = 'center', logo }: { title?: ReactNode; left?: ReactNode; right?: ReactNode; align?: 'center' | 'left'; logo?: boolean }) {
  return (
    <header className={s.appbar}>
      {logo ? <div className={s.logo}>atelier<i>.</i></div> : (
        <>
          {align === 'center' && <div className={s['appbar-slot']}>{left}</div>}
          <h1 className={cx(s['appbar-title'], align === 'left' && s['appbar-title-left'])}>{title}</h1>
        </>
      )}
      <div className={s['appbar-slot']}>{right}</div>
    </header>
  )
}

export function BackButton() {
  return (
    <button onClick={() => (history.length > 1 ? history.back() : (location.href = '/'))} aria-label="뒤로">
      <Icon name="back" />
    </button>
  )
}

export function Seg<T extends string>({ items, value, onChange, extra }: { items: [T, string][]; value: T; onChange: (v: T) => void; extra?: ReactNode }) {
  return (
    <div className={s.seg} role="tablist">
      {items.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} className={s['seg-item']} onClick={() => onChange(k)}>{label}</button>
      ))}
      {extra && <span className={s['seg-extra']}>{extra}</span>}
    </div>
  )
}

/** 선택 카드 (mockup .opt). type=radio | checkbox */
export function Opt({ type = 'radio', checked, onClick, title, children, right, tone }: {
  type?: 'radio' | 'checkbox'; checked: boolean; onClick: () => void; title: ReactNode; children?: ReactNode; right?: ReactNode; tone?: 'patron'
}) {
  return (
    <button type="button" role={type} aria-checked={checked} onClick={onClick} className={cx(s.opt, tone && s['opt-patron'])}>
      {type === 'radio' ? <span className={s.radio} /> : <span className={s.box}><Icon name="check" size={13} /></span>}
      <span className={s['opt-body']}><span className={s['opt-title']}>{title}</span>{children}</span>
      {right && <span className={s['opt-right']}>{right}</span>}
    </button>
  )
}

/** 하단 고정 바 (가격 + 행동). 페이지 끝에 spacer를 함께 렌더 */
export function BottomBar({ children, column }: { children: ReactNode; column?: boolean }) {
  return (
    <>
      <div className={s['bottombar-spacer']} />
      <div className={cx(s.bottombar, column && s['bottombar-col'])}>{children}</div>
    </>
  )
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className={s.empty}><b>{title}</b>{children}{action && <div>{action}</div>}</div>
}
