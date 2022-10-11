interface Props {
  header: string;
  children?: JSX.Element;
  description?: string;
}

export const SettingsSubgroup = ({
  header,
  description,
  children,
}: Props): JSX.Element => {
  return (
    <div>
      <div className="mb-5">
        <h2 className="mb-2">{header}</h2>
        <div>{description}</div>
      </div>
      {children}
    </div>
  );
};
