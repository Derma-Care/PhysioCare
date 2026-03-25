import React from 'react'

const RazorpayButton = ({ amount = 500, onPaymentSuccess, selectedSlots, clinicName,mobileNumber }) => {
  const openRazorpay = () => {
    const options = {
      key: 'rzp_test_sor33NEn9vHr3Q', // ⚠️ Replace with your Live Key when going live
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: clinicName,
      description: 'Booking Payment',
      handler: function (response) {
        // ✅ Payment successful → call parent callback (e.g., bookSlot)
        if (onPaymentSuccess) {
          onPaymentSuccess('online', response)
        }
      },
      prefill: {
        name: 'Prashanth',
        email: 'prashanth@example.com',
        contact: mobileNumber,
      },
      notes: {
        address: 'My Clinic, India',
      },
      theme: {
        color: 'var(--color-black)',
      },
    }

    const rzp = new window.Razorpay(options)

    // ❌ Handle payment failure silently (you can show your own toast if needed)
    rzp.on('payment.failed', function () {
      // Optionally handle in parent instead of showing alerts
    })

    rzp.open()
  }
  const roundedAmount = Math.round(amount)

  return (
    <button
      onClick={openRazorpay}
      disabled={selectedSlots.length === 0}
      style={{
        backgroundColor: selectedSlots.length !== 0 ? 'var(--color-black)' : 'gray',

        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      Pay ₹ {roundedAmount}
    </button>
  )
}

export default RazorpayButton
