"use client";

import { useState } from "react";

import Envelope from "./components/Envelope";

import { AnimatePresence, motion } from "framer-motion";

export default function Home() {

  const [open, setOpen] = useState(false);

  return (

    <main className="min-h-screen bg-[#F7F2EB] flex items-center justify-center overflow-hidden">

      <AnimatePresence mode="wait">

        {!open ? (

          <motion.div

            key="envelope"

            exit={{ opacity: 0, scale: .8 }}

            transition={{ duration: .6 }}

          >

            <Envelope onOpen={() => setOpen(true)} />

          </motion.div>

        ) : (

          <motion.div

            key="hero"

            initial={{ opacity: 0, y: 120 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: .8 }}

            className="text-center"

          >

            <h1 className="text-7xl font-serif text-[#8C6B4F]">

              Karim

            </h1>

            <div className="text-5xl my-4">&</div>

            <h1 className="text-7xl font-serif text-[#8C6B4F]">

              Rawan

            </h1>

            <p className="mt-8 text-xl text-gray-600">

              Welcome To Our Wedding

            </p>

          </motion.div>

        )}

      </AnimatePresence>

    </main>

  );

}