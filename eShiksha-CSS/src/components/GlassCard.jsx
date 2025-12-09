import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = "", onClick, style = {}, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`glass-card ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
}