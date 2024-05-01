import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

const commonTransition = {
  type: 'spring',
  bounce: 0.3,
  duration: 0.5,
  delayChildren: 0.2,
  staggerChildren: 0.05
}

export const AnimatedOutlet: React.FC = () => {
  const o = useOutlet()
  const [outlet] = useState(o)

  return <>{outlet}</>
}

export function PageTransition() {
  const location = useLocation()
  return (
    <motion.div
      key={location.pathname}
      initial={{
        opacity: 0,
        filter: 'blur(10px)'
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        transition: commonTransition
      }}
      exit={{
        opacity: 0,
        filter: 'blur(10px)',
        transition: commonTransition
      }}
    >
      <AnimatedOutlet />
    </motion.div>
  )
}
