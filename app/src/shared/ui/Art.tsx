import type { CSSProperties, ReactNode } from 'react'

/** 작품 이미지. 'art:aN'이면 mock 작품(CSS), 아니면 실제 이미지 */
export function Art({ url, alt, stage, className = '', style, children, onClick }: {
  url: string
  alt?: string
  stage?: 'wip' | 'wip-half' | 'final'
  className?: string
  style?: CSSProperties
  children?: ReactNode
  onClick?: () => void
}) {
  const stageCls = stage === 'wip' ? 'wip' : stage === 'wip-half' ? 'wip-half' : ''
  const a11y = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true }
  if (url.startsWith('art:')) {
    return (
      <div className={`art ${url.slice(4)} ${stageCls} ${className}`} style={style} onClick={onClick} {...a11y}>
        {stage === 'wip' && <div className="wip-grid" />}
        {children}
      </div>
    )
  }
  return (
    <div className={`art ${stageCls} ${className}`} style={style} onClick={onClick}>
      <img src={url} alt={alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {children}
    </div>
  )
}
