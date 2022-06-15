interface SubPageNavProps {
  children: JSX.Element;
}

export const SubPageNav = ({ children }: SubPageNavProps): JSX.Element => {
  return (
    <div>
      <div className="w-full xl:w-[230px] break-words border rounded-lg shadow-sm bg-gray-50 dark:bg-slate-600">
        {children}
      </div>
    </div>
  );
};
