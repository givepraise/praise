interface Props {
  header: string;
  children?: JSX.Element;
  description?: string;
}

export const SettingsSection = ({
  header,
  description,
  children,
}: Props): JSX.Element => {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 text-xl">{header}</div>
        <div className="text-sm">{description}</div>
      </div>
      {children}
    </div>
  );
};
