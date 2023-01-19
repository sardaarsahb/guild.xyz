import { useController, UseControllerProps } from "react-hook-form"
import { SelectOption } from "types"
import StyledSelect from "./StyledSelect"
import { StyledSelectProps } from "./StyledSelect/StyledSelect"

type Props = {
  rules?: Record<string, any>
  beforeOnChange?: (newValue: SelectOption) => void
  afterOnChange?: (newValue: SelectOption) => void
} & StyledSelectProps &
  UseControllerProps

const ControlledSelect = ({
  control,
  name: nameProp,
  rules,
  beforeOnChange,
  afterOnChange,
  options,
  ...rest
}: Props): JSX.Element => {
  const {
    field: { ref, name, value, onChange, onBlur },
  } = useController({
    control,
    name: nameProp,
    rules,
  })

  return (
    <StyledSelect
      ref={ref}
      name={name}
      options={options}
      value={options?.find((option) => option.value === value) ?? null}
      onChange={(newValue: SelectOption) => {
        beforeOnChange?.(newValue)
        onChange(newValue?.value ?? null)
        afterOnChange?.(newValue)
      }}
      onBlur={onBlur}
      {...rest}
    />
  )
}

export default ControlledSelect
