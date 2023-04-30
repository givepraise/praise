export const Header = ({
  children,
  className,
}: {
  children: JSX.Element | string;
  className?: string;
}): JSX.Element => {
  return <h2 className={className}>{children}</h2>;
};
