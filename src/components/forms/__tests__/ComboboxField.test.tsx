import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormikContext } from "formik";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ComboboxField, Form } from "..";

const options = [
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
];

function Values() {
  const { values } = useFormikContext();
  return <output data-testid="values">{JSON.stringify(values)}</output>;
}

describe("ComboboxField", () => {
  it("searches and picks one option with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <Form
        schema={z.object({ subject: z.string() })}
        initialValues={{ subject: "" }}
        onSubmit={() => {}}
      >
        <ComboboxField name="subject" label="Subject" options={options} required />
        <Values />
      </Form>,
    );
    const trigger = screen.getByRole("combobox", { name: /subject/i });
    await user.click(trigger);
    await user.keyboard("chem");
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByTestId("values")).toHaveTextContent('{"subject":"chemistry"}'),
    );
    expect(screen.getByRole("combobox", { name: /subject/i })).toHaveTextContent("Chemistry");
  });

  it("in multiple mode shows chosen items as chips with labelled remove buttons", async () => {
    const user = userEvent.setup();
    render(
      <Form
        schema={z.object({ subjects: z.array(z.string()) })}
        initialValues={{ subjects: ["physics", "biology"] }}
        onSubmit={() => {}}
      >
        <ComboboxField name="subjects" label="Subjects" options={options} multiple />
        <Values />
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Remove Physics" }));
    expect(screen.getByTestId("values")).toHaveTextContent('{"subjects":["biology"]}');
    expect(screen.getByRole("list", { name: "Chosen Subjects" })).toHaveTextContent("Biology");
  });
});
