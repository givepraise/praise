interface IUsersTableHeader {
  label: string;
}

const UsersTableHeader = ({ label }: IUsersTableHeader): JSX.Element => {
  return (
    <div className="w-1/3">
      <span className="font-bold">{label}</span>
    </div>
  );
};

export default UsersTableHeader;
