import {
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import { useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"
import useLensProfiles from "./hooks/useLensProfiles"

const typeOptions = [
  {
    value: "LENS_PROFILE",
    label: "Have a LENS profile",
  },
  {
    value: "LENS_FOLLOW",
    label: "Follow a profile",
  },
  {
    value: "LENS_COLLECT",
    label: "Collect a post",
  },
  {
    value: "LENS_MIRROR",
    label: "Mirror a post",
  },
  {
    value: "LENS_TOTAL_FOLLOWERS",
    label: "Have at least [x] followers",
  },
  {
    value: "LENS_TOTAL_POSTS",
    label: "Have at least [x] posts",
  },
  {
    value: "LENS_FOLLOWED_BY",
    label: "Be followed by",
  },
]

const LensForm = ({ baseFieldPath, field }: RequirementFormProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  const type = useWatch({ name: `${baseFieldPath}.type` })

  return (
    <Stack spacing={4} alignItems="start">
      <FormControl isRequired>
        <FormLabel>Type:</FormLabel>

        <Controller
          name={`${baseFieldPath}.type` as const}
          control={control}
          rules={{
            required: "This field is required.",
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <StyledSelect
              ref={ref}
              options={typeOptions}
              placeholder="Choose type"
              value={typeOptions?.find((option) => option.value === value)}
              onChange={(newSelectedOption: SelectOption) => {
                onChange(newSelectedOption.value ?? null)
                // Resetting fields separately to avoid validation bugs
                setValue(`${baseFieldPath}.data.id`, "")
                setValue(`${baseFieldPath}.data.min`, "")
              }}
              onBlur={onBlur}
            />
          )}
        />
      </FormControl>

      {["LENS_COLLECT", "LENS_MIRROR"].includes(type) && (
        <FormControl
          isRequired
          isInvalid={parseFromObject(errors, baseFieldPath)?.data?.id}
        >
          <FormLabel>Post ID:</FormLabel>

          <Controller
            name={`${baseFieldPath}.data.id` as const}
            control={control}
            rules={{
              required: "This field is required.",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                placeholder="Paste Lenster link"
                value={value ?? ""}
                onChange={(event) => {
                  const newValue = event.target.value
                  const split = newValue.split("/")
                  onChange(split[split.length - 1])
                }}
                onBlur={onBlur}
              />
            )}
          />

          <FormErrorMessage>
            {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
          </FormErrorMessage>
        </FormControl>
      )}

      {["LENS_FOLLOW", "LENS_FOLLOWED_BY"].includes(type) && (
        <LensProfileSelect
          {...{ baseFieldPath, field }}
          placeholder={`Search user ${type === "LENS_FOLLOW" ? "to follow" : ""}`}
        />
      )}

      {["LENS_TOTAL_FOLLOWERS", "LENS_TOTAL_POSTS"].includes(type) && (
        <FormControl
          isRequired
          isInvalid={parseFromObject(errors, baseFieldPath)?.data?.min}
        >
          <FormLabel>{`Number of ${
            type === "LENS_TOTAL_POSTS" ? "posts" : "followers"
          }:`}</FormLabel>

          <Controller
            name={`${baseFieldPath}.data.min` as const}
            control={control}
            rules={{
              required: "This field is required.",
              min: {
                value: 1,
                message: "Amount must be positive",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <NumberInput
                ref={ref}
                value={value ?? ""}
                onChange={(newValue) => {
                  const parsedValue = parseInt(newValue)
                  onChange(isNaN(parsedValue) ? "" : parsedValue)
                }}
                onBlur={onBlur}
                min={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
          />

          <FormErrorMessage>
            {parseFromObject(errors, baseFieldPath)?.data?.min?.message}
          </FormErrorMessage>
        </FormControl>
      )}
    </Stack>
  )
}

type LensProfileSelectProps = RequirementFormProps & { placeholder?: string }

const LensProfileSelect = ({
  baseFieldPath,
  field,
  placeholder,
}: LensProfileSelectProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  // provide default value so there's options data on role edit
  // split before "." because I couldn't get the graphql query to work with "." in it
  const [search, setSearch] = useState(field?.data?.id?.split(".")?.[0] ?? "")

  const { handles, restCount, isLoading } = useLensProfiles(search)

  const options = handles?.map((handle) => ({ label: handle, value: handle }))

  if (restCount > 0)
    options.push({ label: `${restCount} more`, value: 0, isDisabled: true })

  return (
    <FormControl
      isRequired
      isInvalid={parseFromObject(errors, baseFieldPath)?.data?.id}
    >
      <FormLabel>Profile username:</FormLabel>

      <Controller
        name={`${baseFieldPath}.data.id` as const}
        control={control}
        rules={{
          required: "This field is required.",
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <StyledSelect
            ref={ref}
            isClearable
            options={options}
            placeholder={placeholder}
            value={value ? options?.find((option) => option.value === value) : null}
            onChange={(newSelectedOption: SelectOption) =>
              onChange(newSelectedOption?.value ?? null)
            }
            onInputChange={(inputValue) => setSearch(inputValue.split(".")[0])}
            isLoading={isLoading}
            onBlur={onBlur}
            // so restCount stays visible
            filterOption={() => true}
            menuIsOpen={search ? undefined : false}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
          />
        )}
      />

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default LensForm
