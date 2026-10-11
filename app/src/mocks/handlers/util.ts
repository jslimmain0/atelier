import { HttpResponse } from 'msw'
import type { Backing, SupportProject, User, Work } from '../../entities/types'
import { isVerifiedArtist, projectStatus, verifiedCount } from '../../domain/rules'
import type { ArtistSummary, ProjectView, UserView, WorkView } from '../../shared/api/types'
import { MOCK_USER_HEADER } from '../../shared/lib/session'
import * as db from '../data'

export const viewerOf = (req: Request) => db.users.find(u => u.id === req.headers.get(MOCK_USER_HEADER)) ?? null
export const stateOf = (userId: string) =>
  (db.viewerState[userId] ??= { liked: new Set(), saved: new Set(), following: new Set() })
export const userById = (id: string) => db.users.find(u => u.id === id)!
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export const summary = (u: User): ArtistSummary =>
  ({ id: u.id, handle: u.handle, name: u.name, avatarTone: u.avatarTone, place: u.place, isVerified: isVerifiedArtist(u, db.settings) })

export function workView(w: Work, viewer: User | null): WorkView {
  const artist = userById(w.artistId)
  const st = viewer ? stateOf(viewer.id) : null
  return {
    ...w,
    artist: summary(artist),
    viewer: { liked: !!st?.liked.has(w.id), saved: !!st?.saved.has(w.id), followingArtist: !!st?.following.has(artist.id), isMine: viewer?.id === artist.id },
  }
}

export function userView(u: User, viewer: User | null): UserView {
  const isSelf = viewer?.id === u.id
  return {
    ...u,
    // 타인에게는 공개 항목만, 심사 상태는 인증 여부만, 서류는 숨김
    career: isSelf ? u.career : u.career.filter(c => c.isPublic).map(c => ({
      ...c, verifyStatus: c.verifyStatus === 'verified' ? 'verified' : 'unverified', rejectReason: undefined, documents: undefined, requestNote: undefined,
    })),
    isVerified: isVerifiedArtist(u, db.settings),
    verifiedCount: verifiedCount(u.career),
    viewer: { isFollowing: !!viewer && stateOf(viewer.id).following.has(u.id), isSelf },
  }
}

export const backingOf = (projectId: string, userId?: string): Backing | null =>
  (userId && db.backings.find(b => b.projectId === projectId && b.backerId === userId)) || null

export const projectView = (p: SupportProject, viewer: User | null): ProjectView => ({
  ...p,
  artist: summary(userById(p.artistId)),
  displayStatus: projectStatus(p, db.TODAY),
  viewer: { backing: backingOf(p.id, viewer?.id), isMine: viewer?.id === p.artistId },
})

export const json = <T,>(body: T, status = 200) => HttpResponse.json(body as object, { status })
export const noContent = () => new HttpResponse(null, { status: 204 })
export const notFound = () => new HttpResponse('Not found', { status: 404 })
export const unauthorized = () => new HttpResponse('Login required', { status: 401 })
export const forbidden = (msg = 'Forbidden') => new HttpResponse(msg, { status: 403 })
export const badRequest = (msg: string) => new HttpResponse(msg, { status: 400 })
