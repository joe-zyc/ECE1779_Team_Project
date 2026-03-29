const request = require("supertest");

const mockPoolQuery = jest.fn();
const mockJwtVerify = jest.fn();
const mockJwtSign = jest.fn(() => "mock-token");

jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockPoolQuery,
  })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: (...args) => mockJwtVerify(...args),
  sign: (...args) => mockJwtSign(...args),
}));

const { createApp } = require("../src/app");

describe("API tests", () => {
  const apiBase = "/api/v1";
  let app;

  beforeEach(() => {
    app = createApp();
    mockPoolQuery.mockReset();
    mockJwtVerify.mockReset();
    mockJwtSign.mockReset();
    mockJwtSign.mockReturnValue("mock-token");
  });

  test("GET /health/live returns ok", async () => {
    const res = await request(app).get("/health/live");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  test("GET /health/ready returns ok", async () => {
    const res = await request(app).get("/health/ready");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  test("unknown route returns NOT_FOUND payload", async () => {
    const res = await request(app).get("/not-a-real-route");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toContain("Route not found");
  });

  test("POST /auth/signup validates required fields", async () => {
    const res = await request(app).post(`${apiBase}/auth/signup`).send({
      email: "new-user@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_FIELDS");
  });

  test("POST /auth/login returns INVALID_CREDENTIALS when user does not exist", async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post(`${apiBase}/auth/login`).send({
      email: "missing-user@example.com",
      password: "any-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
  });

  test("GET /listings returns transformed thumbnail paths and pagination", async () => {
    mockPoolQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "listing-1",
          make: "Toyota",
          model: "Corolla",
          status: "published",
          thumbnail_path: "/tmp/project/storage/uploads/image-1.jpg",
        },
      ],
    });

    const res = await request(app).get(`${apiBase}/listings`).query({
      page: 2,
      limit: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 2, limit: 5 });
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].thumbnail_path).toBe("storage/uploads/image-1.jpg");

    const [sql, values] = mockPoolQuery.mock.calls[0];
    expect(sql).toContain("status = 'published'");
    expect(values.slice(-2)).toEqual([5, 5]);
  });

  test("GET /my/listings requires authentication", async () => {
    const res = await request(app).get(`${apiBase}/my/listings`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  test("GET /my/listings requires seller role", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "buyer-1",
      role: "buyer",
    });

    const res = await request(app)
      .get(`${apiBase}/my/listings`)
      .set("Authorization", "Bearer buyer-token");

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  test("GET /my/listings returns listings for authenticated seller", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "seller-1",
      role: "seller",
    });
    mockPoolQuery.mockResolvedValueOnce({
      rows: [{ id: "listing-1", seller_id: "seller-1" }],
    });

    const res = await request(app)
      .get(`${apiBase}/my/listings`)
      .set("Authorization", "Bearer seller-token");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE seller_id=$1"), ["seller-1"]);
  });

  test("POST /preferences requires buyer role", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "seller-1",
      role: "seller",
    });

    const res = await request(app)
      .post(`${apiBase}/preferences`)
      .set("Authorization", "Bearer seller-token")
      .send({ make: "Toyota" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  test("POST /preferences creates a preference for authenticated buyer", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "buyer-1",
      role: "buyer",
    });
    mockPoolQuery.mockResolvedValueOnce({
      rows: [{ id: "pref-1", buyer_id: "buyer-1", make: "Toyota", is_active: true }],
    });

    const res = await request(app)
      .post(`${apiBase}/preferences`)
      .set("Authorization", "Bearer buyer-token")
      .send({ make: "Toyota" });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe("pref-1");
    expect(mockPoolQuery.mock.calls[0][1][0]).toBe("buyer-1");
  });

  test("PATCH /listings/:id denies updates from non-owners", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "seller-1",
      role: "seller",
    });
    mockPoolQuery.mockResolvedValueOnce({
      rows: [{ seller_id: "another-seller" }],
    });

    const res = await request(app)
      .patch(`${apiBase}/listings/listing-1`)
      .set("Authorization", "Bearer seller-token")
      .send({ price: 12000 });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  test("PATCH /listings/:id updates listing for owner", async () => {
    mockJwtVerify.mockReturnValue({
      sub: "seller-1",
      role: "seller",
    });
    mockPoolQuery
      .mockResolvedValueOnce({
        rows: [{ seller_id: "seller-1" }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: "listing-1", make: "Honda" }],
      });

    const res = await request(app)
      .patch(`${apiBase}/listings/listing-1`)
      .set("Authorization", "Bearer seller-token")
      .send({ make: "Honda" });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("listing-1");
    expect(mockPoolQuery).toHaveBeenCalledTimes(2);
  });
});
