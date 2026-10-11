import { useId, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from './Icon'
import s from './blocks.module.css'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- 폼 ---------- */
export function Field({ label, required, hint, error, children }: { label: ReactNode; required?: boolean; hint?: ReactNode; error?: string; children: (id: string, describedBy?: string) => ReactNode }) {
  const id = useId()
  const descId = `${id}-desc`
  return (
    <div className={cx(s.field, !!error && s.invalid)}>
      <label htmlFor={id} className={s.label}>{label}{required && <span className={s.req}> *</span>}</label>
      {children(id, hint || error ? descId : undefined)}
      {error ? <span id={descId} className={s.err} role="alert">{error}</span> : hint && <span id={descId} className={s.hint}>{hint}</span>}
    </div>
  )
}

/** 이미지 여러 장 선택 → 미리보기. mock 단계에서는 object URL을 그대로 사용 */
export function ImagePicker({ label, required, max = 10, value, onChange, error, hint }: {
  label: string; required?: boolean; max?: number; value: string[]; onChange: (urls: string[]) => void; error?: string; hint?: string
}) {
  const id = useId()
  return (
    <div className={cx(s.field, !!error && s.invalid)}>
      <span className={s.label} id={`${id}-l`}>{label}{required && <span className={s.req}> *</span>}</span>
      <label className={s.drop}>
        <Icon name="upload" />
        <span>이미지 선택 · 최대 {max}장</span>
        {hint && <small>{hint}</small>}
        <input type="file" accept="image/*" multiple className="sr-only" aria-labelledby={`${id}-l`}
          onChange={e => {
            const urls = [...(e.target.files ?? [])].map(f => URL.createObjectURL(f))
            onChange([...value, ...urls].slice(0, max))
            e.target.value = ''
          }} />
      </label>
      {value.length > 0 && (
        <div className={s.thumbs}>
          {value.map((u, i) => (
            <div key={u} className={s.thumb}>
              <img src={u} alt={`선택한 이미지 ${i + 1}`} />
              {i === 0 && <span className={s.first}>대표</span>}
              <button type="button" aria-label={`이미지 ${i + 1} 빼기`} onClick={() => onChange(value.filter(x => x !== u))}>×</button>
            </div>
          ))}
        </div>
      )}
      {error && <span className={s.err} role="alert">{error}</span>}
    </div>
  )
}

/** 파일 이름만 받는 선택 (인증 서류 등) */
export function FilePicker({ label, value, onChange, hint }: { label: string; value: { name: string; url: string }[]; onChange: (v: { name: string; url: string }[]) => void; hint?: string }) {
  const id = useId()
  return (
    <div className={s.field}>
      <span className={s.label} id={`${id}-l`}>{label}<span className={s.req}> *</span></span>
      <label className={s.drop} style={{ minHeight: 84 }}>
        <Icon name="upload" />
        <span>{value.length ? value.map(f => f.name).join(', ') : '파일 선택 (PDF · 이미지)'}</span>
        <input type="file" multiple accept="image/*,application/pdf" className="sr-only" aria-labelledby={`${id}-l`}
          onChange={e => onChange([...(e.target.files ?? [])].map(f => ({ name: f.name, url: URL.createObjectURL(f) })))} />
      </label>
      {hint && <span className={s.hint}>{hint}</span>}
    </div>
  )
}

/* ---------- 안내 박스 ---------- */
export function Gate({ tone, icon, title, children, flush }: { tone?: 'warn' | 'danger' | 'plain'; icon?: IconName; title: ReactNode; children?: ReactNode; flush?: boolean }) {
  return (
    <div className={cx(s.gate, tone && s[`gate-${tone}`])} style={flush ? { margin: 0 } : undefined} role={tone === 'danger' || tone === 'warn' ? 'status' : undefined}>
      <div className={s.gateH}>{icon && <Icon name={icon} size={16} />}{title}</div>
      {children && <div className={s.gateBody}>{children}</div>}
    </div>
  )
}

export function CheckList({ items }: { items: { ok: boolean; label: string; value: ReactNode }[] }) {
  return (
    <ul className={s.checks}>
      {items.map(i => (
        <li key={i.label}>
          <span className={cx(s.ck, !i.ok && s.ckNo)} aria-hidden><Icon name="check" size={10} /></span>
          {i.label}<span className="sr-only">{i.ok ? '충족' : '미충족'}</span><b>{i.value}</b>
        </li>
      ))}
    </ul>
  )
}

/* ---------- 마일스톤 막대 ---------- */
export function MilestoneSteps({ milestones, lateId }: { milestones: { id: string; goal: string; status: string }[]; lateId?: string }) {
  const cur = (milestones.find(m => m.status === 'deciding') ?? milestones.find(m => m.status === 'upcoming'))?.id
  const done = milestones.filter(m => m.status === 'closed').length
  return (
    <div aria-label={`마일스톤 ${done} / ${milestones.length}`}>
      <div className={s.steps} aria-hidden>
        {milestones.map(m => <i key={m.id} className={m.status === 'closed' ? s.on : m.status === 'deciding' ? s.now : m.id === lateId ? s.late : undefined} />)}
      </div>
      <div className={s.stepsL} aria-hidden>
        {milestones.length > 6
          ? <><span>1</span><span className={s.cur}>{done} / {milestones.length}</span><span>{milestones.length}</span></>
          : milestones.map(m => <span key={m.id} className={m.id === cur ? s.cur : undefined}>{m.goal}</span>)}
      </div>
    </div>
  )
}

/* ---------- 요약 카드 ---------- */
export function Settle({ label, big, rows, patron }: { label: ReactNode; big: ReactNode; rows?: [string, ReactNode][]; patron?: boolean }) {
  return (
    <div className={cx(s.settle, patron && s.settlePatron)}>
      <small>{label}</small>
      <div className={cx(s.settleBig, 'won')}>{big}</div>
      {rows && <div className={s.settleRow}>{rows.map(([k, v]) => <div key={k}>{k}<b>{v}</b></div>)}</div>}
    </div>
  )
}

/* ---------- 거래 행 · 단계 ---------- */
export function TxRow({ art, title, sub, right, children, top }: { art: ReactNode; title: ReactNode; sub: ReactNode; right?: ReactNode; children?: ReactNode; top?: boolean }) {
  return (
    <div className={cx(s.tx, top && s.txTop)}>
      {art}
      <div className={s.txBody}><b>{title}</b><small>{sub}</small>{children}</div>
      {right && <div className={s.txRight}>{right}</div>}
    </div>
  )
}

export function Track({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div aria-label={`진행 단계: ${steps[current]}`}>
      <div className={s.track} aria-hidden>
        {steps.map((st, i) => <span key={st} style={{ display: 'contents' }}>{i > 0 && <s className={i <= current ? s.on : undefined} />}<i className={i <= current ? s.on : undefined} /></span>)}
      </div>
      <div className={s.trackL} aria-hidden>{steps.map((st, i) => <span key={st} className={i === current ? s.cur : undefined}>{st}</span>)}</div>
    </div>
  )
}

export function Toggle<T extends string>({ items, value, onChange }: { items: [T, ReactNode][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className={s.toggle} role="tablist">
      {items.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  )
}

export function ListLink({ to, onClick, icon, children, right }: { to?: string; onClick?: () => void; icon: IconName; children: ReactNode; right?: ReactNode }) {
  const inner = <><Icon name={icon} />{children}{right && <small>{right}</small>}<Icon name="chev" size={16} /></>
  return to ? <Link to={to} className={s.listLink} onClick={onClick}>{inner}</Link> : <button className={s.listLink} onClick={onClick}>{inner}</button>
}

export function Progress({ value, patron, label }: { value: number; patron?: boolean; label: string }) {
  return <div className={cx(s.progress, patron && s.progressPatron)} role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.min(100, value * 100)}%` }} /></div>
}

export function Stepper({ value, min, max, onChange, unit, label }: { value: number; min: number; max: number; onChange: (v: number) => void; unit: string; label: string }) {
  return (
    <div className={s.stepper} role="group" aria-label={label}>
      <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="줄이기">−</button>
      <span aria-live="polite">{value}{unit}</span>
      <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="늘리기">+</button>
    </div>
  )
}

export function Tiers({ items, value, onChange }: { items: { amount: number; text: string }[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className={s.tiers} role="radiogroup" aria-label="회당 후원 금액">
      {items.map(r => (
        <button key={r.amount} type="button" role="radio" aria-checked={r.amount === value} className={s.tier} onClick={() => onChange(r.amount)}>
          <b className="won">₩{r.amount.toLocaleString()}</b>{r.text}
        </button>
      ))}
    </div>
  )
}

export function Sum({ rows, total }: { rows: { label: string; value: ReactNode; free?: boolean }[]; total?: [string, ReactNode] }) {
  return (
    <div className={s.sum}>
      {rows.map(r => <div key={r.label} className={r.free ? s.free : undefined}><span>{r.label}</span><span className="won">{r.value}</span></div>)}
      {total && <div className={s.total}><span>{total[0]}</span><span className="won">{total[1]}</span></div>}
    </div>
  )
}

export function SecHead({ title, right }: { title: string; right?: ReactNode }) {
  return <div className={s.secHead}><h2 className="sec-t">{title}</h2>{right}</div>
}

export const SheetDesc = ({ children }: { children: ReactNode }) => <p className={s.sheetDesc}>{children}</p>
export const Pad = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div className={s.pad} style={style}>{children}</div>
