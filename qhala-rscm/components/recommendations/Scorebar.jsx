import {
  getMatchScoreColorClasses,
  getScoreRatingText,
} from "@/components/common/skillcolors";

const EnhancedScoreBar = ({ score, label = "Overall Match" }) => {
  const percentage = Math.max(0, Math.min(1, score)) * 100;
  const barColorClass = getMatchScoreColorClasses(score, "bg");
  const ratingText = getScoreRatingText(score);
  const textColorClass = getMatchScoreColorClasses(score, "text");

  return (
    <div className="my-2">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
          {label}
        </span>
        <span className={`text-sm font-semibold ${textColorClass}`}>
          {ratingText} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner overflow-hidden">
        <div
          className={`${barColorClass} h-3 rounded-full transition-all duration-700 ease-out flex items-center justify-end`}
          style={{ width: `${percentage}%` }}
        >
          {/* Optional: add a subtle shine or pattern to the bar */}
          <div className="w-1/2 h-full bg-white/20 blur-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScoreBar;
