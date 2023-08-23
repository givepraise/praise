type BoolValue = {
  type: 'bool';
  value: boolean;
};

type Bytes32Value = {
  type: 'bytes32';
  value: string;
};

type StringValue = {
  type: 'string';
  value: string;
};

type AddressValue = {
  type: 'address';
  value: string;
};

type BytesValue = {
  type: 'bytes';
  value: string;
};

type UintValue = {
  type: 'uint';
  size: number;
  value: string;
};

export type ParsedValue =
  | BoolValue
  | Bytes32Value
  | StringValue
  | UintValue
  | AddressValue
  | BytesValue;
