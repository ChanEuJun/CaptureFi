import React from 'react';
import SaltStatus from '@/components/integration/SaltStatus';
import FundingDemo from '@/components/dashboard/FundingDemo';
import PearExecution from '@/components/integration/PearExecution';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-black">
      <div className="z-10 w-full max-w-5xl flex flex-col gap-8 font-mono text-sm">
        <h1 className="text-4xl font-bold text-white tracking-tighter">CaptureFi <span className="text-zinc-600">Dev</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="text-xl text-zinc-400 mb-4">1. Smart Account</h2>
            <SaltStatus />
          </div>

          <div className="col-span-1 border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
            <h2 className="text-xl text-zinc-400 mb-4">2. Funding</h2>
            <FundingDemo />
          </div>

          <div className="col-span-1 border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
            <h2 className="text-xl text-zinc-400 mb-4">3. Execution</h2>
            <PearExecution />
          </div>
        </div>
      </div>
    </main>
  );
}
