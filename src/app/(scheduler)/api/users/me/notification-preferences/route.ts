import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await payload.find({
      collection: "user-notification-preferences",
      where: {
        user: { equals: user.id },
      },
      sort: "type",
    });

    return Response.json({
      success: true,
      data: preferences.docs,
    });
  } catch (error) {
    console.error("Error fetching user notification preferences:", error);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, channel, preference } = body;

    if (!type || !channel || typeof preference !== "boolean") {
      return Response.json(
        { error: "Missing required fields: type, channel, preference" },
        { status: 400 },
      );
    }

    const newPreference = await payload.create({
      collection: "user-notification-preferences",
      data: {
        user: user.id,
        type,
        channel,
        preference,
      },
    });

    return Response.json({
      success: true,
      data: newPreference,
    });
  } catch (error) {
    console.error("Error creating user notification preference:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, preference } = body;

    if (!id || typeof preference !== "boolean") {
      return Response.json(
        { error: "Missing required fields: id, preference" },
        { status: 400 },
      );
    }

    const existingPreference = await payload.findByID({
      collection: "user-notification-preferences",
      id,
    });

    const preferenceUserId =
      typeof existingPreference.user === "object" &&
      existingPreference.user !== null
        ? existingPreference.user.id
        : existingPreference.user;

    if (!existingPreference || preferenceUserId !== user.id) {
      return Response.json(
        { error: "Preference not found or access denied" },
        { status: 404 },
      );
    }

    const updatedPreference = await payload.update({
      collection: "user-notification-preferences",
      id,
      data: {
        preference,
      },
    });

    return Response.json({
      success: true,
      data: updatedPreference,
    });
  } catch (error) {
    console.error("Error updating user notification preference:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
