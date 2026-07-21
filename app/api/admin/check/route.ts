import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export async function GET() {
  const authenticated = await getAdminSession();
  return NextResponse.json({ authenticated });
}
