const envCheck = (requiredEnvVariables: Array<string>): void => {
  const unsetEnv = requiredEnvVariables.filter(
    (env) =>
      !(typeof process.env[env] !== 'undefined') || process.env[env] === ''
  );

  if (unsetEnv.length > 0) {
    throw new Error(
      `Required ENV variables are not set: [${unsetEnv.join(', ')}]`
    );
  }
};

export { envCheck };
