import { KioskPayment } from "@/components/kiosk/kiosk-payment"
import pool from "@/lib/db"
import { redirect } from "next/navigation"

export default async function KioskPaymentPage({
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
  if (!order) redirect('/kiosk')

  return <KioskPayment orderId={orderId} amount={order.total} orderType="kiosk" />
} 