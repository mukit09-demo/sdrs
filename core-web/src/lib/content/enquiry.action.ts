"use server";

import { content } from "@/lib/content";
import {
  ENQUIRY_FIELDS,
  enquiryRules,
  type EnquiryFormState,
} from "@/lib/content/enquiry";
import { hasErrors, readFields, validateFields } from "@sdrs/shared/utils/validate";

/**
 * Server action behind the contact form.
 *
 * Validation runs on the server so it holds regardless of the client, and the
 * submission goes through `ContentRepository.submitEnquiry` — which means it
 * posts to Spring Boot as soon as `NEXT_PUBLIC_CONTENT_SOURCE=api`, with no
 * change to this file or to the form.
 */
export async function submitEnquiryAction(
  _previousState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const values = readFields(formData, ENQUIRY_FIELDS);
  const errors = validateFields(values, enquiryRules);

  if (hasErrors(errors)) {
    return { status: "error", errors, values };
  }

  try {
    const result = await content.submitEnquiry({
      name: values.name,
      email: values.email,
      organisation: values.organisation || undefined,
      topic: values.topic,
      message: values.message,
    });

    return { status: "success", reference: result.reference };
  } catch (error) {
    console.error("Enquiry submission failed", error);
    return {
      status: "error",
      errors: {},
      values,
      message:
        "We could not send your enquiry just now. Please try again, or email us directly.",
    };
  }
}
