"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function CheckDB() {
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDatabase() {
      try {
        const supabase = createSupabaseBrowserClient();
        console.log('Checking Supabase connection...');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        // Check expenses table
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('id')
          .limit(1);

        if (expensesError) {
          console.error('Error checking expenses table:', expensesError);
          setError(`Expenses table error: ${expensesError.message}`);
          return;
        }

        // Check budgets table
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('id')
          .limit(1);

        if (budgetsError) {
          console.error('Error checking budgets table:', budgetsError);
          setError(`Budgets table error: ${budgetsError.message}`);
          return;
        }

        console.log('Database connection successful');
        console.log('Expenses table accessible, found:', expensesData?.length || 0, 'entries');
        console.log('Budgets table accessible, found:', budgetsData?.length || 0, 'entries');
        setTables(['expenses', 'budgets']);
        setError(null);
      } catch (err) {
        console.error('Database check failed:', err);
        setError(`Database check failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    checkDatabase();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Check</h1>
      
      {loading ? (
        <p>Checking database connection...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Success!</p>
          <p>Connection to database established successfully.</p>
          <p>Available tables: {tables.join(', ')}</p>
          <p>Check the browser console for detailed information.</p>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Environment Variables:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
          {`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'}`}
        </pre>
      </div>
    </div>
  );
} 