import {
  FormControl,
  FormHelperText,
  FormLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import OptionImage from "components/common/StyledSelect/components/CustomSelectOption/components/OptionImage"
import { useEffect, useMemo, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"
import { useGalaxyCampaign, useGalaxyCampaigns } from "./hooks/useGalaxyCampaigns"

const customFilterOption = (candidate, input) =>
  candidate.label.toLowerCase().includes(input?.toLowerCase()) ||
  candidate.data?.galaxyId?.includes(input)

const GalaxyForm = ({ baseFieldPath, field }: RequirementFormProps): JSX.Element => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  useEffect(() => {
    if (!register) return
    register(`${baseFieldPath}.data.galaxyId`)
  }, [register])

  const selectedId = useWatch({ control, name: `${baseFieldPath}.data.id` })

  const { campaigns, isLoading } = useGalaxyCampaigns()

  const [pastedId, setPastedId] = useState(field?.data?.galaxyId)
  const { campaign, isLoading: isCampaignLoading } = useGalaxyCampaign(
    !campaigns || campaigns?.find((c) => c.id === pastedId) ? null : pastedId
  )

  const mappedCampaigns = useMemo(() => {
    if (isLoading || isCampaignLoading) return []

    let allCampaigns = []

    if (campaign)
      allCampaigns.push({
        img: campaign.thumbnail,
        label: campaign.name,
        value: campaign.numberID?.toString(),
        galaxyId: campaign.id,
      })

    const publicCampaigns = campaigns?.map((c) => ({
      img: c.thumbnail,
      label: c.name,
      value: c.numberID?.toString(),
      galaxyId: c.id,
    }))

    if (publicCampaigns?.length) allCampaigns = allCampaigns.concat(publicCampaigns)

    return allCampaigns
  }, [campaigns, campaign])

  const [campaignImage, setCampaignImage] = useState(null)

  useEffect(() => {
    if (!campaigns?.length) return
    if (!selectedId) {
      setCampaignImage(null)
      return
    }

    const selectedCampaign = campaigns.find(
      (c) => c.numberID?.toString() === selectedId
    )

    const isPrivateCampaign = selectedId === campaign?.numberID?.toString()

    const thumbnail = isPrivateCampaign
      ? campaign.thumbnail
      : selectedCampaign?.thumbnail
    setCampaignImage(thumbnail)
  }, [campaigns, selectedId])

  return (
    <FormControl
      isRequired
      isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.id}
    >
      <FormLabel>Campaign:</FormLabel>

      <InputGroup>
        {campaignImage && (
          <InputLeftElement>
            <OptionImage img={campaignImage} alt="Campaign thumbnail" />
          </InputLeftElement>
        )}
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
              isLoading={isLoading || isCampaignLoading}
              options={mappedCampaigns}
              placeholder="Search campaigns..."
              value={mappedCampaigns?.find((c) => c.value === value) || null}
              onChange={(selectedOption: SelectOption) => {
                onChange(selectedOption?.value ?? null)
                setValue(`${baseFieldPath}.data.galaxyId`, selectedOption?.galaxyId)
              }}
              onInputChange={(text, _) => {
                if (!text?.length) return
                const regex = /^[a-zA-Z0-9]+$/i
                if (regex.test(text)) setPastedId(text)
              }}
              onBlur={onBlur}
              filterOption={customFilterOption}
            />
          )}
        />
      </InputGroup>

      <FormHelperText>Search by name or ID</FormHelperText>

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default GalaxyForm
