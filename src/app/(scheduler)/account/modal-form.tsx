"use client";

import { panda } from "styled-system/jsx";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <panda.div
      position="fixed"
      inset="0"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="50"
      onClick={onClose}
    >
      <panda.div
        backgroundColor="white"
        padding="6"
        borderRadius="lg"
        maxWidth="md"
        width="full"
        margin="4"
        boxShadow="lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </panda.div>
    </panda.div>
  );
}