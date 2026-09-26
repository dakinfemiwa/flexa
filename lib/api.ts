const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HealthResponse = {
  status: string;
  service: string;
  database: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiUrl}/api/v1/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("The Flexa API is unavailable.");
  }

  return response.json() as Promise<HealthResponse>;
}
