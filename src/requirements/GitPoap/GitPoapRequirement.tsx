import { Link } from "@chakra-ui/react"
import DataBlock from "components/[guild]/Requirements/components/DataBlock"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import { usePoap } from "../Poap/hooks/usePoaps"

const GitPoapRequirement = (props: RequirementProps) => {
  const requirement = useRequirementContext()

  const { poap, isLoading, error } = usePoap(requirement?.data?.id)

  return (
    <Requirement
      isNegated={requirement.isNegated}
      image={poap?.image_url}
      isImageLoading={isLoading}
      {...props}
    >
      {"Own the "}
      {!poap || isLoading || error ? (
        <DataBlock
          isLoading={isLoading}
          error={error && "API error, please contact POAP to report."}
        >
          {requirement.data.id}
        </DataBlock>
      ) : (
        <Link
          href={`https://poap.gallery/event/${poap.id}`}
          isExternal
          display="inline"
          colorScheme="blue"
          fontWeight="medium"
        >
          {poap.name}
        </Link>
      )}
      {" GitPOAP"}
    </Requirement>
  )
}

export default GitPoapRequirement
