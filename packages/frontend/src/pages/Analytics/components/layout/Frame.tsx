export const Frame = ({
  children,
}: {
  children: JSX.Element[];
}): JSX.Element => {
  return (
    <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      {children}
    </div>
  );
};
