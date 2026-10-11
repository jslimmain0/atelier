// 04 작품 올리기
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import type { WorkCategory } from '../entities/types'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { useMe } from '../shared/api/queries'
import { CATEGORY } from '../shared/lib/labels'
import { Field, ImagePicker, Pad } from '../shared/ui/blocks'
import { inputCls, twoCls } from '../shared/ui/classes'
import { AppBar, BackButton, BottomBar, Button, Empty, Opt } from '../shared/ui/primitives'

// 입력 규칙 (백엔드 검증에도 같은 규칙을 쓴다)
const schema = z.object({
  images: z.array(z.string()).min(1, '이미지를 한 장 이상 선택해 주세요').max(10),
  title: z.string().trim().min(1, '제목을 입력해 주세요').max(60),
  category: z.enum(Object.keys(CATEGORY) as [WorkCategory, ...WorkCategory[]]),
  year: z.string().regex(/^(\d{4})?$/, '연도는 숫자 4자리로 입력해 주세요'),
  material: z.string().max(60),
  width: z.string().regex(/^(\d+(\.\d+)?)?$/, '숫자로 입력해 주세요'),
  height: z.string().regex(/^(\d+(\.\d+)?)?$/, '숫자로 입력해 주세요'),
  description: z.string().max(2000),
  story: z.string().max(2000),
  sell: z.boolean(),
  price: z.string(),
}).refine(v => !v.sell || /^\d+$/.test(v.price.replaceAll(',', '')) && +v.price.replaceAll(',', '') >= 10000, {
  path: ['price'], message: '판매 가격을 10,000원 이상 숫자로 입력해 주세요',
})
type Form = z.infer<typeof schema>

export function UploadPage() {
  const navigate = useNavigate()
  const { data: me, isPending } = useMe()
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { images: [], title: '', category: 'painting', year: '2026', material: '', width: '', height: '', description: '', story: '', sell: true, price: '' },
  })
  const sell = useWatch({ control, name: 'sell' })
  const create = useApiMutation(endpoints.createWork, { success: '작품을 올렸어요', onSuccess: w => navigate(`/works/${w.id}`, { replace: true }) })

  if (!isPending && !me) return <><AppBar title="새 작품" left={<BackButton />} /><Empty title="작품을 올리려면 로그인해 주세요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty></>

  const onSubmit = handleSubmit(v => create.mutate({
    title: v.title, category: v.category, material: v.material || undefined, year: v.year ? +v.year : undefined,
    size: v.width && v.height ? `${v.width} × ${v.height} cm` : undefined,
    description: v.description || undefined, story: v.story || undefined,
    price: v.sell ? +v.price.replaceAll(',', '') : undefined, imageUrls: v.images,
  }))

  return (
    <>
      <AppBar title="새 작품" left={<BackButton />} />
      <form id="upload" onSubmit={onSubmit} noValidate>
        <Pad>
          <Controller control={control} name="images" render={({ field }) => (
            <ImagePicker label="작품 이미지" required value={field.value} onChange={field.onChange} error={errors.images?.message} hint="첫 장이 대표 이미지" />
          )} />
          <Field label="작품 제목" required error={errors.title?.message}>{id => <input id={id} className={inputCls} {...register('title')} />}</Field>
          <div className={twoCls}>
            <Field label="유형" required>{id => (
              <select id={id} className={inputCls} {...register('category')}>
                {Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}</Field>
            <Field label="제작연도" error={errors.year?.message}>{id => <input id={id} className={inputCls} inputMode="numeric" {...register('year')} />}</Field>
          </div>
          <Field label="재료">{id => <input id={id} className={inputCls} placeholder="예: Oil on canvas" {...register('material')} />}</Field>
          <div className={twoCls}>
            <Field label="가로 (cm)" error={errors.width?.message}>{id => <input id={id} className={inputCls} inputMode="decimal" {...register('width')} />}</Field>
            <Field label="세로 (cm)" error={errors.height?.message}>{id => <input id={id} className={inputCls} inputMode="decimal" {...register('height')} />}</Field>
          </div>
          <Field label="작품 이야기">{id => <textarea id={id} className={inputCls} placeholder="이 작품이 무엇을 담고 있는지 들려주세요." {...register('description')} />}</Field>
          <Field label="제작 스토리" hint="날짜별 과정 기록(사진 + 메모)은 등록 후 추가할 수 있어요">{(id, d) => (
            <textarea id={id} aria-describedby={d} className={inputCls} placeholder="어떻게 만들었는지, 과정에서 있었던 일을 적어 주세요." {...register('story')} />
          )}</Field>

          <h2 className="sec-t" style={{ marginTop: 8 }}>판매</h2>
          <Opt checked={sell} onClick={() => setValue('sell', true)} title="판매하기">가격을 정하고 소장자를 찾아요</Opt>
          <Opt checked={!sell} onClick={() => setValue('sell', false, { shouldValidate: true })} title="판매하지 않기">비매품, 프로필에 전시만 해요</Opt>
          {sell && <Field label="판매 가격 (원)" required error={errors.price?.message}>{id => <input id={id} className={inputCls} inputMode="numeric" placeholder="예: 1800000" {...register('price')} />}</Field>}
        </Pad>
      </form>
      <BottomBar>
        <Button type="submit" form="upload" block disabled={create.isPending}>{create.isPending ? '올리는 중…' : '작품 올리기'}</Button>
      </BottomBar>
    </>
  )
}
