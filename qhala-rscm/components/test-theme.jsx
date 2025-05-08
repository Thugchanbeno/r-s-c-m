// pages/test-theme.jsx or a simple component
export default function TestThemePage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Theme Test Page</h1>
      <p className="text-red-700 dark:text-blue-300">
        This text should be RED in light mode and BLUE in dark mode.
      </p>
      <p className="text-green-700">
        This text should be GREEN in light mode (no dark variant).
      </p>
      <p className="dark:text-yellow-300">
        This text should be default body color in light mode and YELLOW in dark
        mode.
      </p>
      <p>This text should follow body foreground color.</p>
    </div>
  );
}
