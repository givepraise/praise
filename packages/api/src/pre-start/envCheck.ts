const envCheck = (jsonData: Array<string>): void => {
  const unsetEnv = jsonData.filter(
    (env) =>
      !(typeof process.env[env] !== 'undefined') || process.env[env] === ''
  );

  if (unsetEnv.length > 0) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      'Required ENV variables are not set: [' + unsetEnv.join(', ') + ']'
    );
  }
};

export { envCheck };
