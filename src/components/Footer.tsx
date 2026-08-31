'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-neutral-950 border-t border-white/10 mt-auto py-6 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">its<span className="text-emerald-400">my</span>booking</span>
            <span>•</span>
            <span>itsmyapp.co.uk</span>
          </div>
          <p>© {new Date().getFullYear()} itsmyapp.co.uk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
