export interface Config {
  apiKey?: string;
  canvas?: boolean;
  github?: boolean;
}

const parseArguments = (): Config => {
  const config: Config = {};

  process.argv.forEach((arg) => {
    if (arg === "--canvas") {
      config.canvas = true;
      return;
    }

    if (arg === "--github") {
      config.github = true;
      return;
    }

    const keyValuePatterns = [
      /^([A-Z_]+)=(.+)$/,
      /^--([A-Z_]+)=(.+)$/,
      /^\/([A-Z_]+):(.+)$/,
      /^-([A-Z_]+)[ =](.+)$/,
    ];

    for (const pattern of keyValuePatterns) {
      const match = arg.match(pattern);
      if (match) {
        const [, key, value] = match;
        if (key === "API_KEY") {
          const cleanValue = value.replaceAll('"', "").replaceAll("'", "");
          config.apiKey = cleanValue;
          break;
        }
      }
    }
  });

  return config;
};

export const config = parseArguments();
