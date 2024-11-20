import { tool } from "@langchain/core/tools";
import { z } from "zod";
import memoryModel from "./Models/memory.model.js";
import dayjs from "dayjs";

export const momentTool = tool(
  async ({ memory, date }) => {
    try {
      await memoryModel.create({
        memory: memory, // Use memory, as per the schema
        date: dayjs(date).toDate(), // Convert date string to Date object
      });
      return "Moment added to memory";
    } catch (error) {
      console.error(error);
      return "Failed to add the moment to memory";
    }
  },
  {
    name: "add_to_memory",
    description:
      "Notes down the memories. Pass the memory and date of the memory as params. The date should be correct",
    schema: z.object({
      memory: z.string().nonempty("Memory cannot be empty"), // Ensure the memory field is a non-empty string
      date: z
        .string()
        .refine((value) => dayjs(value).isValid(), "Invalid date format"), // Accept date as string and validate it
    }),
  }
);

export const retrieveMomentTool = tool(
  async ({ date }) => {
    console.log(date);
    try {
      const moments = await memoryModel.find({
        date: {
          $gte: dayjs(date).startOf("day").toDate(),
          $lte: dayjs(date).endOf("day").toDate(),
        },
      });
      if (moments) {
        return JSON.stringify(
          moments.map((m) => ({
            memory: m.memory,
            time: dayjs(m.date).format("hh:mm A"),
          }))
        );
      } else {
        return "No memories found on this date";
      }
    } catch (error) {
      console.error(error);
      return "Failed to add the moment to memory";
    }
  },
  {
    name: "retrieve_moments_from_date",
    description:
      "Retrieves moments from the memory. Pass date on which the moments needs to retrieved, as params. The date should be correct.",
    schema: z.object({
      date: z
        .string()
        .refine((value) => dayjs(value).isValid(), "Invalid date format"), // Accept date as string and validate it
    }),
  }
);
