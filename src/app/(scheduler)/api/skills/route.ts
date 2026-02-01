import { getPayload } from "payload";
import config from "@/payload.config";

export const GET = async () => {
  try {
    const payload = await getPayload({ config });

    const skills = await payload.find({
      collection: "skills",
      sort: "title",
    });

    return Response.json({
      success: true,
      data: skills.docs,
      total: skills.totalDocs,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
