"use client";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";
import Button from "@/components/common/Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  initialFocus,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={initialFocus}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <h3
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                    id="modal-title"
                  >
                    {title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </Button>
                </div>
                <div className="mt-2" aria-describedby="modal-description">
                  {children}
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
