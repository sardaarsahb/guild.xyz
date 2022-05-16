import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import CreatePage from "../src/pages/create-guild/telegram"
import useIsTGBotInSpy from "./spies/useIsTGBotIn.spy"
import ProvidersWrapper from "./utils/ProvidersWrapper"

beforeEach(() => {
  render(<ProvidersWrapper Component={CreatePage} />)
})

describe("telegram create page", () => {
  it("renders", () => {
    expect(screen.getByText(/create guild on telegram/i)).toBeDefined()
    expect(screen.getByText(/0x[a-f0-9\.]+/i)).toBeDefined()
  })

  it("can create guild", async () => {
    const input = screen.getByTestId("tg-group-id-input") as HTMLInputElement

    fireEvent.change(input, {
      target: { value: process.env.VITEST_TG_GROUP_ID },
    })
    fireEvent.blur(input)
    expect(input.value).toBe(process.env.VITEST_TG_GROUP_ID)

    await waitFor(() => {
      expect(useIsTGBotInSpy).toHaveBeenCalledWith(process.env.VITEST_TG_GROUP_ID)
    })

    await waitFor(() => {
      expect(screen.getByText(/guild bot added/i)).toBeDefined()
    })
  })
})
