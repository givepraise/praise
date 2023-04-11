import { LoaderSpinner } from '../../../../components/ui/LoaderSpinner';

export const LoadPlaceholder = ({
  size = 'L',
}: {
  size?: 'S' | 'M' | 'L';
}): JSX.Element => {
  const aspect =
    size === 'L'
      ? 'aspect-[3/2]'
      : size === 'M'
      ? 'aspect-[16/9]'
      : 'aspect-[21/9]';

  return (
    <div
      className={`w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column ${aspect}`}
    >
      <LoaderSpinner />
    </div>
  );
};
