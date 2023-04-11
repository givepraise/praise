export const Header = ({
  children,
}: {
  children: JSX.Element | string;
}): JSX.Element => {
  return <h2>{children}</h2>;
};
