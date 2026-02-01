import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { UsersSkill } from "@/payload-types";

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSkills = await payload.find({
      collection: "users-skills",
      where: {
        user: { equals: user.id },
      },
      sort: "skill",
    });

    return Response.json({
      success: true,
      data: userSkills.docs,
    });
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
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
    const { skills } = body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return Response.json(
        {
          error:
            "Missing or invalid required field: skills (must be a non-empty array)",
        },
        { status: 400 },
      );
    }

    // Validate each skill entry
    for (const skillEntry of skills) {
      if (!skillEntry.skillId || typeof skillEntry.learnt !== "boolean") {
        return Response.json(
          {
            error:
              "Each skill entry must have skillId and learnt (boolean) fields",
          },
          { status: 400 },
        );
      }
    }

    const results = [];

    for (const skillEntry of skills) {
      const { skillId, learnt } = skillEntry;

      // Check if the skill already exists for this user
      const existingSkills = await payload.find({
        collection: "users-skills",
        where: {
          user: { equals: user.id },
          skill: { equals: skillId },
        },
      });

      let userSkill: UsersSkill;
      if (existingSkills.docs.length > 0) {
        // Update existing skill
        userSkill = await payload.update({
          collection: "users-skills",
          id: existingSkills.docs[0].id,
          data: {
            learnt,
          },
        });
      } else {
        // Create new skill
        userSkill = await payload.create({
          collection: "users-skills",
          data: {
            user: user.id,
            skill: skillId,
            learnt,
          },
        });
      }

      results.push(userSkill);
    }

    return Response.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error managing user skills:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
