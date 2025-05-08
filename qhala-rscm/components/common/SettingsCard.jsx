// components/common/SettingsCard.jsx
import { motion } from "framer-motion"; // Import motion

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const SettingsCard = ({ icon, title, description, children }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
    >
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
            {icon}
          </div>
          <h3 className="font-semibold text-slate-800 ">{title}</h3>
        </div>

        {description && (
          <p className="text-sm text-slate-600  mb-4">{description}</p>
        )}

        <div className="mt-2">{children}</div>
      </div>
    </motion.div>
  );
};

export default SettingsCard;
