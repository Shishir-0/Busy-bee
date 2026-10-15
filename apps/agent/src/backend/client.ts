import {
  GetNegotiationContextInputSchema,
  GetNegotiationContextOutputSchema,
  SubmitOfferObservationInputSchema,
  SubmitOfferObservationOutputSchema,
  RequestNegotiationActionInputSchema,
  RequestNegotiationActionOutputSchema,
  SubmitConfirmationRequestInputSchema,
  SubmitConfirmationRequestOutputSchema,
  EndNegotiationSessionInputSchema,
  EndNegotiationSessionOutputSchema,
  type GetNegotiationContextInput,
  type GetNegotiationContextOutput,
  type SubmitOfferObservationInput,
  type SubmitOfferObservationOutput,
  type RequestNegotiationActionInput,
  type RequestNegotiationActionOutput,
  type SubmitConfirmationRequestInput,
  type SubmitConfirmationRequestOutput,
  type EndNegotiationSessionInput,
  type EndNegotiationSessionOutput,
} from "@busy-bee/contracts";
import type { MockNegotiationBackend } from "../test-server/mock-backend.js";

export interface BackendClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  mockBackend?: MockNegotiationBackend;
}

export class NegotiationBackendClient {
  private baseUrl: string;
  private timeoutMs: number;
  private mockBackend?: MockNegotiationBackend;

  constructor(options: BackendClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.mockBackend = options.mockBackend;
  }

  public async getNegotiationContext(
    input: GetNegotiationContextInput
  ): Promise<GetNegotiationContextOutput> {
    const validatedInput = GetNegotiationContextInputSchema.parse(input);

    if (this.mockBackend) {
      const res = this.mockBackend.getContext(
        validatedInput.negotiationId,
        validatedInput.sessionId
      );
      return GetNegotiationContextOutputSchema.parse(res);
    }

    const res = await this.fetchWithTimeout(
      `${this.baseUrl}/negotiations/${validatedInput.negotiationId}/sessions/${validatedInput.sessionId}/context`,
      { method: "GET" }
    );
    return GetNegotiationContextOutputSchema.parse(res);
  }

  public async submitOfferObservation(
    input: SubmitOfferObservationInput
  ): Promise<SubmitOfferObservationOutput> {
    const validatedInput = SubmitOfferObservationInputSchema.parse(input);

    if (this.mockBackend) {
      const res = this.mockBackend.submitObservation(validatedInput);
      return SubmitOfferObservationOutputSchema.parse(res);
    }

    const res = await this.fetchWithTimeout(
      `${this.baseUrl}/negotiations/${validatedInput.negotiationId}/sessions/${validatedInput.sessionId}/observations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      }
    );
    return SubmitOfferObservationOutputSchema.parse(res);
  }

  public async requestNegotiationAction(
    input: RequestNegotiationActionInput
  ): Promise<RequestNegotiationActionOutput> {
    const validatedInput = RequestNegotiationActionInputSchema.parse(input);

    if (this.mockBackend) {
      const res = this.mockBackend.evaluateAction(validatedInput);
      return RequestNegotiationActionOutputSchema.parse(res);
    }

    const res = await this.fetchWithTimeout(
      `${this.baseUrl}/negotiations/${validatedInput.negotiationId}/sessions/${validatedInput.sessionId}/actions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      }
    );
    return RequestNegotiationActionOutputSchema.parse(res);
  }

  public async submitConfirmationRequest(
    input: SubmitConfirmationRequestInput
  ): Promise<SubmitConfirmationRequestOutput> {
    const validatedInput = SubmitConfirmationRequestInputSchema.parse(input);

    if (this.mockBackend) {
      const res = this.mockBackend.confirmTerms(validatedInput);
      return SubmitConfirmationRequestOutputSchema.parse(res);
    }

    const res = await this.fetchWithTimeout(
      `${this.baseUrl}/negotiations/${validatedInput.negotiationId}/sessions/${validatedInput.sessionId}/confirmations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      }
    );
    return SubmitConfirmationRequestOutputSchema.parse(res);
  }

  public async endNegotiationSession(
    input: EndNegotiationSessionInput
  ): Promise<EndNegotiationSessionOutput> {
    const validatedInput = EndNegotiationSessionInputSchema.parse(input);

    if (this.mockBackend) {
      const res = this.mockBackend.endSession(validatedInput);
      return EndNegotiationSessionOutputSchema.parse(res);
    }

    const res = await this.fetchWithTimeout(
      `${this.baseUrl}/negotiations/${validatedInput.negotiationId}/sessions/${validatedInput.sessionId}/end`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      }
    );
    return EndNegotiationSessionOutputSchema.parse(res);
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status} from backend: ${errorText}`);
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Backend request timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
