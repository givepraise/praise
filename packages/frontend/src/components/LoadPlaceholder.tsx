import { LoaderSpinner } from './ui/LoaderSpinner';

interface LoadPlaceholderProps {
  height: number;
}
export const LoadPlaceholder = ({
  height,
}: LoadPlaceholderProps): JSX.Element => {
  return (
    <div
      className="flex items-center w-full bg-warm-gray-100 rounded-xl dark:bg-slate-500"
      style={{ height }}
    >
      <LoaderSpinner />
    </div>
  );
};
