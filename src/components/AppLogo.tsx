import { Wallet } from 'lucide-react';
import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="MoneyWise App Logo">
      <Wallet className="h-7 w-7 text-primary" {...props} />
      <span className="text-xl font-semibold text-primary">MoneyWise</span>
    </div>
  );
}
