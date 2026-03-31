const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "⚡ Gigly API",
      version: "1.0.0",
      description:
        "Hyperlocal instant hiring platform. Connects businesses with gig workers in real-time for short-duration shifts (2–5 hours). No interviews, instant matching.",
      contact: { name: "Gigly Dev Team", email: "dev@gigly.app" },
    },
    servers: [
      { url: "http://localhost:5000/api/v1", description: "Development" },
      { url: "https://api.gigly.app/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your JWT access token here",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id:               { type: "string" },
            name:              { type: "string" },
            email:             { type: "string", format: "email" },
            role:              { type: "string", enum: ["worker", "business", "admin"] },
            avatar:            { type: "string" },
            bio:               { type: "string" },
            skills:            { type: "array", items: { type: "string" } },
            averageRating:     { type: "number" },
            totalJobsCompleted:{ type: "number" },
            isIdVerified:      { type: "boolean" },
            isOnline:          { type: "boolean" },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id:          { type: "string" },
            title:        { type: "string" },
            description:  { type: "string" },
            category:     { type: "string" },
            payPerHour:   { type: "number" },
            totalPay:     { type: "number" },
            durationHours:{ type: "number" },
            date:         { type: "string", format: "date-time" },
            startTime:    { type: "string", example: "09:00" },
            endTime:      { type: "string", example: "14:00" },
            slotsRequired:{ type: "number" },
            slotsFilled:  { type: "number" },
            isUrgent:     { type: "boolean" },
            status:       { type: "string", enum: ["open", "in_progress", "completed", "cancelled", "expired"] },
            location: {
              type: "object",
              properties: {
                address: { type: "string" },
                city:    { type: "string" },
                coordinates: { type: "array", items: { type: "number" } },
              },
            },
          },
        },
        Application: {
          type: "object",
          properties: {
            _id:       { type: "string" },
            job:       { type: "string" },
            worker:    { type: "string" },
            business:  { type: "string" },
            status:    { type: "string", enum: ["pending", "viewed", "shortlisted", "accepted", "rejected", "completed"] },
            coverNote: { type: "string" },
            checkInTime:  { type: "string", format: "date-time" },
            checkOutTime: { type: "string", format: "date-time" },
            actualHours:  { type: "number" },
            totalPaid:    { type: "number" },
            isPaid:       { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
