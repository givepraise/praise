interface ReceiverData {
  validReceiverIds: RegExpMatchArray | null;
  undefinedReceivers: RegExpMatchArray | null;
  roleMentions: RegExpMatchArray | null;
}

export const getReceiverData = (receivers: string): ReceiverData => {
  return {
    validReceiverIds: receivers?.match(/<@!?([0-9]+)>/g),
    undefinedReceivers: receivers?.match(/[^<]@([a-z0-9]+)/gi),
    roleMentions: receivers?.match(/<@&([0-9]+)>/g),
  };
};
