import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormikContext } from "formik";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { CURRICULA_FIXTURE } from "@/test/fixtures/curricula";
import type { RootState } from "@/store/makeStore";
import { renderWithStore } from "@/test/render";
import { Form, TeachingContextFields } from "..";

const schema = z.object({
  curriculumId: z.string().min(1, "Choose a curriculum"),
  classLevel: z.string().min(1, "Choose a class"),
  subjectId: z.string().min(1, "Choose a subject"),
});

function Values() {
  const { values } = useFormikContext();
  return <output data-testid="values">{JSON.stringify(values)}</output>;
}

function setup(preloadedState?: Partial<RootState>) {
  return renderWithStore(
    <Form
      schema={schema}
      initialValues={{ curriculumId: "", classLevel: "", subjectId: "" }}
      onSubmit={() => {}}
    >
      <TeachingContextFields curricula={CURRICULA_FIXTURE} />
      <Values />
    </Form>,
    { preloadedState },
  );
}

const values = () => JSON.parse(screen.getByTestId("values").textContent ?? "{}");

describe("TeachingContextFields", () => {
  it("pre-fills from the saved teaching context", async () => {
    setup({
      teachingContext: {
        curriculumId: "nigeria-nerdc",
        classLevel: "SS 2",
        subjectIds: ["physics"],
      },
    });
    await waitFor(() =>
      expect(values()).toEqual({
        curriculumId: "nigeria-nerdc",
        classLevel: "SS 2",
        subjectId: "physics",
      }),
    );
  });

  it("uses the curriculum's own class list and term", async () => {
    const user = userEvent.setup();
    setup();
    const classSelect = screen.getByRole("combobox", { name: /class/i });
    expect(classSelect).toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox", { name: /curriculum/i }), "kenya-cbc");
    const gradeSelect = await screen.findByRole("combobox", { name: /grade/i });
    const labels = within(gradeSelect)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(labels).toContain("Grade 7");
    expect(labels).not.toContain("SS 2");
  });

  it("clears a class that doesn't exist in the newly chosen curriculum", async () => {
    const user = userEvent.setup();
    setup({
      teachingContext: {
        curriculumId: "nigeria-nerdc",
        classLevel: "SS 2",
        subjectIds: ["physics"],
      },
    });
    await waitFor(() => expect(values().classLevel).toBe("SS 2"));

    await user.selectOptions(screen.getByRole("combobox", { name: /curriculum/i }), "ghana");
    await waitFor(() =>
      expect(values()).toEqual({ curriculumId: "ghana", classLevel: "", subjectId: "" }),
    );
  });

  it("auto-selects the only class of a single-class curriculum", async () => {
    const user = userEvent.setup();
    setup();
    await user.selectOptions(screen.getByRole("combobox", { name: /curriculum/i }), "waec");
    await waitFor(() => expect(values().classLevel).toBe("SS 3"));
  });

  it("remembers the teacher's choice for the next tool", async () => {
    const user = userEvent.setup();
    const { store } = setup();
    await user.selectOptions(
      screen.getByRole("combobox", { name: /curriculum/i }),
      "nigeria-nerdc",
    );
    await user.selectOptions(screen.getByRole("combobox", { name: /class/i }), "JSS 1");
    await waitFor(() =>
      expect(store.getState().teachingContext).toEqual({
        curriculumId: "nigeria-nerdc",
        classLevel: "JSS 1",
        subjectIds: [],
      }),
    );
  });
});
