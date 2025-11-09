"use client";
import { BarLoader } from "react-spinners";

const LoadingSpinner = ({
  loading = true,
  color = "#4a2545", // RSCM Violet
  width = 100,
  height = 4,
  speedMultiplier = 1,
  className = "",
  ...props
}) => {
  if (!loading) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <BarLoader
        color={color}
        loading={loading}
        width={width}
        height={height}
        speedMultiplier={speedMultiplier}
        aria-label="Loading Spinner"
        data-testid="loader"
        {...props}
      />
    </div>
  );
};

export default LoadingSpinner;
