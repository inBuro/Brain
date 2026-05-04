export async function onRequestPost({request, env}) {
  const {license} = await request.json().catch(() => ({}));
  if (!license || typeof license !== 'string') {
    return Response.json({ok: false, error: 'Missing license key.'}, {status: 400});
  }

  // Gumroad license verification API
  // Docs: https://gumroad.com/help/article/76-license-keys
  const productId = env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    return Response.json({ok: false, error: 'Server misconfigured.'}, {status: 500});
  }

  const formData = new URLSearchParams();
  formData.append('product_id', productId);
  formData.append('license_key', license);
  formData.append('increment_uses_count', 'false');

  const gumroadRes = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: formData.toString()
  });
  const gumroadData = await gumroadRes.json();

  if (!gumroadData.success) {
    return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
  }

  // Optional: enforce refunded / disputed checks
  if (gumroadData.purchase?.refunded || gumroadData.purchase?.chargebacked) {
    return Response.json({ok: false, error: 'License invalidated.'}, {status: 403});
  }

  // Return signed URL to the latest bundle in R2 / external host
  return Response.json({
    ok: true,
    download_url: env.LATEST_BUNDLE_URL
  });
}
