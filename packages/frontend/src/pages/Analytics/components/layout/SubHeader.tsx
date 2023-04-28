export const SubHeader = ({
  children,
}: {
  children: JSX.Element | string;
}): JSX.Element => {
  return <div className="clear-both font-bold">{children}</div>;
};
