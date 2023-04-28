export const HeaderNumber = ({ value }: { value: number }): JSX.Element => {
  return (
    <div className="float-left text-3xl font-bold">
      {new Intl.NumberFormat().format(value)}
    </div>
  );
};
