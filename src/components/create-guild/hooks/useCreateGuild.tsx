import useJsConfetti from "components/create-guild/hooks/useJsConfetti"
import processConnectorError from "components/[guild]/JoinModal/utils/processConnectorError"
import useDatadog from "components/_app/Datadog/useDatadog"
import useMatchMutate from "hooks/useMatchMutate"
import useShowErrorToast from "hooks/useShowErrorToast"
import { useSubmitWithSign, WithValidation } from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { Guild, Requirement } from "types"
import fetcher from "utils/fetcher"
import replacer from "utils/guildJsonReplacer"

// TODO: better types
type RoleOrGuild = Guild & { requirements?: Array<Requirement> }

const useCreateGuild = () => {
  const { addDatadogAction, addDatadogError } = useDatadog()
  const matchMutate = useMatchMutate()

  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const triggerConfetti = useJsConfetti()
  const router = useRouter()

  const fetchData = async ({
    validation,
    data,
  }: WithValidation<RoleOrGuild>): Promise<RoleOrGuild> =>
    fetcher("/guild", {
      validation,
      body: data,
    })

  const useSubmitResponse = useSubmitWithSign<any, RoleOrGuild>(fetchData, {
    onError: (error_) => {
      addDatadogError(`Guild creation error`, { error: error_ })

      const processedError = processConnectorError(error_)
      showErrorToast(processedError || error_)
    },
    onSuccess: (response_) => {
      addDatadogAction(`Successful guild creation`)
      triggerConfetti()

      toast({
        title: `Guild successfully created!`,
        description: "You're being redirected to its page",
        status: "success",
      })
      router.push(`/${response_.urlName}`)

      matchMutate(/^\/guild\/address\//)
      matchMutate(/^\/guild\?order/)
    },
  })

  return {
    ...useSubmitResponse,
    onSubmit: (data) =>
      useSubmitResponse.onSubmit(JSON.parse(JSON.stringify(data, replacer))),
  }
}

export default useCreateGuild
