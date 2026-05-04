/**
 * verify-license.js — Paddle-based license verification for Fadercraft.
 *
 * REPLACES the previous Gumroad implementation. The project pivoted to Paddle
 * (as Merchant of Record) after Stripe rejected the seller's KYC; Gumroad is
 * no longer in the loop.
 *
 * --- Endpoint choice ---------------------------------------------------------
 *
 * Paddle Billing (the current Paddle platform — distinct from legacy "Paddle
 * Classic") does not expose a public, generally-available "validate license
 * key" endpoint of the kind Gumroad offered. Paddle's separate Licensing
 * product surfaces `POST /licensing/v1/license-keys/validate`, but it is in
 * limited release and not enabled on every Paddle Billing account by default.
 *
 * For a one-time digital purchase like Fadercraft XL Performance, the simplest
 * supported approach on stock Paddle Billing is to treat the buyer's
 * **transaction id** (returned by Paddle Checkout, included in the receipt
 * email and the success-page query string) as the "license key" and validate
 * it against the Transactions API:
 *
 *     GET https://api.paddle.com/transactions/{id}
 *
 * A valid, paid, non-refunded purchase has:
 *   - `data.status === "completed"`           (not "billed", "past_due", etc.)
 *   - no entry in `data.payments[]` with `status === "refunded"`
 *   - optionally: `data.items[].price.product_id === PADDLE_PRODUCT_ID`
 *     (filters out unrelated transactions on multi-product accounts)
 *
 * If/when Paddle Licensing is enabled for this account, this function should
 * be migrated to the dedicated `POST /licensing/v1/license-keys/validate`
 * endpoint — see TODO(paddle-api-verification) below.
 *
 * --- Required environment variables -----------------------------------------
 *
 *   PADDLE_API_KEY        Bearer token. Paddle dashboard → Developer tools →
 *                         Authentication → "Generate API key". Use a LIVE key
 *                         in production, SANDBOX key in preview deployments.
 *   LATEST_BUNDLE_URL     Public (or signed) URL of the current bundle zip.
 *   PADDLE_PRODUCT_ID     (optional) `pro_...` id; if set, transactions for
 *                         other products are rejected. Strongly recommended
 *                         once a second SKU is added to the account.
 *
 * --- Docs --------------------------------------------------------------------
 *
 *   Transactions API:  https://developer.paddle.com/api-reference/transactions/get-transaction
 *   Authentication:    https://developer.paddle.com/api-reference/about/authentication
 *   Licensing (beta):  https://developer.paddle.com/api-reference/licensing-keys/validate-license-key
 */

const PADDLE_API_BASE = 'https://api.paddle.com';

export async function onRequestPost({request, env}) {
  const {license} = await request.json().catch(() => ({}));
  if (!license || typeof license !== 'string') {
    return Response.json({ok: false, error: 'Missing license key.'}, {status: 400});
  }

  if (!env.PADDLE_API_KEY || !env.LATEST_BUNDLE_URL) {
    return Response.json({ok: false, error: 'Server misconfigured.'}, {status: 500});
  }

  // The "license key" the buyer pastes is a Paddle transaction id (txn_...).
  // Reject obvious garbage early so we don't burn an API call.
  const txnId = license.trim();
  if (!/^txn_[a-z0-9]+$/i.test(txnId)) {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }

  // TODO(paddle-api-verification): once the Licensing product is enabled on
  // this Paddle account, switch to:
  //   POST https://api.paddle.com/licensing/v1/license-keys/validate
  //   body: { license_key: license }
  // and drop the txn_-prefix shape check above.
  let paddleRes;
  try {
    paddleRes = await fetch(`${PADDLE_API_BASE}/transactions/${encodeURIComponent(txnId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.PADDLE_API_KEY}`,
        'Accept': 'application/json'
      }
    });
  } catch (_err) {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }

  if (paddleRes.status === 404) {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }
  if (!paddleRes.ok) {
    // Auth failure, rate limit, Paddle outage — surface as misconfig so the
    // operator notices instead of letting buyers see a generic 401.
    return Response.json({ok: false, error: 'Server misconfigured.'}, {status: 500});
  }

  const paddleData = await paddleRes.json().catch(() => ({}));
  const txn = paddleData?.data;
  if (!txn) {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }

  // Only completed (paid) transactions grant a download.
  if (txn.status !== 'completed') {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }

  // Refund / chargeback check — Paddle records these as payment entries with
  // a non-`captured` status, and/or sets the transaction's overall status
  // back to a non-completed value. Cover both shapes defensively.
  const payments = Array.isArray(txn.payments) ? txn.payments : [];
  const refunded = payments.some(p => p?.status === 'refunded' || p?.status === 'chargeback');
  if (refunded) {
    return Response.json({ok: false, error: 'License invalidated.'}, {status: 403});
  }

  // Optional product-id filter — only honour transactions for the configured
  // product. Skipped if PADDLE_PRODUCT_ID is unset (single-product account).
  if (env.PADDLE_PRODUCT_ID) {
    const items = Array.isArray(txn.items) ? txn.items : [];
    const matches = items.some(it => it?.price?.product_id === env.PADDLE_PRODUCT_ID);
    if (!matches) {
      return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
    }
  }

  return Response.json({
    ok: true,
    download_url: env.LATEST_BUNDLE_URL
  });
}
