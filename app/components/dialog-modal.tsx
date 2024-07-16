// app/components/dialog-modal.tsx
'use client'

import React from 'react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children,  }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex ">
      <div className="relative p-8 bg-white  w-[80%] m-auto flex-col flex rounded-lg mt-8">
        <div className="flex justify-between items-center pb-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-black close-modal">
            ×
          </button>
        </div>
        <div className="flex justify-between flex-col">{children}</div>
      </div>
    </div>
  )
}

export default Dialog