interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {illustration || (
        <div className="text-6xl mb-4 opacity-50 dark:opacity-40">📦</div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{description}</p>
    </div>
  );
}

