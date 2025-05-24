"use client";
import { PulseLoader } from "react-spinners";
const LoadingSpinner = ({
  loading = true,
  color = "#333333",
  size = 15,
  speedMultiplier = 0.75,
  className = "",
  ...props
}) => {
  const loaderHeight = size;
  const loaderWidth = size / 3;
  const loaderRadius = size / 2;

  if (!loading) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <PulseLoader
        color={color}
        loading={loading}
        height={loaderHeight}
        width={loaderWidth}
        radius={loaderRadius}
        speedMultiplier={speedMultiplier}
        aria-label="Loading Spinner"
        data-testid="loader"
        {...props}
      />
    </div>
  );
};

export default LoadingSpinner;
