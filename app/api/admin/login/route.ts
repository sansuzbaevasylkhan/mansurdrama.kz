import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, setAdminCookie } from "@/lib/admin/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Құпия сөзді енгізіңіз" }, { status: 400 });
    }
    if (!checkAdminPassword(password)) {
      return NextResponse.json({ success: false, error: "Құпия сөз қате" }, { status: 401 });
    }
    await setAdminCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Сервер қатесі" }, { status: 500 });
  }
}
