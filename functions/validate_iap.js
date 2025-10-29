// functions/validate_iap.js
import fetch from 'node-fetch'
import { createClient } from '@nhost/nhost-js'

const nhost = createClient({
  subdomain: process.env.NHOST_SUBDOMAIN,
  region: process.env.NHOST_REGION,
  adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET || process.env.NHOST_ADMIN_SECRET,
})

export default async (req, res) => {
  try {
    const { user_id, receipt, product_id } = req.body

    if (!user_id || !receipt || !product_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' })
    }

    console.log('[validate_iap] → Xác thực receipt của Apple...')

    const PROD_URL = 'https://buy.itunes.apple.com/verifyReceipt'
    const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'

    const payload = {
      'receipt-data': receipt,
      'password': process.env.APPLE_SHARED_SECRET,
      'exclude-old-transactions': true,
    }

    let response = await fetch(PROD_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
    let data = await response.json()

    // Nếu là receipt sandbox, gọi lại endpoint sandbox
    if (data.status === 21007) {
      console.log('[validate_iap] → Receipt sandbox, thử lại...')
      response = await fetch(SANDBOX_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
      data = await response.json()
    }

    if (data.status !== 0) {
      console.error('[validate_iap] ❌ Receipt không hợp lệ:', data)
      return res.status(400).json({ success: false, message: `Receipt không hợp lệ (status=${data.status})` })
    }

    // Lấy thông tin giao dịch
    const latest = data.latest_receipt_info?.[0] || data.receipt?.in_app?.[0]
    if (!latest) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy giao dịch nào trong receipt.' })
    }

    const transactionId = latest.transaction_id
    const purchasedProductId = latest.product_id

    if (purchasedProductId !== product_id) {
      return res.status(400).json({ success: false, message: 'Product ID không khớp.' })
    }

    console.log(`[validate_iap] ✅ Receipt hợp lệ: ${transactionId}`)

    // Cộng credit cho user
    const mutation = `
      mutation AddCredit($user_id: uuid!, $amount: Int!, $reference_id: String!) {
        insert_credit_transactions_one(object: {
          user_id: $user_id,
          amount: $amount,
          type: "iap_purchase",
          reference_id: $reference_id
        }) {
          id
        }
        update_quiz_credits(
          where: { user_id: { _eq: $user_id } },
          _inc: { credit_remaining: $amount }
        ) {
          affected_rows
        }
      }
    `

    const variables = {
      user_id,
      amount: 50, // số credit tặng
      reference_id: transactionId,
    }

    const gqlRes = await nhost.graphql.request(mutation, variables)
    if (gqlRes.error) throw new Error(gqlRes.error.message)

    console.log(`[validate_iap] ✅ Đã cộng 50 credit cho user ${user_id}`)
    return res.json({ success: true })
  } catch (err) {
    console.error('[validate_iap] ❌', err)
    return res.status(500).json({ success: false, message: 'Lỗi server khi validate IAP' })
  }
}
