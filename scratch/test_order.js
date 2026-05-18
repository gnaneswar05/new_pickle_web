const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        pincode: '123456',
        products: [{ productId: 'test_id', name: 'Test Pickle', quantity: 1, price: 100 }],
        totalAmount: 100,
        paidAmount: 50,
        walletAmount: 50,
        taxAmount: 0,
        platformFee: 0,
        deliveryCharge: 0,
        paymentMethod: 'Wallet + COD',
        userId: 'test_user_id'
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch(e) {
    console.error(e);
  }
}

test();
