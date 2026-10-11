import { lazy, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { FeedPage } from '../pages/FeedPage'
import { LoginPage, NotFoundPage, RouteError } from '../pages/NotFoundPage'
import { AppShell } from './AppShell'
import { SCREENS, type ScreenMeta } from './screens'

// 피드는 첫 화면이라 바로 싣고, 나머지는 화면별로 나눠 필요할 때 불러온다
const page = <M, K extends keyof M>(load: () => Promise<M>, name: K) =>
  lazy(() => load().then(m => ({ default: m[name] as ComponentType })))
const AdminReviewPage = page(() => import('../pages/AdminReviewPage'), 'AdminReviewPage')
const AdminReviewsPage = page(() => import('../pages/AdminReviewsPage'), 'AdminReviewsPage')
const AdminSettingsPage = page(() => import('../pages/AdminSettingsPage'), 'AdminSettingsPage')
const ArtistPage = page(() => import('../pages/ArtistPage'), 'ArtistPage')
const CareerPage = page(() => import('../pages/CareerPage'), 'CareerPage')
const CheckoutPage = page(() => import('../pages/CheckoutPage'), 'CheckoutPage')
const DecidePage = page(() => import('../pages/DecidePage'), 'DecidePage')
const ExplorePage = page(() => import('../pages/ExplorePage'), 'ExplorePage')
const HistoryPage = page(() => import('../pages/HistoryPage'), 'HistoryPage')
const ProjectPage = page(() => import('../pages/ProjectPage'), 'ProjectPage')
const SavedPage = page(() => import('../pages/SavedPage'), 'SavedPage')
const StudioSupportPage = page(() => import('../pages/StudioSupportPage'), 'StudioSupportPage')
const SupportListPage = page(() => import('../pages/SupportListPage'), 'SupportListPage')
const SupportNewPage = page(() => import('../pages/SupportNewPage'), 'SupportNewPage')
const UploadPage = page(() => import('../pages/UploadPage'), 'UploadPage')
const WorkPage = page(() => import('../pages/WorkPage'), 'WorkPage')

// 화면 번호 → 컴포넌트 (prototype.html 화면 번호와 1:1)
const PAGES: Record<string, ComponentType> = {
  '01': FeedPage, '01-2': ExplorePage, '02': WorkPage, '03': ArtistPage, '04': UploadPage,
  '05': CheckoutPage, '06': HistoryPage, '07': SupportListPage, '08': ProjectPage, '09': DecidePage,
  '10': SupportNewPage, '11': StudioSupportPage, '12': SavedPage, '13': CareerPage,
  '14': AdminReviewsPage, '14-2': AdminReviewPage, '15': AdminSettingsPage,
}

const extra = (code: string, title: string, path: string): ScreenMeta => ({ code, title, path, tab: null })

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      ...SCREENS.map(meta => {
        const Page = PAGES[meta.code]
        return { path: meta.path, element: <Page />, handle: meta, errorElement: <RouteError /> }
      }),
      { path: '/login', element: <LoginPage />, handle: extra('login', '로그인', '/login') },
      { path: '*', element: <NotFoundPage />, handle: extra('404', '페이지 없음', '*') },
    ],
  },
])
