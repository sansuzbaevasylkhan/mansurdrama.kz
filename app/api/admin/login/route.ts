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
    try {
      await setAdminCookie();
    } catch (cookieErr) {
      console.error('Cookie set error:', cookieErr);
      return NextResponse.json({ success: false, error: "Сессияны орнату мүмкін болмады" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Login route error:', err);
    return NextResponse.json({ success: false, error: err.message || "Сервер қатесі" }, { status: 500 });
  }
}
