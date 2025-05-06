"use client";

import { ScaleLoader } from "react-spinners";
//might review for other spinner types, fadeloader?pacmanloader?
//can gradient color scheme be implemented in the loader component? use the qhala color scheme instead of a single color.
const LoadingSpinner = ({
  loading = true,
  color = "#3b82f6",
  size = 15,
  speedMultiplier = 1,
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
      <ScaleLoader
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
