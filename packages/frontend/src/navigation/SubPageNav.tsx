interface SubPageNavProps {
  children: JSX.Element;
}

export const SubPageNav = ({ children }: SubPageNavProps): JSX.Element => {
  return (
    <div>
      <div className="w-full xl:w-[230px] break-words praise-box-defaults">
        {children}
      </div>
    </div>
  );
};
