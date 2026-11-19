import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ErrorSummary, Form, SelectField, SubmitButton, TextareaField, TextField } from "..";

const schema = z.object({
  topic: z.string().trim().min(1, "Enter a topic"),
  notes: z.string().max(20, "Keep notes under 20 characters").optional(),
  duration: z.string().min(1, "Choose a duration"),
});

function LessonishForm({
  onSubmit,
}: {
  onSubmit: (v: z.output<typeof schema>) => void | Promise<void>;
}) {
  return (
    <Form
      schema={schema}
      initialValues={{ topic: "", notes: "", duration: "" }}
      onSubmit={onSubmit}
      aria-label="Lesson details"
    >
      <ErrorSummary />
      <TextField name="topic" label="Topic" required />
      <TextareaField name="notes" label="Notes" maxLength={40} />
      <SelectField
        name="duration"
        label="Duration"
        required
        options={[
          { value: "40", label: "40 minutes" },
          { value: "80", label: "80 minutes" },
        ]}
      />
      <SubmitButton pendingLabel="Generating…">Generate</SubmitButton>
    </Form>
  );
}

describe("form kit: Form, fields, SubmitButton, ErrorSummary", () => {
  it("posts natively, so values never reach the URL before hydration", () => {
    render(<LessonishForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("form", { name: "Lesson details" })).toHaveAttribute("method", "post");
  });

  it("labels every field and marks optional ones", () => {
    render(<LessonishForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: /topic/i })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /duration/i })).toBeInTheDocument();
  });

  it("once the form is started, says which fields are still needed", async () => {
    const user = userEvent.setup();
    render(<LessonishForm onSubmit={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Generate" });
    expect(button).not.toHaveAccessibleDescription(); // untouched form: no hint yet

    await user.type(screen.getByRole("textbox", { name: /notes/i }), "x");
    await waitFor(() =>
      expect(button).toHaveAccessibleDescription("Still needed: Topic, Duration"),
    );
    expect(button).toBeEnabled(); // never disabled, so it stays focusable and pressable
    expect(button).not.toHaveAttribute("aria-disabled");
  });

  it("on a failed submit, shows the summary, focuses it and links to each field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LessonishForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Generate" }));

    const summary = await screen.findByRole("alert");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: /topic/i })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: /topic/i })).toHaveAccessibleDescription(
      "Enter a topic",
    );

    await user.click(screen.getByRole("link", { name: /Topic: Enter a topic/ }));
    expect(screen.getByRole("textbox", { name: /topic/i })).toHaveFocus();
  });

  it("submits values parsed by the schema and shows the pending label", async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<LessonishForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: /topic/i }), "  Fractions  ");
    await user.selectOptions(screen.getByRole("combobox", { name: /duration/i }), "40");
    await user.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { topic: "Fractions", notes: "", duration: "40" },
        expect.anything(),
      ),
    );
    expect(screen.getByRole("button", { name: /Generating…/ })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    finish();
  });

  it("shows a form-level error set through Formik status", async () => {
    const user = userEvent.setup();
    render(
      <Form
        schema={z.object({ topic: z.string() })}
        initialValues={{ topic: "x" }}
        onSubmit={(_values, helpers) =>
          helpers.setStatus({ formError: "You have used this month's lessons." })
        }
      >
        <ErrorSummary />
        <TextField name="topic" label="Topic" />
        <SubmitButton>Go</SubmitButton>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You have used this month's lessons.",
    );
  });

  it("counts characters for a textarea with a limit", async () => {
    const user = userEvent.setup();
    render(<LessonishForm onSubmit={vi.fn()} />);
    await user.type(screen.getByRole("textbox", { name: /notes/i }), "abc");
    expect(screen.getByText("3 / 40")).toBeInTheDocument();
  });
});
