const SettingsCard = ({ icon, title, description, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
            {icon}
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white">
            {title}
          </h3>
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {description}
          </p>
        )}

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default SettingsCard;
