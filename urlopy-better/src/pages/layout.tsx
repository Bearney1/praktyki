import React from 'react'

export default function layout({
    children,
  }: {
    children: React.ReactNode
  }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white text-9xl">
        {children}
    </div>
  )
}
