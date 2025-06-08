import CheckDB from '../check-db';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
      <CheckDB />
    </div>
  );
} 