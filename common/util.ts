import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export const userLogin = async (id: number, url?: string) => {
  const session = await getSession();
  session.id = id;
  await session.save();
  return redirect(url || "/profile");
};
