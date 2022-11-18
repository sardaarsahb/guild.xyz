import useGuild from "components/[guild]/hooks/useGuild"
import useShowErrorToast from "hooks/useShowErrorToast"
import { SignedValdation, useSubmitWithSign } from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useFieldArray, useFormContext, useFormState } from "react-hook-form"
import fetcher from "utils/fetcher"
import { useRolePlatform } from "../../RolePlatformProvider"

type Data = {
  removePlatformAccess: boolean
}

const useRemovePlatform = () => {
  const { mutateGuild } = useGuild()
  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const { index, guildPlatformId, roleId } = useRolePlatform()
  const { dirtyFields } = useFormState()
  const { reset } = useFormContext()
  const { remove } = useFieldArray({
    name: "rolePlatforms",
  })

  const submit = async (signedValidation: SignedValdation) =>
    fetcher(`/role/${roleId}/platform/${guildPlatformId}`, {
      method: "DELETE",
      ...signedValidation,
    })

  return useSubmitWithSign<any>(submit, {
    forcePrompt: true,
    onSuccess: () => {
      toast({
        title: `Platform removed!`,
        status: "success",
      })
      remove(index)
      if (!Object.keys(dirtyFields).length) reset(undefined, { keepValues: true })

      mutateGuild()
    },
    onError: (error) => showErrorToast(error),
  })
}

export default useRemovePlatform
