"use client";
import RecommendedUserCard from "./RecommendedUserCard";
import { motion } from "framer-motion";

const RecommendedUserList = ({ recommendedUsers = [], onInitiateRequest }) => {
  if (!recommendedUsers || recommendedUsers.length === 0) {
    // This case is now handled more explicitly in ProjectDetailPage
    // but good to have a fallback here too.
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
      }}
    >
      {recommendedUsers.map((rec, index) => (
        <RecommendedUserCard
          key={rec.userId || index}
          userRecommendation={rec}
          onInitiateRequest={onInitiateRequest}
        />
      ))}
    </motion.div>
  );
};

export default RecommendedUserList;
