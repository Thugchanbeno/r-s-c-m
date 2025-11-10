// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { UserPlus, ArrowLeft } from "lucide-react";
// import { ProfileHeader } from "@/components/user/ProfileComponents";
// import { CVUploader } from "@/components/admin/CVUploader";
// import { UserCreationForm } from "@/components/admin/UserCreationForm";
// import { CachedCVs } from "@/components/admin/CachedCVs";
// import { Button } from "@/components/ui/button";
// import { fadeIn } from "@/lib/animations";

// export default function CreateUserPage() {
//   const [view, setView] = useState("selection");
//   const [prefilledData, setPrefilledData] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const handleUploadSuccess = (data) => {
//     console.log("New CV parsed, switching to form view.", data);
//     setPrefilledData(data.prepopulatedData);
//     setView("form");
//     setRefreshKey((prev) => prev + 1);
//   };

//   const handleCvSelect = (cvData) => {
//     console.log("Cached CV selected, switching to form view.", cvData);
//     setPrefilledData(cvData.prepopulatedData);
//     setView("form");
//   };

//   const handleManualCreate = () => {
//     console.log("Manual creation selected, switching to form view.");
//     setPrefilledData(null);
//     setView("form");
//   };

//   const handleUserCreated = () => {
//     console.log("User created successfully, returning to selection view.");
//     setView("selection");
//     setPrefilledData(null);
//   };

//   const resetView = () => {
//     setView("selection");
//     setPrefilledData(null);
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6">
//       <motion.div initial="hidden" animate="visible" variants={fadeIn}>
//         <ProfileHeader
//           title="Create New User"
//           description={
//             view === "selection"
//               ? "Add a new member by uploading a CV, selecting a cached one, or creating manually."
//               : "Fill in the user's details to complete their profile."
//           }
//         />
//       </motion.div>

//       {view === "form" ? (
//         <motion.div initial="hidden" animate="visible" variants={fadeIn}>
//           <Button
//             variant="ghost"
//             onClick={resetView}
//             className="mb-6 text-muted-foreground"
//           >
//             <ArrowLeft size={16} className="mr-2" />
//             Back to All Options
//           </Button>
//           <UserCreationForm
//             initialData={prefilledData}
//             onBack={resetView}
//             onSuccess={handleUserCreated}
//           />
//         </motion.div>
//       ) : (
//         <motion.div
//           className="mt-8"
//           initial="hidden"
//           animate="visible"
//           variants={fadeIn}
//         >
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-foreground mb-4">
//                   Upload New CV
//                 </h3>
//                 <CVUploader onSuccess={handleUploadSuccess} />
//               </div>
//               <div className="flex items-center">
//                 <div className="flex-grow border-t border-border"></div>
//                 <span className="flex-shrink-0 px-4 text-xs text-muted-foreground">
//                   OR
//                 </span>
//                 <div className="flex-grow border-t border-border"></div>
//               </div>
//               <div>
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   onClick={handleManualCreate}
//                   className="w-full h-16 text-base"
//                 >
//                   <UserPlus className="mr-3 h-6 w-6" />
//                   Create User Manually
//                 </Button>
//               </div>
//             </div>
//             <div className="lg:border-l lg:pl-8">
//               <CachedCVs key={refreshKey} onSelectCv={handleCvSelect} />
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }
