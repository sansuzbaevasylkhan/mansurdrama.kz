# Tariff Upgrade System Implementation Plan

## 1. Overview
Implement a robust tariff upgrade system that allows users to upgrade their current payment (e.g., single episode) to a higher tariff (e.g., full package) by deducting the amount already paid from the new tariff price.

## 2. Analysis of Current State
- **Database**: `Payment` model in `prisma/schema.prisma` has `upgradeFromPaymentId` and `isUpgraded`.
- **API (Upgrade Price)**: `app/api/tariffs/upgrade-price/route.ts` implements basic logic but uses `dramaId` as a required param.
- **API (Payments)**: `app/api/payments/route.ts` handles upgrade verification and marking old payments as upgraded in a transaction.
- **Mobile**: `EpisodePaywall.tsx` calls the upgrade API and displays the deducted price.

## 3. Implementation Details

### 3.1. Refine `GET /api/tariffs/upgrade-price`
- **Goal**: Ensure it correctly finds APPROVED payments and calculates the deduction.
- **Current logic**: `Math.max(0, targetTariff.price - deductedAmount)`.
- **Improvement**: Verify if `dramaId` is strictly necessary or if we should support global upgrades (though currently tariffs are drama-specific via `TariffDrama`).
- **Requirement Check**: Ensure it only considers `APPROVED` and `isUpgraded: false` payments.

### 3.2. Refine `POST /api/payments`
- **Goal**: Bulletproof server-side verification.
- **Current logic**: `upgradeAmount = Math.max(0, Math.floor(tariff.price - prevPayment.amount))`.
- **Improvement**: 
    - Ensure `upgradeFromPaymentId` is validated against the current user.
    - Ensure the payment is `APPROVED` and not already `isUpgraded`.
    - Verify the deduction logic matches the `upgrade-price` endpoint.

### 3.3. Verify Mobile UI (`EpisodePaywall.tsx`)
- **Goal**: Ensure the text "Толық пакетке өту: X₸ орнына Y₸ (Z₸ шегерілді)" is displayed and the correct `amount` and `upgradeFromPaymentId` are sent.
- **Current state**: The text is present. The `submit` function handles `upgradeInfo`.

## 4. Test Plan
1. **Baseline**: User pays for a single episode (Amount A). Verify payment status is `APPROVED`.
2. **Upgrade Path**:
    - User selects "Full Package" (Price B).
    - API `/api/tariffs/upgrade-price` returns `remainingPrice = B - A`.
    - Mobile displays the deduction message.
    - User submits upgrade payment (Amount B - A).
3. **Verification**:
    - New payment is created with `upgradeFromPaymentId` = Original Payment ID.
    - Original payment is marked as `isUpgraded = true`.
    - Verify `isUpgraded` prevents the same payment from being used for another upgrade.
4. **Edge Cases**:
    - Attempt to upgrade from a `PENDING` or `REJECTED` payment (should fail).
    - Attempt to upgrade from an already upgraded payment (should fail).
    - Attempt to upgrade to a tariff cheaper than the original payment (result should be 0).

## 5. Critical Files
- `app/api/tariffs/upgrade-price/route.ts`
- `app/api/payments/route.ts`
- `mobile/components/EpisodePaywall.tsx`
- `prisma/schema.prisma`
