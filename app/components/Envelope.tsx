"use client";

import { motion } from "framer-motion";

interface Props {
  onOpen: () => void;
}

export default function Envelope({ onOpen }: Props) {
  return (
    <div className="flex flex-col items-center justify-center">

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: .95 }}
        onClick={onOpen}
        className="relative cursor-pointer"
      >

        {/* Body */}

        <div className="w-80 h-52 rounded-xl bg-[#C69C6D] shadow-2xl"></div>

        {/* Flap */}

        <motion.div
          className="absolute top-0 left-0 w-0 h-0
          border-l-[160px]
          border-r-[160px]
          border-b-[110px]
          border-l-transparent
          border-r-transparent
          border-b-[#B5885B]"
        />

        {/* Heart */}

        <div className="absolute inset-0 flex items-center justify-center">

          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl">

            ❤️

          </div>

        </div>

      </motion.div>

      <p className="mt-10 text-gray-600">
        Tap to open
      </p>

    </div>
  );
}