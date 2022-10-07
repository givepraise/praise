interface ReceiverData {
  validReceiverIds: RegExpMatchArray | null;
  undefinedReceivers: RegExpMatchArray | null;
  roleMentions: RegExpMatchArray | null;
}

export const getReceiverData = (receivers: string): ReceiverData => {
  return {
    validReceiverIds: receivers?.match(/<@!?(\d+)>/g),
    undefinedReceivers: receivers?.match(/[^<]@(\w+)/gi),
    roleMentions: receivers?.match(/<@&(\d+)>/g),
  };
};
