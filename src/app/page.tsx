'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import ControlPanel from '../components/editor/ControlPanel';
import TopBar from '../components/editor/TopBar'; // TopBar ইমপোর্ট করা হলো

// SSR অফ করে ক্যানভাস লোড করা
const CanvasArea = dynamic(() => import('../components/editor/CanvasArea'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-white w-8 h-8" />
    </div>
  ),
});

export default function EditorPage() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/30">
      
      {/* --- Left Workspace (Canvas) --- */}
      <div className="flex-1 relative bg-[#09090b]">
        {/* আলাদা করা TopBar কম্পোনেন্টটি এখানে বসিয়ে দেওয়া হলো */}
        <TopBar />

        {/* The Actual Canvas */}
        <CanvasArea />
      </div>

      {/* --- Right Control Panel --- */}
      <div className="w-full md:w-[380px] h-[40vh] md:h-screen bg-[#0c0c0e] border-t md:border-l border-white/10 p-6 shadow-2xl flex flex-col">
        <ControlPanel />
      </div>

    </main>
  );
}