"use client"
import { ReactNode, useEffect } from 'react'

export function Modal({ open, onClose, title, children }: { open: boolean, onClose: ()=>void, title: string, children: ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded shadow max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="font-medium">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="px-2">×</button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
      </div>
    </div>
  )
}

