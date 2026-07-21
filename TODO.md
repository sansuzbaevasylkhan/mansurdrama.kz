# TODO — Kaspi қолмен төлеу paywall (MansurDrama.kz)

## 1. Prisma schema
- [ ] Қосу: PaymentType / PaymentStatus
- [ ] Қосу: Payment модель
- [ ] Қосу: UnlockedContent модель
- [ ] Relation/unique constraint: userId+dramaId+(episodeNumber|null)

## 2. Access logic
- [ ] Қосу: lib/access.ts (hasEpisodeAccess)
- [ ] Қосу: app/api/access/route.ts (email+dramaId+episodeNumber → allowed)

## 3. Receipt storage (Firebase)
- [ ] Firebase storage-та receipt үшін subdir қолдау (payment-receipts)
- [ ] Қосу: lib/receipt-storage.ts (receipt upload → receiptUrl)

## 4. Payment endpoints
- [ ] Қосу: app/api/payments/route.ts (POST FormData → Payment PENDING)
- [ ] Қосу: app/api/admin/payments/route.ts (GET pending, admin)
- [ ] Қосу: app/api/admin/payments/[id]/route.ts (PATCH approve/reject, admin)

## 5. UI
- [ ] Қосу: components/EpisodePaywall.tsx
- [ ] Қосу: components/AdminPaymentsPanel.tsx
- [ ] Қосу: app/admin/payments/page.tsx

## 6. Drama page integration
- [ ] Edit: app/drama/[slug]/page.tsx — episodeNumber>=11 locked болса paywall көрсету

## 7. Migration / tests
- [ ] npx prisma migrate dev
- [ ] npm run build && npm run lint (болса)
- [ ] Manual QA: 1-10 free, 11+ locked, admin approve → unlock

