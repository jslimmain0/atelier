import { NavLink } from 'react-router'
import { useMe } from '../shared/api/queries'
import { Icon, type IconName } from '../shared/ui/Icon'
import type { Tab } from './screens'
import s from './shell.module.css'

export function TabBar({ active }: { active: Tab }) {
  const { data: me } = useMe()
  const profileTo = !me ? '/login' : me.role === 'admin' ? '/admin/career-reviews' : `/artists/${me.handle}`
  const item = (tab: Tab, to: string, icon: IconName, label: string) => (
    <NavLink to={to} className={s.tab} aria-current={active === tab ? 'page' : undefined}>
      <Icon name={icon} />{label}
    </NavLink>
  )
  return (
    <nav className={s.tabbar} aria-label="주요 메뉴">
      {item('feed', '/', 'home', '피드')}
      {item('explore', '/explore', 'search', '탐색')}
      <NavLink to="/upload" className={s.tab} aria-label="작품 올리기">
        <span className={s.plus}><Icon name="plus" /></span>
      </NavLink>
      {item('support', '/support', 'sprout', '후원')}
      {item('profile', profileTo, 'user', !me ? '로그인' : me.role === 'admin' ? '관리' : '프로필')}
    </nav>
  )
}
