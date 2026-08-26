'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface RazorpayCheckoutProps {
  amount: number // in INR rupees
  planName: string
  onSuccess?: (data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function RazorpayCheckout({ amount, planName, onSuccess, disabled, className, children }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)
      
      // 1. Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // convert to paise
          currency: 'INR',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Choutuppal App',
        description: `Subscription for ${planName}`,
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              if (onSuccess) {
                onSuccess({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                })
              } else {
                alert('Payment Successful!')
              }
            } else {
              alert('Payment Verification Failed!')
            }
          } catch (err) {
            console.error(err)
            alert('Error verifying payment')
          }
        },
        modal: {
          ondismiss: function () {
            alert('Payment cancelled')
            setLoading(false)
          },
        },
        theme: {
          color: '#1d4ed8',
        },
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (response: any) {
        console.error(response.error)
        alert('Payment failed: ' + response.error.description)
      })

      rzp.open()
    } catch (error: any) {
      console.error(error)
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={loading || disabled} className={className || "w-full"}>
      {loading ? 'Processing...' : children ? children : `Pay ₹${amount}`}
    </Button>
  )
}
