// pages/wallet/deposit.js
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('igettoken');
    if (!storedToken) {
      router.push('/login?redirect=/wallet/deposit');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Handle deposit form submission
  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/deposit/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: depositAmount })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Redirecting to payment gateway...');
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        setError(data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error initializing payment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Deposit Funds | My Wallet</title>
        <meta name="description" content="Deposit funds to your wallet" />
      </Head>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Deposit Funds</h1>
          <Link href="/wallet" className="text-blue-600 hover:text-blue-800">
            Back to Wallet
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleDeposit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                Amount to Deposit ($)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                step="0.01"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Deposit Now'}
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Payment Information</h2>
            <p className="text-gray-600 text-sm">
              • Your payment will be processed securely via Paystack
            </p>
            <p className="text-gray-600 text-sm">
              • After successful payment, your wallet will be credited instantly
            </p>
            <p className="text-gray-600 text-sm">
              • You will be redirected back to the wallet page after completion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}