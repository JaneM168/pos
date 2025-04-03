import { OnlinePayment } from "@/components/order/online-payment"
import pool from "@/lib/db"
import { redirect } from "next/navigation"

export default async function OnlinePaymentPage({
  params: { orderId }
}: {
  params: { orderId: string }
}) {
  const client = await pool.connect()
  const result = await client.query(
    'SELECT * FROM orders WHERE id = $1',
    [orderId]
  )
  client.release()

  const order = result.rows[0]
  if (!order) redirect('/order')

  return <OnlinePayment orderId={orderId} amount={order.total} orderType="online" />
} 