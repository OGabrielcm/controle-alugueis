import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/session-routes";

export default function Home() {
  redirect(LOGIN_PATH);
}
