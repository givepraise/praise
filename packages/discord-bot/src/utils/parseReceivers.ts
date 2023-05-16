interface ParsedReceivers {
  validReceiverIds: RegExpMatchArray | null;
  undefinedReceivers: RegExpMatchArray | null;
  roleMentions: RegExpMatchArray | null;
}

export const parseReceivers = (receivers: string): ParsedReceivers => {
  return {
    validReceiverIds: receivers?.match(/<@!?(\d+)>/g),
    undefinedReceivers: receivers?.match(/[^<]@(\w+)/gi),
    roleMentions: receivers?.match(/<@&(\d+)>/g),
  };
};
