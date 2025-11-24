"use client";
import RecommendedUserCard from "./RecommendedUserCard";
import { motion } from "framer-motion";

const RecommendedUserList = ({
  recommendedUsers = [],
  projectId,
  onInitiateRequest,
}) => {
  if (!recommendedUsers || recommendedUsers.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {recommendedUsers.map((rec, index) => (
        <RecommendedUserCard
          key={rec._id || index}
          userRecommendation={rec}
          projectId={projectId}
          onInitiateRequest={onInitiateRequest}
        />
      ))}
    </motion.div>
  );
};

export default RecommendedUserList;
