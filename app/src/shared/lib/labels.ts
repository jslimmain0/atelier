import type { CareerCategory, CareerVerifyStatus, OrderStatus, ProjectStatus, SaleStatus, WorkCategory } from '../../entities/types'
import type { Tone } from '../ui/primitives'

export const CATEGORY: Record<WorkCategory, string> = {
  painting: '회화', drawing: '드로잉', print: '판화', photo: '사진',
  sculpture: '조각', ceramic: '도자', digital: '디지털', etc: '기타',
}

export const SALE: Record<SaleStatus, { label: string; tone: Tone }> = {
  available: { label: '판매중', tone: 'accent' },
  reserved: { label: '예약중', tone: 'warn' },
  sold: { label: 'SOLD', tone: 'line' },
  not_for_sale: { label: '비매품', tone: 'line' },
}

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  recruiting: { label: '모집 중', tone: 'accent' },
  in_progress: { label: '진행 중', tone: 'patron' },
  delayed: { label: '지연', tone: 'warn' },
  awaiting_close: { label: '종료 대기', tone: 'danger' },
  completed: { label: '완성', tone: 'ok' },
  ended: { label: '중도 종료', tone: 'line' },
}

export const CAREER_CATEGORY: Record<CareerCategory, string> = {
  education: '학력', exhibition: '전시', award: '수상', affiliation: '소속·활동', support_project: '후원 프로젝트', etc: '기타',
}

export const VERIFY_STATUS: Record<CareerVerifyStatus, { label: string; tone: Tone }> = {
  unverified: { label: '미인증', tone: 'line' },
  pending: { label: '심사 중', tone: 'warn' },
  verified: { label: '인증됨', tone: 'ok' },
  rejected: { label: '반려', tone: 'danger' },
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  paid: { label: '결제완료', tone: 'warn' },
  confirmed: { label: '작가확인', tone: 'warn' },
  shipping: { label: '운송중', tone: 'warn' },
  delivered: { label: '배송완료', tone: 'warn' },
  stored: { label: '수장고 보관', tone: 'patron' },
  completed: { label: '구매확정', tone: 'ok' },
  cancelled: { label: '취소', tone: 'line' },
  refunded: { label: '환불', tone: 'line' },
}
