"use client";
import RecommendedUserCard from "./RecommendedUserCard";
import { motion } from "framer-motion";

const RecommendedUserList = ({
  recommendedUsers = [],
  projectId,
  onInitiateRequest,
}) => {
  // --- THE FIX: Flatten the array ---
  // Your console log showed `user: Array(2)`, meaning the data is nested inside an array.
  // .flat() pulls the users out so we can map over them individually.
  const flatUsers = Array.isArray(recommendedUsers)
    ? recommendedUsers.flat()
    : [];

  if (flatUsers.length === 0) {
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
      {flatUsers.map((rec, index) => (
        <RecommendedUserCard
          key={rec._id || index}
          // Note: The Card component I gave you earlier handles
          // both 'user' and 'userRecommendation' props safely.
          userRecommendation={rec}
          projectId={projectId}
          onInitiateRequest={onInitiateRequest}
        />
      ))}
    </motion.div>
  );
};

export default RecommendedUserList;
