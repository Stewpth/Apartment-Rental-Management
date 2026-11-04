import assert from "node:assert/strict";
import test from "node:test";
import { publicRequest, validDate } from "./request-data.js";

test("validDate accepts a real ISO calendar date", () => {
  assert.equal(validDate("2024-02-29")?.toISOString(), "2024-02-29T00:00:00.000Z");
});

test("validDate rejects impossible calendar dates", () => {
  assert.equal(validDate("2025-02-29"), null);
  assert.equal(validDate("2025-13-01"), null);
});

test("validDate rejects timestamps and non-string input", () => {
  assert.equal(validDate("2025-01-01T00:00:00.000Z"), null);
  assert.equal(validDate(20250101), null);
});

test("publicRequest serializes tenant fallback and protected attachment routes", () => {
  const timestamp = new Date("2025-01-02T03:04:05.000Z");
  const result = publicRequest({
    id: "request-1",
    reference: "REQ-1",
    title: "Leaking tap",
    description: "The kitchen tap is leaking.",
    category: "REPAIR",
    status: "PENDING",
    reason: null,
    requestedMoveOutDate: null,
    priority: null,
    adminNotes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    resolvedAt: null,
    rental: {
      id: "rental-1",
      status: "ACTIVE",
      monthlyRent: { toString: () => "1250.00" },
      unit: { unitNumber: "Unit 4" },
      tenant: {
        id: "tenant-1",
        user: { username: "tenant4", profile: null },
      },
    },
    attachments: [
      { id: "file-1", storageKey: "private/file-1", fileName: "tap.jpg" },
    ],
    updates: [
      {
        id: "update-1",
        status: "PENDING",
        message: "Request submitted.",
        createdAt: timestamp,
        author: { username: "tenant4", profile: null },
      },
    ],
    settlement: null,
  });

  assert.equal(result.tenant.fullName, "tenant4");
  assert.equal(result.attachments[0].url, "/requests/attachments/private/file-1");
  assert.equal(result.rental.monthlyRent, "1250.00");
  assert.equal(result.updates[0].authorName, "tenant4");
});
