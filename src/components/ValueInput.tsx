import { NumberInput, Select, TextInput } from '@mantine/core';
import { VariableTypeOption, VariableValue } from '@/src/types';

interface ValueInputProps {
  type?: VariableTypeOption;
  value: VariableValue;
  onChange: (value: VariableValue) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ValueInput = ({ type, value, onChange, ...props }: ValueInputProps) => {
  if (type === 'number') {
    return <NumberInput {...props} value={Number(value)} onChange={(v) => onChange(Number(v))} />;
  }
  if (type === 'boolean') {
    return (
      <Select
        {...props}
        value={String(value)}
        onChange={(v) => onChange(v === 'true')}
        data={[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
        ]}
      />
    );
  }
  return (
    <TextInput {...props} value={String(value)} onChange={(e) => onChange(e.currentTarget.value)} />
  );
};

export default ValueInput;
