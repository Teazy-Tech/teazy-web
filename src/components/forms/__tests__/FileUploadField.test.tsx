import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormikContext } from "formik";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { compressImage } from "@/lib/image/compress";
import { FileUploadField, Form } from "..";

vi.mock("@/lib/image/compress", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/image/compress")>()),
  compressImage: vi.fn(),
}));

function FileNames() {
  const { values } = useFormikContext<{ pages: File[] }>();
  return <output data-testid="names">{values.pages.map((f) => f.name).join(",")}</output>;
}

function setup(props: Partial<Parameters<typeof FileUploadField>[0]> = {}) {
  const compress = vi.mocked(compressImage);
  compress.mockReset();
  compress.mockImplementation(
    async (f: File) =>
      new File(["small"], f.name.replace(/\.png$/, ".jpg"), { type: "image/jpeg" }),
  );
  render(
    <Form
      schema={z.object({ pages: z.array(z.instanceof(File)).min(1, "Add at least one page") })}
      initialValues={{ pages: [] as File[] }}
      onSubmit={() => {}}
    >
      <FileUploadField name="pages" label="Script pages" required {...props} />
      <FileNames />
    </Form>,
  );
  return { compress, input: screen.getByLabelText(/script pages/i) as HTMLInputElement };
}

const photo = (name: string) => new File(["x".repeat(10)], name, { type: "image/png" });

describe("FileUploadField", () => {
  it("compresses photos before they enter the form value", async () => {
    const user = userEvent.setup();
    const { compress, input } = setup();
    await user.upload(input, [photo("page1.png"), photo("page2.png")]);
    await waitFor(() =>
      expect(screen.getByTestId("names")).toHaveTextContent("page1.jpg,page2.jpg"),
    );
    expect(compress).toHaveBeenCalledTimes(2);
  });

  it("keeps remove buttons visible and labelled, and removes the right file", async () => {
    const user = userEvent.setup();
    const { input } = setup();
    await user.upload(input, [photo("a.png"), photo("b.png")]);
    const remove = await screen.findByRole("button", { name: "Remove file 1, a.jpg" });
    expect(remove).toBeVisible();
    await user.click(remove);
    expect(screen.getByTestId("names")).toHaveTextContent("b.jpg");
  });

  it("rejects unsupported types and files over the limit with a message", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { input } = setup({ maxFiles: 1 });
    await user.upload(input, [
      new File(["x"], "notes.docx", { type: "application/msword" }),
      photo("a.png"),
      photo("b.png"),
    ]);
    expect(await screen.findByText("notes.docx is not a supported file type")).toBeInTheDocument();
    expect(screen.getByText("Only 1 files allowed; 1 not added")).toBeInTheDocument();
    expect(screen.getByTestId("names")).toHaveTextContent("a.jpg");
  });

  it("offers a camera button for phones", () => {
    setup();
    expect(screen.getByRole("button", { name: /take photo/i })).toBeInTheDocument();
  });
});
