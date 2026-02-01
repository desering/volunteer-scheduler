"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Save } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Container, HStack, panda } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/components/ui/table";
import type { Skill, UsersSkill } from "@/payload-types";

interface SkillWithUserStatus extends Skill {
  userSkill?: UsersSkill;
  isLearnt: boolean;
}

export default function SkillsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Record<number, boolean>>(
    {},
  );
  const queryClient = useQueryClient();

  // Fetch all skills
  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await fetch("/api/skills");
      if (!response.ok) throw new Error("Failed to fetch skills");
      const data = await response.json();
      return data.data as Skill[];
    },
  });

  // Fetch user's skills
  const { data: userSkills = [], isLoading: userSkillsLoading } = useQuery({
    queryKey: ["user-skills"],
    queryFn: async () => {
      const response = await fetch("/api/users/me/skills");
      if (!response.ok) throw new Error("Failed to fetch user skills");
      const data = await response.json();
      return data.data as UsersSkill[];
    },
  });

  // Update user skills mutation
  const updateSkillsMutation = useMutation({
    mutationFn: async (skillsData: { skillId: number; learnt: boolean }[]) => {
      const response = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: skillsData }),
      });
      if (!response.ok) throw new Error("Failed to update skills");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills"] });
      setIsEditing(false);
    },
  });

  // Combine skills with user status
  const skillsWithStatus: SkillWithUserStatus[] = skills.map((skill) => {
    const userSkill = userSkills.find(
      (us) =>
        (typeof us.skill === "object" ? us.skill.id : us.skill) === skill.id,
    );
    return {
      ...skill,
      userSkill,
      isLearnt: userSkill?.learnt ?? false,
    };
  });

  // Sort: learnt skills first
  const sortedSkills = [...skillsWithStatus].sort((a, b) => {
    if (a.isLearnt && !b.isLearnt) return -1;
    if (!a.isLearnt && b.isLearnt) return 1;
    return a.title.localeCompare(b.title);
  });

  const handleEdit = () => {
    const initialSelected: Record<number, boolean> = {};
    skillsWithStatus.forEach((skill) => {
      initialSelected[skill.id] = skill.isLearnt;
    });
    setSelectedSkills(initialSelected);
    setIsEditing(true);
  };

  const handleSave = () => {
    const skillsToUpdate = Object.entries(selectedSkills).map(
      ([skillId, learnt]) => ({
        skillId: skillId as unknown as number,
        learnt,
      }),
    );

    updateSkillsMutation.mutate(skillsToUpdate);
  };

  const handleCheckboxChange = (
    skillId: number,
    checked: boolean | { checked: boolean },
  ) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: typeof checked === "boolean" ? checked : checked.checked,
    }));
  };

  if (skillsLoading || userSkillsLoading) {
    return <div className="p-6">Loading skills...</div>;
  }

  return (
    <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
      <HStack
        alignItems="baseline"
        justifyContent="space-between"
        marginBottom="8"
      >
        <panda.h1 fontSize="xl" fontWeight="medium" marginBottom="8">
          My skills
        </panda.h1>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={updateSkillsMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSkillsMutation.isPending ? "Saving..." : "Save"}
          </Button>
        )}
      </HStack>

      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header className="w-16">Badge</Table.Header>
            <Table.Header>Skill</Table.Header>
            <Table.Header className="w-32 text-center">Learnt</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {sortedSkills.map((skill) => (
            <Table.Row key={skill.id}>
              <Table.Cell>
                {skill.badgeImage && (
                  <Image
                    src={skill.badgeImage}
                    alt={`${skill.title} badge`}
                    className="w-8 h-8 rounded"
                  />
                )}
              </Table.Cell>
              <Table.Cell>{skill.title}</Table.Cell>
              <Table.Cell className="text-center">
                <Checkbox.Root
                  checked={
                    isEditing
                      ? (selectedSkills[skill.id] ?? false)
                      : skill.isLearnt
                  }
                  disabled={!isEditing}
                  onCheckedChange={(checked: boolean) =>
                    handleCheckboxChange(skill.id, checked)
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {sortedSkills.length === 0 && (
        <panda.div className="text-center py-8 text-muted-foreground">
          No skills available
        </panda.div>
      )}
    </Container>
  );
}
