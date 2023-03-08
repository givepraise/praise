const ApplicationSettingsApiKeys = (): JSX.Element => {
  return (
    <>
      <div className="mb-2">
        Generated keys to give external applicaitons access to the Praise API.
        For details on the permission levels, see documentation:
        <a
          href="https://givepraise.xyz/docs/category/configuring-praise"
          target="_blank"
          rel="noreferrer"
        >
          API Keys
        </a>
      </div>
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">Keys</h3>
        <h3 className="text-lg font-bold">Access</h3>
      </div>
    </>
  );
};

export default ApplicationSettingsApiKeys;
