import React, { useState, useEffect } from 'react';
import { getSquareTransactions } from '../../lib/supabase/square-integration';
import { DollarSign, Calendar, Tag, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SquareTransactionsProps {
  merchantId: string;
}

const SquareTransactions: React.FC<SquareTransactionsProps> = ({ merchantId }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (merchantId) {
      loadTransactions();
    }
  }, [merchantId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSquareTransactions(merchantId);
      
      if (result.success && result.data) {
        setTransactions(result.data.payments || []);
      } else {
        setError(result.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error loading Square transactions:', err);
      setError('Unexpected error loading transactions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-zinc-800 p-4 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-300">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4">
        <p className="text-sm font-medium text-red-300">Error loading transactions</p>
        <p className="text-xs text-gray-300 mt-1">{error}</p>
        <button 
          onClick={loadTransactions}
          className="mt-3 text-xs font-medium text-amber-500 hover:text-amber-400"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-800 p-4 text-center">
        <p className="text-sm text-gray-300">No transactions found in your Square account.</p>
        <p className="text-xs text-gray-400 mt-1">This could be because you're using the Sandbox environment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((transaction) => (
        <div key={transaction.id} className="rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-green-600/20 flex items-center justify-center mr-3 flex-shrink-0">
                <DollarSign size={14} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  {transaction.amount_money 
                    ? `$${(transaction.amount_money.amount / 100).toFixed(2)}` 
                    : 'Amount not available'}
                </p>
                <div className="flex items-center text-xs text-gray-400 mt-0.5">
                  <Calendar size={10} className="mr-1" />
                  <span>
                    {transaction.created_at 
                      ? new Date(transaction.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Date not available'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(transaction.id);
                  toast.success("Transaction ID copied");
                }}
                className="text-xs text-gray-400 hover:text-white p-1"
                title="Copy transaction ID"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <div className="flex mt-2">
            {transaction.status && (
              <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-gray-300 mr-2">
                <Tag size={8} className="mr-1 text-amber-500" />
                {transaction.status}
              </span>
            )}
            {transaction.source_type && (
              <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-gray-300">
                {transaction.source_type}
              </span>
            )}
          </div>
        </div>
      ))}
      
      {transactions.length > 5 && (
        <div className="text-center">
          <button className="text-xs font-medium text-amber-500 hover:text-amber-400">
            View all {transactions.length} transactions
          </button>
        </div>
      )}
      
      <div className="text-xs text-center text-gray-400 mt-2">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SquareTransactions;