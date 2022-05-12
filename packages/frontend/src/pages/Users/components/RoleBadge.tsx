interface IRoleBadge {
  label: string;
}

const RoleBadge = ({ label }: IRoleBadge): JSX.Element => {
  return (
    <div className="w-min bg-black p-2 rounded-md">
      <span className="text-white">{label}</span>
    </div>
  );
};

export default RoleBadge;
