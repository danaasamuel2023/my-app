// pages/wallet/verify.js
'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function VerifyPaymentPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [reference, setReference] = useState(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('igettoken');
    if (!storedToken) {
      router.push('/login?redirect=/wallet');
      return;
    }
    
    setToken(storedToken);
    
    // Get reference from URL parameters
    const ref = searchParams.get('reference');
    const trxStatus = searchParams.get('status');
    
    if (ref) {
      setReference(ref);
      
      if (trxStatus) {
        // If status is already provided in the URL
        handleStatusResponse(trxStatus, ref);
      } else {
        // Otherwise verify the payment with the backend
        verifyPayment(ref, storedToken);
      }
    } else {
      setLoading(false);
      setError('No payment reference found. Please try again or contact support.');
    }
  }, [router, searchParams]);

  const verifyPayment = async (ref, authToken) => {
    try {
        const response = await fetch(`http://localhost:5000/api/verify?reference=${ref}`, {
            method: 'GET', // You have this commented out, but it's good to be explicit
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

      const data = await response.json();
      
      if (data.success) {
        handleStatusResponse('success', ref);
      } else {
        handleStatusResponse('failed', ref);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setLoading(false);
      setStatus('error');
      setError('Failed to verify payment. Please contact support with your reference number.');
    }
  };

  const handleStatusResponse = (trxStatus, ref) => {
    setStatus(trxStatus);
    setLoading(false);
    
   
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Head>
        <title>Verifying Payment | My Wallet</title>
        <meta name="description" content="Verifying your payment" />
      </Head>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-800">Verifying Your Payment</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your transaction...</p>
            {reference && (
              <p className="mt-4 text-sm text-gray-500">Reference: {reference}</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">Payment Successful!</h2>
                <p className="mt-2 text-gray-600">Your wallet has been credited successfully.</p>
                <p className="mt-4 text-sm text-gray-500">Reference: {reference}</p>
                <div className="mt-6">
                  <p className="text-sm text-gray-600">Redirecting to your wallet...</p>
                  <div className="mt-4">
                    <Link href="/wallet" className="text-blue-600 hover:text-blue-800 font-medium">
                      Go to Wallet Now
                    </Link>
                  </div>
                </div>
              </>
            )}

            {status === 'failed' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">Payment Failed</h2>
                <p className="mt-2 text-gray-600">We couldn't complete your transaction.</p>
                <p className="mt-4 text-sm text-gray-500">Reference: {reference}</p>
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-600">Redirecting to your wallet...</p>
                  <div className="flex flex-col space-y-2">
                    <Link href="/wallet/deposit" className="text-blue-600 hover:text-blue-800 font-medium">
                      Try Again
                    </Link>
                    <Link href="/wallet" className="text-blue-600 hover:text-blue-800 font-medium">
                      Go to Wallet
                    </Link>
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                  <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">Verification Error</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                {reference && (
                  <p className="mt-4 text-sm text-gray-500">Reference: {reference}</p>
                )}
                <div className="mt-6 space-y-3">
                  <div className="flex flex-col space-y-2">
                    <Link href="/wallet" className="text-blue-600 hover:text-blue-800 font-medium">
                      Return to Wallet
                    </Link>
                    <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                      Contact Support
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}